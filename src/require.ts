import type { Context, JitiResolveOptions } from "./types";
import { readFileSync } from "node:fs";
import { builtinModules } from "node:module";
import { fileURLToPath } from "node:url";
import { extname } from "pathe";
import { applyJitiInterop, normalizeWindowsImportId } from "./utils";
import { debug } from "./utils";
import { jitiResolve } from "./resolve";
import { evalModule } from "./eval";

export function jitiRequire(
  ctx: Context,
  id: string,
  opts: JitiResolveOptions & { async: boolean; interop?: boolean },
) {
  const cache = ctx.parentCache || {};

  // Check for node:, file:, and data: protocols
  if (id.startsWith("node:")) {
    return nativeImportOrRequire(ctx, id, opts.async, opts.interop);
  } else if (id.startsWith("file:")) {
    id = fileURLToPath(id);
  } else if (id.startsWith("data:")) {
    if (!opts.async) {
      throw new Error(
        "`data:` URLs are only supported in ESM context. Use `import` or `jiti.import` instead.",
      );
    }
    debug(ctx, "[native]", "[data]", "[import]", id);
    return nativeImportOrRequire(ctx, id, true, opts.interop);
  }

  // Check for builtin node module like fs
  if (builtinModules.includes(id) || id === ".pnp.js" /* #24 */) {
    return nativeImportOrRequire(ctx, id, opts.async, opts.interop);
  }

  // Check for virtual modules (e.g., bundled modules in compiled Bun binaries)
  if (ctx.opts.virtualModules && id in ctx.opts.virtualModules) {
    debug(ctx, "[virtual]", id);
    const mod = ctx.opts.virtualModules[id];
    return opts.async
      ? Promise.resolve(applyJitiInterop(ctx, mod, opts.interop ?? true))
      : applyJitiInterop(ctx, mod, opts.interop ?? true);
  }

  // Experimental Bun support
  if (ctx.opts.tryNative && !ctx.opts.transformOptions) {
    try {
      id = jitiResolve(ctx, id, opts);
      if (!id && opts.try) {
        return undefined;
      }
      debug(
        ctx,
        "[try-native]",
        opts.async && ctx.nativeImport ? "[import]" : "[require]",
        id,
      );
      if (opts.async && ctx.nativeImport) {
        return ctx
          .nativeImport(id)
          .then((m: any) => {
            if (ctx.opts.moduleCache === false) {
              delete ctx.nativeRequire.cache[id];
            }
            return applyJitiInterop(ctx, m, opts.interop ?? true);
          })
          .catch((error) => {
            debug(
              ctx,
              `[try-native] Using fallback for ${id} because of an error:`,
              error,
            );
            return (jitiRequire as any)(
              // Try again without native
              { ...ctx, opts: { ...ctx.opts, tryNative: false } },
              id,
              opts,
            );
          });
      } else {
        const _mod = ctx.nativeRequire(id);
        if (ctx.opts.moduleCache === false) {
          delete ctx.nativeRequire.cache[id];
        }
        return applyJitiInterop(ctx, _mod, opts.interop ?? true);
      }
    } catch (error: any) {
      debug(
        ctx,
        `[try-native] Using fallback for ${id} because of an error:`,
        error,
      );
    }
  }

  // Resolve path
  const filename = jitiResolve(ctx, id, opts);
  if (!filename && opts.try) {
    return undefined;
  }
  const ext = extname(filename);

  // Check for .json modules
  if (ext === ".json") {
    debug(ctx, "[json]", filename);
    const jsonModule = ctx.nativeRequire(filename);
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
    debug(
      ctx,
      "[native]",
      "[unknown]",
      opts.async ? "[import]" : "[require]",
      filename,
    );
    return nativeImportOrRequire(ctx, filename, opts.async, opts.interop);
  }

  // Force native modules
  if (ctx.isNativeRe.test(filename)) {
    debug(ctx, "[native]", opts.async ? "[import]" : "[require]", filename);
    return nativeImportOrRequire(ctx, filename, opts.async, opts.interop);
  }

  // Check for runtime cache
  if (cache[filename]) {
    return applyJitiInterop(
      ctx,
      cache[filename]?.exports,
      opts.interop ?? true,
    );
  }
  if (ctx.opts.moduleCache) {
    const cacheEntry = ctx.nativeRequire.cache[filename];
    if (cacheEntry?.loaded) {
      return applyJitiInterop(ctx, cacheEntry.exports, opts.interop ?? true);
    }
  }

  // Read source
  const source = readFileSync(filename, "utf8");

  // Evaluate module
  return evalModule(ctx, source, {
    id,
    filename,
    ext,
    cache,
    async: opts.async,
    interop: opts.interop,
  });
}

export function nativeImportOrRequire(
  ctx: Context,
  id: string,
  async?: boolean,
  interop?: boolean,
) {
  return async && ctx.nativeImport
    ? ctx
        .nativeImport(normalizeWindowsImportId(id))
        .then((m: any) => applyJitiInterop(ctx, m, interop ?? true))
    : applyJitiInterop(ctx, ctx.nativeRequire(id), interop ?? true);
}
