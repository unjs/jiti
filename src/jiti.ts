import type {
  Jiti,
  TransformOptions,
  JitiOptions,
  Context,
  EvalModuleOptions,
} from "./types";
import { platform } from "node:os";
import { pathToFileURL } from "node:url";
import { join } from "pathe";
import escapeStringRegexp from "escape-string-regexp";
import createRequire from "create-require";
import { normalizeAliases } from "pathe/utils";
import { addHook } from "pirates";
import { isDir } from "./utils";
import { resolveJitiOptions } from "./options";
import { jitiResolve } from "./resolve";
import { evalModule } from "./eval";
import { transform } from "./transform";
import { jitiRequire } from "./require";
import { prepareCacheDir } from "./cache";

const isWindows = platform() === "win32";

export default function createJiti(
  filename: string,
  userOptions: JitiOptions = {},
  _internal?: Pick<
    Context,
    "parentModule" | "parentCache" | "nativeImport" | "onError"
  >,
): Jiti {
  // Resolve options
  const opts = resolveJitiOptions(userOptions);

  // Normalize aliases (and disable if non given)
  const alias =
    opts.alias && Object.keys(opts.alias).length > 0
      ? normalizeAliases(opts.alias || {})
      : undefined;

  // List of modules to force transform or native
  const nativeModules = ["typescript", "jiti", ...(opts.nativeModules || [])];
  const isNativeRe = new RegExp(
    `node_modules/(${nativeModules
      .map((m) => escapeStringRegexp(m))
      .join("|")})/`,
  );

  const transformModules = [...(opts.transformModules || [])];
  const isTransformRe = new RegExp(
    `node_modules/(${transformModules
      .map((m) => escapeStringRegexp(m))
      .join("|")})/`,
  );

  // If filename is dir, createRequire goes with parent directory, so we need fakepath
  if (!filename) {
    filename = process.cwd();
  }
  if (isDir(filename)) {
    filename = join(filename, "index.js");
  }

  const url = pathToFileURL(filename);

  const additionalExts = [...(opts.extensions as string[])].filter(
    (ext) => ext !== ".js",
  );

  const nativeRequire = createRequire(
    isWindows
      ? filename.replace(/\//g, "\\") // Import maps does not work with normalized paths!
      : filename,
  );

  // Create shared context
  const ctx: Context = {
    filename,
    url,
    opts,
    alias,
    nativeModules,
    transformModules,
    isNativeRe,
    isTransformRe,
    additionalExts,
    nativeRequire,
    onError: _internal?.onError,
    parentModule: _internal?.parentModule,
    parentCache: _internal?.parentCache,
    nativeImport: _internal?.nativeImport,
  };

  // Prepare cache dir
  prepareCacheDir(ctx);

  // Create jiti instance
  const jiti: Jiti = Object.assign(
    function jiti(id: string) {
      return jitiRequire(ctx, id, false /* no async */);
    },
    {
      cache: opts.moduleCache ? nativeRequire.cache : Object.create(null),
      extensions: nativeRequire.extensions,
      main: nativeRequire.main,
      resolve: Object.assign(
        function resolve(path: string) {
          return jitiResolve(ctx, path);
        },
        {
          paths: nativeRequire.resolve.paths,
        },
      ),
      transform(opts: TransformOptions) {
        return transform(ctx, opts);
      },
      register() {
        return addHook(
          (source: string, filename: string) =>
            transform(ctx, {
              source,
              filename,
              ts: !!/\.[cm]?ts$/.test(filename),
              async: false,
            }),
          { exts: ctx.opts.extensions },
        );
      },
      evalModule(source: string, options?: EvalModuleOptions) {
        return evalModule(ctx, source, options);
      },
      async import(id: string) {
        return await jitiRequire(ctx, id, true /* async */);
      },
    },
  );

  return jiti;
}
