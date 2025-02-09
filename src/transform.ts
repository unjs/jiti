import type { Context, TransformOptions, SourceTransformer } from "./types";
import { getCache } from "./cache";
import { debug } from "./utils";

export async function transform(ctx: Context, topts: TransformOptions, sourceTransformer?: SourceTransformer): Promise<string> {
  if (!topts.filename) {
    throw new Error("transform: filename is required");
  }

  // Initialize or update callback store
  ctx.callbackStore ??= new Map();
  if (sourceTransformer) {
    ctx.callbackStore.set('sourceTransformer', sourceTransformer);
  }

  let source = topts.source;
  const globalTransformer = ctx.callbackStore?.get('sourceTransformer');


  if (globalTransformer) {
    try {
      source = await globalTransformer(source, topts.filename!);
    } catch (error_) {
      debug(ctx, 'Source transformer error:', error_);
    }
  }

  const code = getCache(ctx, topts, () => {
    return ctx.opts.transform!({
      ...ctx.opts.transformOptions,
      babel: {
        ...(ctx.opts.sourceMaps ? {
          sourceFileName: topts.filename,
          sourceMaps: "inline",
        } : {}),
        ...ctx.opts.transformOptions?.babel,
      },
      interopDefault: ctx.opts.interopDefault,
      ...topts,
      source,
    }).code;
  });
  
  return code.startsWith("#!") ? "// " + code : code;
}
