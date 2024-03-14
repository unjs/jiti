import { JITICache } from "./cache";
import { JITIContext } from "./context";

export function transform(ctx: JITIContext, cache: JITICache): string {
  let code = cache.getCache(topts.filename, topts.source, () => {
    const res = opts.transform!({
      legacy: opts.legacy,
      ...opts.transformOptions,
      babel: {
        ...(opts.sourceMaps
          ? {
              sourceFileName: topts.filename,
              sourceMaps: "inline",
            }
          : {}),
        ...opts.transformOptions?.babel,
      },
      ...topts,
    });
    if (res.error && opts.debug) {
      ctx.debug(res.error);
    }
    return res.code;
  });
  if (code.startsWith("#!")) {
    code = "// " + code;
  }
  return code;
}
