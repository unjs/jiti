import { Module } from "node:module";
import { performance } from "node:perf_hooks";
import vm from "node:vm";
import { dirname, basename, extname } from "pathe";
import { hasESMSyntax } from "mlly";
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
) {
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
    !isCommonJS && // CommonJS skips transpile
    !(isESM && evalOptions.async) && // In async mode, we can skip native ESM as well
    (isTypescript ||
      isESM ||
      ctx.isTransformRe.test(filename) ||
      hasESMSyntax(source));
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
    try {
      debug(
        ctx,
        "[native]",
        evalOptions.async ? "[import]" : "[require]",
        filename,
      );
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

  mod.require = _jiti;

  // @ts-ignore
  mod.path = dirname(filename);

  // @ts-ignore
  mod.paths = Module._nodeModulePaths(mod.path);

  // Set CJS cache before eval
  cache[filename] = mod;
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
      compiled = esmEval(wrapped, ctx.nativeImport!);
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

function esmEval(code: string, nativeImport: (id: string) => Promise<any>) {
  const uri = `data:text/javascript;base64,${Buffer.from(`export default ${code}`).toString("base64")}`;
  return (...args: any[]) =>
    nativeImport(uri).then((mod) => mod.default(...args));
}
