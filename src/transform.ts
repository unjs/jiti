import { getCache } from "./cache";
import { Context } from "./types";
import { debug } from "./utils";

export function transform(ctx: Context, topts: any): string {
  let code = getCache(ctx, topts.filename, topts.source, () => {
    const res = ctx.opts.transform!({
      ...ctx.opts.transformOptions,
      babel: {
        ...(ctx.opts.sourceMaps
          ? {
              sourceFileName: topts.filename,
              sourceMaps: "inline",
            }
          : {}),
        ...ctx.opts.transformOptions?.babel,
      },
      ...topts,
    });
    if (res.error && ctx.opts.debug) {
      debug(ctx, res.error);
    }
    return res.code;
  });
  if (code.startsWith("#!")) {
    code = "// " + code;
  }
  return code;
}
