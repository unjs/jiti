import type { Context, TransformOptions } from "./types";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, basename, resolve } from "pathe";
import { filename } from "pathe/utils";
import { debug, isWritable, hash } from "./utils";

const CACHE_VERSION = "9";

export function getCache(
  ctx: Context,
  topts: TransformOptions,
  get: () => string,
): string {
  if (!ctx.opts.fsCache || !topts.filename) {
    return get();
  }

  // Compute inline hash for source
  const sourceHash = ` /* v${CACHE_VERSION}-${hash(topts.source, 16)} */\n`;

  // Compute cache file path
  let cacheName =
    `${basename(dirname(topts.filename))}-${filename(topts.filename)}` +
    (ctx.opts.sourceMaps ? "+map" : "") +
    (topts.interopDefault ? ".i" : "") +
    `.${hash(topts.filename)}` +
    (topts.async ? ".mjs" : ".cjs");
  if (topts.jsx && topts.filename.endsWith("x") /* jsx */) {
    cacheName += "x";
  }
  const cacheDir = ctx.opts.fsCache as string;
  const cacheFilePath = join(cacheDir, cacheName);

  if (!ctx.opts.rebuildFsCache && existsSync(cacheFilePath)) {
    const cacheSource = readFileSync(cacheFilePath, "utf8");
    if (cacheSource.endsWith(sourceHash)) {
      debug(ctx, "[cache]", "[hit]", topts.filename, "~>", cacheFilePath);
      return cacheSource;
    }
  }

  debug(ctx, "[cache]", "[miss]", topts.filename);
  const result = get();

  if (!result.includes("__JITI_ERROR__")) {
    writeCacheFile(ctx, cacheFilePath, result + sourceHash);
    debug(ctx, "[cache]", "[store]", topts.filename, "~>", cacheFilePath);
  }

  return result;
}

// Several processes can store the same entry at once while others read it. A
// plain `writeFileSync` truncates the file first, so a reader could see a half
// written entry that still ends with the right hash. Writing to a temporary
// file and renaming it over the target replaces the entry in one step.
function writeCacheFile(ctx: Context, cacheFilePath: string, content: string) {
  const tmpFilePath = `${cacheFilePath}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;
  try {
    writeFileSync(tmpFilePath, content, "utf8");
    renameSync(tmpFilePath, cacheFilePath);
  } catch (error) {
    rmSync(tmpFilePath, { force: true });
    // Renaming over a file that another process has open can fail on Windows,
    // and that process has just stored an entry for the same source anyway
    debug(ctx, "[cache]", "[store failed]", cacheFilePath, error);
  }
}

export function prepareCacheDir(ctx: Context) {
  if (ctx.opts.fsCache === true) {
    ctx.opts.fsCache = getCacheDir(ctx);
  }
  if (ctx.opts.fsCache) {
    try {
      mkdirSync(ctx.opts.fsCache as string, { recursive: true });
      if (!isWritable(ctx.opts.fsCache)) {
        throw new Error("directory is not writable!");
      }
    } catch (error: any) {
      debug(ctx, "Error creating cache directory at ", ctx.opts.fsCache, error);
      ctx.opts.fsCache = false;
    }
  }
}

export function getCacheDir(ctx: Context) {
  const nmDir = ctx.filename && resolve(ctx.filename, "../node_modules");
  if (nmDir && existsSync(nmDir)) {
    return join(nmDir, ".cache/jiti");
  }

  let _tmpDir = tmpdir();

  // Workaround for pnpm setting an incorrect `TMPDIR`.
  // Set `JITI_RESPECT_TMPDIR_ENV` to a truthy value to disable this workaround.
  // https://github.com/pnpm/pnpm/issues/6140
  // https://github.com/unjs/jiti/issues/120
  if (
    process.env.TMPDIR &&
    _tmpDir === process.cwd() &&
    !process.env.JITI_RESPECT_TMPDIR_ENV
  ) {
    const _env = process.env.TMPDIR;
    delete process.env.TMPDIR;
    _tmpDir = tmpdir();
    process.env.TMPDIR = _env;
  }

  return join(_tmpDir, "jiti");
}
