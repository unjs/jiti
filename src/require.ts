import { readFileSync } from "node:fs";
import { builtinModules } from "node:module";
import { fileURLToPath } from "node:url";
import { extname } from "pathe";
import { jitiInteropDefault, normalizeWindowsImportId } from "./utils";
import { debug } from "./utils";
import type { Context } from "./types";
import { jitiResolve } from "./resolve";
import { evalModule } from "./eval";

export function jitiRequire(ctx: Context, id: string, async: boolean) {
  const cache = ctx.parentCache || {};

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
  if (ctx.opts.experimentalBun && !ctx.opts.transformOptions) {
    try {
      debug(ctx, `[bun] [native] ${id}`);
      id = jitiResolve(ctx, id);
      if (async && ctx.nativeImport) {
        return ctx.nativeImport(id).then((m: any) => {
          if (ctx.opts.moduleCache === false) {
            delete ctx.nativeRequire.cache[id];
          }
          return jitiInteropDefault(ctx, m);
        });
      } else {
        const _mod = ctx.nativeRequire(id);
        if (ctx.opts.moduleCache === false) {
          delete ctx.nativeRequire.cache[id];
        }
        return jitiInteropDefault(ctx, _mod);
      }
    } catch (error: any) {
      debug(ctx, `[bun] Using fallback for ${id} because of an error:`, error);
    }
  }

  // Resolve path
  const filename = jitiResolve(ctx, id);
  const ext = extname(filename);

  // Check for .json modules
  if (ext === ".json") {
    debug(ctx, "[json]", filename);
    const jsonModule = ctx.nativeRequire(id);
    if (jsonModule && !("default" in jsonModule)) {
      Object.defineProperty(jsonModule, "default", {
        value: jsonModule,
        enumerable: false,
      });
    }
    return jsonModule;
  }

  // Unknown format
  if (ext && !ctx.opts.extensions!.includes(ext)) {
    debug(ctx, "[unknown]", filename);
    return nativeImportOrRequire(ctx, id, async);
  }

  // Force native modules
  if (ctx.isNativeRe.test(filename)) {
    debug(ctx, `[native] ${async ? " [esm]" : ": [cjs]"}`, filename);
    return nativeImportOrRequire(ctx, id, async);
  }

  // Check for runtime cache
  if (cache[filename]) {
    return jitiInteropDefault(ctx, cache[filename]?.exports);
  }
  if (ctx.opts.moduleCache && ctx.nativeRequire.cache[filename]) {
    return jitiInteropDefault(ctx, ctx.nativeRequire.cache[filename]?.exports);
  }

  // Read source
  const source = readFileSync(filename, "utf8");

  // Evaluate module
  return evalModule(ctx, source, {
    id,
    filename,
    ext,
    cache,
    async,
  });
}

export function nativeImportOrRequire(
  ctx: Context,
  id: string,
  async?: boolean,
) {
  return async && ctx.nativeImport
    ? ctx
        .nativeImport(normalizeWindowsImportId(id))
        .then((m: any) => jitiInteropDefault(ctx, m))
    : jitiInteropDefault(ctx, ctx.nativeRequire(id));
}
