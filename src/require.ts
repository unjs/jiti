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
    return nativeImportOrRequire(ctx, id, opts.async);
  } else if (id.startsWith("file:")) {
    id = fileURLToPath(id);
  } else if (id.startsWith("data:")) {
    if (!opts.async) {
      throw new Error(
        "`data:` URLs are only supported in ESM context. Use `import` or `jiti.import` instead.",
      );
    }
    debug(ctx, "[native]", "[data]", "[import]", id);
    return nativeImportOrRequire(ctx, id, true);
  }

  // Check for builtin node module like fs
  if (builtinModules.includes(id) || id === ".pnp.js" /* #24 */) {
    return nativeImportOrRequire(ctx, id, opts.async);
  }

  // Check for virtual modules (e.g., bundled modules in compiled Bun binaries)
  if (ctx.opts.virtualModules && id in ctx.opts.virtualModules) {
    debug(ctx, "[virtual]", id);
    const mod = ctx.opts.virtualModules[id];
    return opts.async
      ? Promise.resolve(jitiInteropDefault(ctx, mod))
      : jitiInteropDefault(ctx, mod);
  }

  // Experimental Bun support
  if (ctx.opts.tryNative && !ctx.opts.transformOptions) {
    try {
      id = jitiResolve(ctx, id, opts);
      if (!id && opts.try) {
        return undefined;
      }
      // `tryNative` bypasses the loader below, so a `with { type: ... }` clause
      // has to be validated here too — otherwise a native loader that accepts
      // JSON without attributes (Bun does) resolves the module before the
      // mismatch check in the `.json` branch ever runs (#483).
      assertImportAttributes(
        id,
        (opts as { attributes?: Record<string, string> }).attributes,
      );
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
            return jitiInteropDefault(ctx, m);
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
    // Import attributes (`with { type: "json" }`) are lossless metadata: the
    // transformer keeps them and hands them over so they can be validated
    // instead of being silently dropped (#483).
    assertImportAttributes(
      filename,
      (opts as { attributes?: Record<string, string> }).attributes,
    );
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
  if (ctx.opts.moduleCache) {
    const cacheEntry = ctx.nativeRequire.cache[filename];
    if (cacheEntry?.loaded) {
      return jitiInteropDefault(ctx, cacheEntry.exports);
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

/**
 * Reject a `with { type: ... }` clause that contradicts the resolved module
 * format. Native `import()`/`require()` would do this for us, but jiti loads
 * both JSON and transformed modules through its own paths, so the check has to
 * be explicit on every loader path that can resolve a JSON file.
 */
export function assertImportAttributes(
  filename: string,
  attributes: Record<string, string> | undefined,
) {
  const type = attributes?.type;
  if (type === undefined || type === "json") {
    return;
  }
  if (extname(filename) !== ".json") {
    return;
  }
  throw Object.assign(
    new TypeError(
      `Import attribute "type" with value "${type}" is not supported in ${filename}`,
    ),
    { code: "ERR_IMPORT_ATTRIBUTE_UNSUPPORTED" },
  );
}
