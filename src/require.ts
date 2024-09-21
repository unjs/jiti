import type { Context, JitiResolveOptions } from "./types";
import { readFileSync } from "node:fs";
import { builtinModules } from "node:module";
import { fileURLToPath } from "node:url";
import { extname } from "pathe";
import { jitiInteropDefault, normalizeWindowsImportId } from "./utils";
import { debug } from "./utils";
import { jitiResolve } from "./resolve";
import { evalModule } from "./eval";

export function jitiRequire(
  ctx: Context,
  id: string,
  opts: JitiResolveOptions & { async: boolean },
) {
  const cache = ctx.parentCache || {};

  // Check for node:, file:, and data: protocols
  if (id.startsWith("node:")) {
    id = id.slice(5);
  } else if (id.startsWith("file:")) {
    id = fileURLToPath(id);
  } else if (id.startsWith("data:")) {
    debug(ctx, "[native]", "[data]", opts.async ? "[import]" : "[require]", id);
    return nativeImportOrRequire(ctx, id, opts.async);
  }

  // Check for builtin node module like fs
  if (builtinModules.includes(id) || id === ".pnp.js" /* #24 */) {
    return nativeImportOrRequire(ctx, id, opts.async);
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
    return nativeImportOrRequire(ctx, filename, opts.async);
  }

  // Force native modules
  if (ctx.isNativeRe.test(filename)) {
    debug(ctx, "[native]", opts.async ? "[import]" : "[require]", filename);
    return nativeImportOrRequire(ctx, filename, opts.async);
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
    async: opts.async,
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
