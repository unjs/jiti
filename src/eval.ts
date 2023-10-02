import { performance } from "perf_hooks";
import { dirname, basename, extname } from "pathe";
import vm from "vm";
import type { Module, ModuleCache } from "./jiti";
import { join } from "pathe";
import type { PackageJson } from "pkg-types";
import { readFileSync } from "fs";

export type EvalModuleOptions = Partial<{
  id: string;
  filename: string;
  ext: string;
  cache: ModuleCache;
}>;
import { JITIContext } from "./context";
import { JITIResolver } from "./resolver";
import { hasESMSyntax } from "mlly";
import { Module as NodeModule } from "module";

export function evalModule(
  source: string,
  evalOptions: EvalModuleOptions = {},
  ctx: JITIContext,
  resolver: JITIResolver,
  createJITI: typeof import("./jiti").default,
  parentCache?: ModuleCache,
  parentModule?: Module,
) {
  // Resolve options
  const id =
    evalOptions.id ||
    (evalOptions.filename
      ? basename(evalOptions.filename)
      : `_jitiEval.${evalOptions.ext || ".js"}`);
  const filename = evalOptions.filename || resolver._resolve(id);
  const ext = evalOptions.ext || extname(filename);
  const cache = (evalOptions.cache || parentCache || {}) as ModuleCache;

  // Transpile
  const isTypescript = ext === ".ts" || ext === ".mts" || ext === ".cts";
  const isNativeModule =
    ext === ".mjs" ||
    (ext === ".js" && readNearestPackageJSON(filename)?.type === "module");
  const isCommonJS = ext === ".cjs";
  const needsTranspile =
    !isCommonJS &&
    (isTypescript ||
      isNativeModule ||
      ctx.isTransformRe.test(filename) ||
      hasESMSyntax(source) ||
      (ctx.opts.legacy && detectLegacySyntax(source)));

  const start = performance.now();
  if (needsTranspile) {
    source = transform({ filename, source, ts: isTypescript });
    const time = Math.round((performance.now() - start) * 1000) / 1000;
    ctx.debug(
      `[transpile]${isNativeModule ? " [esm]" : ""}`,
      filename,
      `(${time}ms)`,
    );
  } else {
    try {
      ctx.debug("[native]", filename);
      return ctx._interopDefault(ctx.nativeRequire(id));
    } catch (error: any) {
      ctx.debug("Native require error:", error);
      ctx.debug("[fallback]", filename);
      source = transform({ filename, source, ts: isTypescript });
    }
  }

  // Compile module
  const mod = new NodeModule(filename);
  mod.filename = filename;
  if (parentModule) {
    mod.parent = parentModule;
    if (
      Array.isArray(parentModule.children) &&
      !parentModule.children.includes(mod)
    ) {
      parentModule.children.push(mod);
    }
  }

  mod.require = createJITI(filename, opts, mod, cache);

  // @ts-ignore
  mod.path = dirname(filename);

  // @ts-ignore
  mod.paths = Module._nodeModulePaths(mod.path);

  // Set CJS cache before eval
  cache[filename] = mod;
  if (ctx.opts.requireCache) {
    ctx.nativeRequire.cache[filename] = mod;
  }

  // Compile wrapped script
  let compiled;
  try {
    // @ts-ignore
    // mod._compile wraps require and require.resolve to global function
    compiled = vm.runInThisContext(Module.wrap(source), {
      filename,
      lineOffset: 0,
      displayErrors: false,
    });
  } catch (error: any) {
    if (ctx.opts.requireCache) {
      delete ctx.nativeRequire.cache[filename];
    }
    ctx.opts.onError!(error);
  }

  // Evaluate module
  try {
    compiled(
      mod.exports,
      mod.require,
      mod,
      mod.filename,
      dirname(mod.filename),
    );
  } catch (error: any) {
    if (ctx.opts.requireCache) {
      delete ctx.nativeRequire.cache[filename];
    }
    ctx.opts.onError!(error);
  }

  // Check for parse errors
  if (mod.exports && mod.exports.__JITI_ERROR__) {
    const { filename, line, column, code, message } =
      mod.exports.__JITI_ERROR__;
    const loc = `${filename}:${line}:${column}`;
    const err = new Error(`${code}: ${message} \n ${loc}`);
    // TODO: Capture up to jiti
    Error.captureStackTrace(err, evalModule);
    ctx.opts.onError!(err);
  }

  // Set as loaded
  mod.loaded = true;

  // interopDefault
  const _exports = ctx._interopDefault(mod.exports);

  // Return exports
  return _exports;
}

export function readNearestPackageJSON(path: string): PackageJson | undefined {
  while (path && path !== "." && path !== "/") {
    path = join(path, "..");
    try {
      const pkg = readFileSync(join(path, "package.json"), "utf8");
      try {
        return JSON.parse(pkg);
      } catch {}
      break;
    } catch {}
  }
}

export function detectLegacySyntax(code: string) {
  return code.match(/\?\.|\?\?/);
}
