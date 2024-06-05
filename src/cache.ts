import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, basename } from "pathe";
import { debug, isWritable, md5 } from "./utils";
import { tmpdir } from "node:os";
import type { Context } from "./types";

export function getCache(
  ctx: Context,
  filename: string | undefined,
  source: string,
  get: () => string,
): string {
  if (!ctx.opts.cache || !filename) {
    return get();
  }

  // Calculate source hash
  const sourceHash = ` /* v${ctx.opts.cacheVersion}-${md5(source, 16)} */`;

  // Check cache file
  const filebase = basename(dirname(filename)) + "-" + basename(filename);
  const cacheFile = join(
    ctx.opts.cache as string,
    filebase + "." + md5(filename) + ".js",
  );

  if (existsSync(cacheFile)) {
    const cacheSource = readFileSync(cacheFile, "utf8");
    if (cacheSource.endsWith(sourceHash)) {
      debug(ctx, "[cache hit]", filename, "~>", cacheFile);
      return cacheSource;
    }
  }

  debug(ctx, "[cache miss]", filename);
  const result = get();

  if (!result.includes("__JITI_ERROR__")) {
    writeFileSync(cacheFile, result + sourceHash, "utf8");
  }

  return result;
}

export function prepareCacheDir(ctx: Context) {
  if (ctx.opts.cache === true) {
    ctx.opts.cache = getCacheDir();
  }
  if (ctx.opts.cache) {
    try {
      mkdirSync(ctx.opts.cache as string, { recursive: true });
      if (!isWritable(ctx.opts.cache)) {
        throw new Error("directory is not writable!");
      }
    } catch (error: any) {
      debug(ctx, "Error creating cache directory at ", ctx.opts.cache, error);
      ctx.opts.cache = false;
    }
  }
}

export function getCacheDir() {
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

  return join(_tmpDir, "node-jiti");
}
