import { Module } from "node:module";
import { writeFileSync, mkdirSync } from "node:fs";
import { unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { performance } from "node:perf_hooks";
import vm from "node:vm";
import { dirname, basename, extname, join } from "pathe";
import { hasESMSyntax, pathToFileURL } from "mlly";
import {
  debug,
  jitiInteropDefault,
  readNearestPackageJSON,
  wrapModule,
} from "./utils";
import type { ModuleCache, Context, EvalModuleOptions } from "./types";
import { jitiResolve } from "./resolve";
import { jitiRequire, nativeImportOrRequire } from "./require";
import createJiti from "./jiti";
import { transform } from "./transform";

export function evalModule(
  ctx: Context,
  source: string,
  evalOptions: EvalModuleOptions = {},
): any {
  // Resolve options
  const id =
    evalOptions.id ||
    (evalOptions.filename
      ? basename(evalOptions.filename)
      : `_jitiEval.${evalOptions.ext || (evalOptions.async ? "mjs" : "js")}`);
  const filename =
    evalOptions.filename || jitiResolve(ctx, id, { async: evalOptions.async });
  const ext = evalOptions.ext || extname(filename);
  const cache = (evalOptions.cache || ctx.parentCache || {}) as ModuleCache;

  // Transpile
  const isTypescript = /\.[cm]?tsx?$/.test(ext);
  const isESM =
    ext === ".mjs" ||
    (ext === ".js" && readNearestPackageJSON(filename)?.type === "module");
  const isCommonJS = ext === ".cjs";
  const needsTranspile =
    evalOptions.forceTranspile ??
    (!isCommonJS && // CommonJS skips transpile
      !(isESM && evalOptions.async) && // In async mode, we can skip native ESM as well
      // prettier-ignore
      (isTypescript || isESM || ctx.isTransformRe.test(filename) || hasESMSyntax(source)));
  const start = performance.now();
  if (needsTranspile) {
    source = transform(ctx, {
      filename,
      source,
      ts: isTypescript,
      async: evalOptions.async ?? false,
      jsx: ctx.opts.jsx,
    });
    const time = Math.round((performance.now() - start) * 1000) / 1000;
    debug(
      ctx,
      "[transpile]",
      evalOptions.async ? "[esm]" : "[cjs]",
      filename,
      `(${time}ms)`,
    );
  } else {
    debug(
      ctx,
      "[native]",
      evalOptions.async ? "[import]" : "[require]",
      filename,
    );

    if (evalOptions.async) {
      return Promise.resolve(
        nativeImportOrRequire(ctx, filename, evalOptions.async),
      ).catch((error: any) => {
        debug(ctx, "Native import error:", error);
        debug(ctx, "[fallback]", filename);
        return evalModule(ctx, source, {
          ...evalOptions,
          forceTranspile: true,
        });
      });
    } else {
      try {
        return nativeImportOrRequire(ctx, filename, evalOptions.async);
      } catch (error: any) {
        debug(ctx, "Native require error:", error);
        debug(ctx, "[fallback]", filename);
        source = transform(ctx, {
          filename,
          source,
          ts: isTypescript,
          async: evalOptions.async ?? false,
          jsx: ctx.opts.jsx,
        });
      }
    }
  }

  // Compile module
  const mod = new Module(filename);
  mod.filename = filename;
  if (ctx.parentModule) {
    mod.parent = ctx.parentModule;
    if (
      Array.isArray(ctx.parentModule.children) &&
      !ctx.parentModule.children.includes(mod)
    ) {
      ctx.parentModule.children.push(mod);
    }
  }

  const _jiti = createJiti(
    filename,
    ctx.opts,
    {
      parentModule: mod,
      parentCache: cache,
      nativeImport: ctx.nativeImport,
      onError: ctx.onError,
      createRequire: ctx.createRequire,
    },
    true /* isNested */,
  );

  mod.require = _jiti as typeof mod.require;

  mod.path = dirname(filename);

  // @ts-ignore
  mod.paths = Module._nodeModulePaths(mod.path);

  // Set CJS cache before eval
  cache[filename] = mod as ModuleCache[string];
  if (ctx.opts.moduleCache) {
    ctx.nativeRequire.cache[filename] = mod;
  }

  // Compile wrapped script
  let compiled;
  const wrapped = wrapModule(source, { async: evalOptions.async });
  try {
    compiled = vm.runInThisContext(wrapped, {
      filename,
      lineOffset: 0,
      displayErrors: false,
    });
  } catch (error: any) {
    if (error.name === "SyntaxError" && evalOptions.async && ctx.nativeImport) {
      // Support cases such as import.meta.[custom]
      debug(ctx, "[esm]", "[import]", "[fallback]", filename);
      compiled = esmEval(
        ctx,
        wrapped,
        filename,
        ctx.nativeImport!,
        ctx.opts.esmEvalTempFile,
      );
    } else {
      if (ctx.opts.moduleCache) {
        delete ctx.nativeRequire.cache[filename];
      }
      ctx.onError!(error);
    }
  }

  // Evaluate module
  let evalResult;
  try {
    evalResult = compiled(
      mod.exports,
      mod.require,
      mod,
      mod.filename,
      dirname(mod.filename),
      _jiti.import,
      _jiti.esmResolve,
    );
  } catch (error: any) {
    if (ctx.opts.moduleCache) {
      delete ctx.nativeRequire.cache[filename];
    }
    ctx.onError!(error);
  }

  function next() {
    // Check for parse errors
    if (mod.exports && mod.exports.__JITI_ERROR__) {
      const { filename, line, column, code, message } =
        mod.exports.__JITI_ERROR__;
      const loc = `${filename}:${line}:${column}`;
      const err = new Error(`${code}: ${message} \n ${loc}`);
      Error.captureStackTrace(err, jitiRequire);
      ctx.onError!(err);
    }

    // Set as loaded
    mod.loaded = true;

    // interopDefault
    const _exports = jitiInteropDefault(ctx, mod.exports);

    // Return exports
    return _exports;
  }

  return evalOptions.async ? Promise.resolve(evalResult).then(next) : next();
}

function esmEval(
  ctx: Context,
  code: string,
  filename: string,
  nativeImport: (id: string) => Promise<any>,
  forceTempFile?: boolean,
) {
  const wrapped = `export default ${code}`;
  const uri = forceTempFile
    ? undefined
    : `data:text/javascript;base64,${Buffer.from(wrapped).toString("base64")}`;
  return (...args: any[]) => {
    let tempFile: string | undefined;
    const importViaTempFile = () => {
      tempFile = writeEsmTempFile(wrapped, filename);
      debug(ctx, "[esm]", "[tempfile]", tempFile);
      return nativeImport(pathToFileURL(tempFile));
    };
    const modPromise = uri
      ? nativeImport(uri).catch((error: any) => {
          // Fallback to temp file on ENAMETOOLONG (encrypted home dirs /
          // strict NAME_MAX filesystems).
          if (error?.code !== "ENAMETOOLONG") {
            throw error;
          }
          return importViaTempFile();
        })
      : importViaTempFile();
    return modPromise
      .then((mod) => mod.default(...args))
      .finally(() => {
        if (tempFile) {
          unlink(tempFile).catch(() => {});
        }
      });
  };
}

function writeEsmTempFile(source: string, filename: string): string {
  const tempDir = join(tmpdir(), "jiti-esm");
  try {
    mkdirSync(tempDir, { recursive: true });
  } catch {}
  const tempFile = join(
    tempDir,
    `${basename(filename, extname(filename))}-${Date.now()}-${Math.random().toString(36).slice(2)}.mjs`,
  );
  // Babel plugins rewrite import.meta.url/dirname/filename, so the temp path doesn't leak to user code.
  writeFileSync(tempFile, source);
  return tempFile;
}
