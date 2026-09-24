import { resolveAlias } from "pathe/utils";
import { fileURLToPath, resolvePathSync } from "mlly";
import { join, dirname } from "pathe";
import type { Context, JitiResolveOptions } from "./types";
import { isDir } from "./utils";

const JS_EXT_RE = /\.(c|m)?j(sx?)$/;
const TS_EXT_RE = /\.(c|m)?t(sx?)$/;

// pathe's resolveAlias only matches a literal prefix, so a documented glob
// alias like `{ "#/*": "./src/*" }` never matches anything (the `*` is never
// substituted). A single trailing `*` is equivalent to a plain prefix alias
// once stripped, so normalize it to the form pathe already understands.
export function normalizeAliasWildcards(
  alias: Record<string, string>,
): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const [from, to] of Object.entries(alias)) {
    normalized[from.endsWith("*") ? from.slice(0, -1) : from] = to.endsWith("*")
      ? to.slice(0, -1)
      : to;
  }
  return normalized;
}

export function jitiResolve(
  ctx: Context,
  id: string,
  options: JitiResolveOptions & {
    async?: boolean;
    paths?: string[];
    skipTsConfigPaths?: boolean;
  },
): string {
  let resolved, lastError;

  if (ctx.isNativeRe.test(id)) {
    return id;
  }

  // Resolve tsconfig paths
  if (ctx.resolveTsConfigPaths && !options.skipTsConfigPaths) {
    const candidates = ctx.resolveTsConfigPaths(id);
    for (const candidate of candidates) {
      const resolved = jitiResolve(ctx, candidate, {
        ...options,
        try: true,
        skipTsConfigPaths: true,
      });
      if (resolved) {
        return resolved;
      }
    }
  }

  // Resolve alias
  if (ctx.alias) {
    id = resolveAlias(id, ctx.alias);
  }

  // Resolve parent URL
  let parentURL = options?.parentURL || ctx.url;
  if (isDir(parentURL)) {
    parentURL = join(parentURL as string, "_index.js");
  }

  // Try resolving with ESM compatible Node.js resolution in async context
  const conditionSets = (
    options?.async
      ? [options?.conditions, ["node", "import"], ["node", "require"]]
      : [options?.conditions, ["node", "require"], ["node", "import"]]
  ).filter(Boolean);
  for (const conditions of conditionSets) {
    try {
      resolved = resolvePathSync(id, {
        url: parentURL,
        conditions,
        extensions: ctx.opts.extensions,
      });
    } catch (error) {
      lastError = error;
    }
    if (resolved) {
      return resolved;
    }
  }

  // Try native require resolve with additional extensions and /index as fallback
  try {
    return ctx.nativeRequire.resolve(id, { paths: options.paths });
  } catch (error) {
    lastError = error;
  }
  for (const ext of ctx.additionalExts) {
    resolved =
      tryNativeRequireResolve(ctx, id + ext, parentURL, options) ||
      tryNativeRequireResolve(ctx, id + "/index" + ext, parentURL, options);
    if (resolved) {
      return resolved;
    }
    // Try resolving .ts files with .js extension
    if (
      TS_EXT_RE.test(ctx.filename) ||
      TS_EXT_RE.test(ctx.parentModule?.filename || "") ||
      JS_EXT_RE.test(id)
    ) {
      resolved = tryNativeRequireResolve(
        ctx,
        id.replace(JS_EXT_RE, ".$1t$2"),
        parentURL,
        options,
      );
      if (resolved) {
        return resolved;
      }
    }
  }

  if (options?.try) {
    // Well-typed in types.d.ts
    return undefined as unknown as string;
  }

  throw lastError;
}

function tryNativeRequireResolve(
  ctx: Context,
  id: string,
  parentURL: URL | string,
  options?: { paths?: string[] },
) {
  try {
    return ctx.nativeRequire.resolve(id, {
      ...options,
      paths: [dirname(fileURLToPath(parentURL)), ...(options?.paths || [])],
    });
  } catch {
    // Ignore errors
  }
}
