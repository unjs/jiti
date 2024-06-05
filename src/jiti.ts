import { mkdirSync } from "node:fs";
import { platform } from "node:os";
import { pathToFileURL } from "node:url";
import { join } from "pathe";
import escapeStringRegexp from "escape-string-regexp";
import createRequire from "create-require";
import { normalizeAliases } from "pathe/utils";
import { addHook } from "pirates";
import { isDir } from "./utils";
import { resolveJitiOptions } from "./options";
import type {
  JITI,
  TransformOptions,
  JITIOptions,
  JITIImportOptions,
  ModuleCache,
  Context,
  EvalModuleOptions,
} from "./types";
import { jitiResolve } from "./resolve";
import { evalModule } from "./eval";
import { transform } from "./transform";
import { jitiRequire } from "./require";
import { prepareCacheDir } from "./cache";

export type { JITI, JITIOptions, TransformOptions } from "./types";

const isWindows = platform() === "win32";

export default function createJITI(
  filename: string,
  userOptions: JITIOptions = {},
  parentModule?: NodeModule,
  parentCache?: ModuleCache,
  parentImportOptions?: JITIImportOptions,
): JITI {
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
    userOptions,
    parentModule,
    parentCache,
    parentImportOptions,
    opts,
    alias,
    nativeModules,
    transformModules,
    isNativeRe,
    isTransformRe,
    additionalExts,
    nativeRequire,
  };

  // Prepare cache dir
  prepareCacheDir(ctx);

  // Create jiti instance
  const jiti: JITI = Object.assign(
    function jiti(id: string, importOptions?: JITIImportOptions) {
      return jitiRequire(ctx, id, importOptions);
    },
    {
      cache: opts.requireCache ? nativeRequire.cache : {},
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
            }),
          { exts: ctx.opts.extensions },
        );
      },
      evalModule(source: string, options?: EvalModuleOptions) {
        return evalModule(ctx, source, options);
      },
      async import(id: string, importOptions?: JITIImportOptions) {
        return await jitiRequire(ctx, id, { _async: true, ...importOptions });
      },
    },
  );

  return jiti;
}
