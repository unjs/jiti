import { dirname } from "pathe";
import { jitiResolve } from "./resolve";
import { Context } from "./types";

export function nativeImport(ctx: Context, id: string) {
  const resolvedId = jitiResolve(ctx, id, { paths: [dirname(ctx.filename)] });
  // TODO: use subpath to avoid webpack transform instead
  const _dynamicImport = new Function("url", "return import(url)") as any;
  return _dynamicImport(resolvedId);
}
