import { pathToFileURL } from "url";
import { resolveAlias } from "pathe/utils";
import { resolvePathSync } from "mlly";
import type { Module } from "./jiti";
import { JITIContext } from "./context";

const JS_EXT_RE = /\.(c|m)?j(sx?)$/;
const TS_EXT_RE = /\.(c|m)?t(sx?)$/;

export type JITIResolver = ReturnType<typeof createResolver>;

export function createResolver(ctx: JITIContext, parentModule?: Module) {
  const tryResolve = (id: string, options?: { paths?: string[] }) => {
    try {
      return ctx.nativeRequire.resolve(id, options);
    } catch {}
  };

  const _url = pathToFileURL(ctx._filename);
  const _additionalExts = [...(ctx.opts.extensions as string[])].filter(
    (ext) => ext !== ".js",
  );

  const _resolve = (id: string, options?: { paths?: string[] }) => {
    let resolved, err;

    // Resolve alias
    if (ctx.alias) {
      id = resolveAlias(id, ctx.alias);
    }

    // Try ESM resolve
    if (ctx.opts.esmResolve) {
      const conditionSets = [
        ["node", "require"],
        ["node", "import"],
      ];
      for (const conditions of conditionSets) {
        try {
          resolved = resolvePathSync(id, {
            url: _url,
            conditions,
            extensions: ctx.opts.extensions,
          });
        } catch (error) {
          err = error;
        }
        if (resolved) {
          return resolved;
        }
      }
    }

    // Try native require resolve
    try {
      return ctx.nativeRequire.resolve(id, options);
    } catch (error) {
      err = error;
    }
    for (const ext of _additionalExts) {
      resolved =
        tryResolve(id + ext, options) ||
        tryResolve(id + "/index" + ext, options);
      if (resolved) {
        return resolved;
      }
      // Try resolving .ts files with .js extension
      if (TS_EXT_RE.test(parentModule?.filename || "")) {
        resolved = tryResolve(id.replace(JS_EXT_RE, ".$1t$2"), options);
        if (resolved) {
          return resolved;
        }
      }
    }
    throw err;
  };

  _resolve.paths = ctx.nativeRequire.resolve.paths;

  return {
    _resolve,
  };
}
