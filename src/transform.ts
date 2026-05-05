import type { Context, TransformOptions, SourceTransformer } from "./types";
import { getCache } from "./cache";
import { debug } from "./utils";

export async function transform(
  ctx: Context,
  topts: TransformOptions,
  sourceTransformer?: SourceTransformer,
): Promise<string> {
  if (!topts.filename) {
    throw new Error("transform: filename is required");
  }

  const filename = topts.filename;

  ctx.callbackStore ??= new Map();
  if (sourceTransformer) {
    ctx.callbackStore.set("sourceTransformer", sourceTransformer);
  }

  return await getCache(ctx, topts, async () => {
    let source = topts.source;
    const transformer = ctx.callbackStore?.get("sourceTransformer");

    if (transformer) {
      try {
        source = await Promise.resolve(transformer(source, filename));
      } catch (error_) {
        debug(ctx, "Source transformer error:", error_);
      }
    }

    const res = ctx.opts.transform!({
      ...topts,
      ...ctx.opts.transformOptions,
      babel: {
        ...(ctx.opts.sourceMaps
          ? {
              sourceFileName: filename,
              sourceMaps: "inline",
            }
          : {}),
        ...ctx.opts.transformOptions?.babel,
      },
      interopDefault: ctx.opts.interopDefault,
      source,
    });

    if (res.error && ctx.opts.debug) {
      debug(ctx, res.error);
    }

    const code = res.code;
    return code.startsWith("#!") ? "// " + code : code;
  });
}
