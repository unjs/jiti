import { resolveAlias } from "pathe/utils";
import { resolvePathSync } from "mlly";
import type { Context } from "./types";

const JS_EXT_RE = /\.(c|m)?j(sx?)$/;
const TS_EXT_RE = /\.(c|m)?t(sx?)$/;

export function jitiResolve(
  ctx: Context,
  id: string,
  options?: { paths?: string[] },
) {
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
          url: ctx.url,
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
  for (const ext of ctx.additionalExts) {
    resolved =
      tryNativeRequireResolve(ctx, id + ext, options) ||
      tryNativeRequireResolve(ctx, id + "/index" + ext, options);
    if (resolved) {
      return resolved;
    }
    // Try resolving .ts files with .js extension
    if (TS_EXT_RE.test(ctx.parentModule?.filename || "")) {
      resolved = tryNativeRequireResolve(
        ctx,
        id.replace(JS_EXT_RE, ".$1t$2"),
        options,
      );
      if (resolved) {
        return resolved;
      }
    }
  }
  throw err;
}

export function tryNativeRequireResolve(
  ctx: Context,
  id: string,
  options?: { paths?: string[] },
) {
  try {
    return ctx.nativeRequire.resolve(id, options);
  } catch {
    // Ignore errors
  }
}
