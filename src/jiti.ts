import { readFileSync } from "fs";
import { Module, builtinModules } from "module";
import { fileURLToPath } from "url";
import { extname } from "pathe";
import { addHook } from "pirates";

import { TransformOptions, JITIOptions } from "./types";
import { resolveJitiOptions } from "./options";
import { createResolver } from "./resolver";
import { createJitiContext } from "./context";
import { createCache } from "./cache";
import { EvalModuleOptions, evalModule } from "./eval";

export type { JITIOptions, TransformOptions } from "./types";

export type Require = typeof require;
export type Module = typeof module;

export type ModuleCache = Record<string, Module>;

export interface JITI extends Require {
  transform: (opts: TransformOptions) => string;
  register: () => () => void;
  evalModule: (source: string, options?: EvalModuleOptions) => unknown;
  /** @experimental Behavior of `jiti.import` might change in the future. */
  import: (id: string) => Promise<unknown>;
}

export default function createJITI(
  _filename: string,
  userOptions: JITIOptions = {},
  parentModule?: Module,
  parentCache?: ModuleCache,
): JITI {
  const opts = resolveJitiOptions(userOptions);
  const ctx = createJitiContext(opts, _filename);
  const resolver = createResolver(ctx, parentModule);
  const cache = createCache(ctx);

  function jiti(id: string) {
    const cache = parentCache || {};

    // Check for node: and file: protocol
    if (id.startsWith("node:")) {
      id = id.slice(5);
    } else if (id.startsWith("file:")) {
      id = fileURLToPath(id);
    }

    // Check for builtin node module like fs
    if (builtinModules.includes(id) || id === ".pnp.js" /* #24 */) {
      return ctx.nativeRequire(id);
    }

    // Experimental Bun support
    if (opts.experimentalBun && !opts.transformOptions) {
      try {
        ctx.debug(`[bun] [native] ${id}`);
        const _mod = ctx.nativeRequire(id);
        if (opts.requireCache === false) {
          delete ctx.nativeRequire.cache[id];
        }
        return ctx._interopDefault(_mod);
      } catch (error: any) {
        ctx.debug(`[bun] Using fallback for ${id} because of an error:`, error);
      }
    }

    // Resolve path
    const filename = resolver._resolve(id);
    const ext = extname(filename);

    // Check for .json modules
    if (ext === ".json") {
      ctx.debug("[json]", filename);
      const jsonModule = ctx.nativeRequire(id);
      Object.defineProperty(jsonModule, "default", { value: jsonModule });
      return jsonModule;
    }

    // Unknown format
    if (ext && !opts.extensions!.includes(ext)) {
      ctx.debug("[unknown]", filename);
      return ctx.nativeRequire(id);
    }

    // Force native modules
    if (ctx.isNativeRe.test(filename)) {
      ctx.debug("[native]", filename);
      return ctx.nativeRequire(id);
    }

    // Check for CJS cache
    if (cache[filename]) {
      return ctx._interopDefault(cache[filename]?.exports);
    }
    if (opts.requireCache && ctx.nativeRequire.cache[filename]) {
      return ctx._interopDefault(ctx.nativeRequire.cache[filename]?.exports);
    }

    // Read source
    const source = readFileSync(filename, "utf8");

    // Evaluate module
    return evalModule(
      source,
      { id, filename, ext, cache },
      ctx,
      resolver,
      parentCache,
      parentModule,
    );
  }

  function register() {
    return addHook(
      (source: string, filename: string) =>
        jiti.transform({ source, filename, ts: !!/\.[cm]?ts$/.test(filename) }),
      { exts: opts.extensions },
    );
  }

  jiti.resolve = resolver._resolve;
  jiti.cache = opts.requireCache ? ctx.nativeRequire.cache : {};
  jiti.extensions = ctx.nativeRequire.extensions;
  jiti.main = ctx.nativeRequire.main;
  jiti.transform = transform;
  jiti.register = register;
  jiti.import = async (id: string) => await jiti(id);
  jiti.evalModule = (source: string, evalOptions?: EvalModuleOptions) =>
    evalModule(source, evalOptions, ctx, resolver, parentCache);

  return jiti;
}
