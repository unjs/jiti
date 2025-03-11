import type { Context, TransformOptions } from "./types";
import { getCache } from "./cache";
import { debug } from "./utils";

export function transform(ctx: Context, topts: TransformOptions): string {
  let code = getCache(ctx, topts, () => {
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
      interopDefault: ctx.opts.interopDefault,
      transformClassProps: ctx.opts.transformClassProps,
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
