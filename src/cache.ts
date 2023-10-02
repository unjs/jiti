import { existsSync, readFileSync, writeFileSync } from "fs";
import { dirname, join, basename } from "pathe";
import { JITIContext } from "./context";
import { createHash } from "crypto";

export type JITICache = ReturnType<typeof createCache>;

export function createCache(ctx: JITIContext) {
  function getCache(
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
        ctx.debug("[cache hit]", filename, "~>", cacheFile);
        return cacheSource;
      }
    }

    ctx.debug("[cache miss]", filename);
    const result = get();

    if (!result.includes("__JITI_ERROR__")) {
      writeFileSync(cacheFile, result + sourceHash, "utf8");
    }

    return result;
  }

  return {
    getCache,
  };
}

export function md5(content: string, len = 8) {
  return createHash("md5").update(content).digest("hex").slice(0, len);
}
