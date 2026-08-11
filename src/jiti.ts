import type {
  Jiti,
  TransformOptions,
  JitiOptions,
  Context,
  EvalModuleOptions,
  JitiResolveOptions,
} from "./types";
import { existsSync, statSync } from "node:fs";
import { platform } from "node:os";
import { fileURLToPath, pathToFileURL } from "mlly";
import { join, dirname, basename, resolve } from "pathe";
import escapeStringRegexp from "escape-string-regexp";
import { normalizeAliases } from "pathe/utils";
import pkg from "../package.json";
import { debug, isDir } from "./utils";
import { resolveJitiOptions } from "./options";
import { jitiResolve } from "./resolve";
import { evalModule } from "./eval";
import { transform } from "./transform";
import { jitiRequire } from "./require";
import { prepareCacheDir } from "./cache";

const isWindows = platform() === "win32";

/**
 * Create a paths matcher from the referenced projects of a solution-style
 * tsconfig (issue #440). The root config only contains `references` while
 * `paths` live in the referenced projects (e.g. `tsconfig.node.json`).
 *
 * Each referenced project gets its own matcher (paths are relative to the
 * config that declares them) and the candidates are concatenated.
 */
type GetTsconfig = (typeof import("get-tsconfig"))["getTsconfig"];
type TsConfigResult = NonNullable<ReturnType<GetTsconfig>>;

function createReferencedPathsMatcher(
  rootTsconfig: TsConfigResult,
  getTsconfig: GetTsconfig,
  createPathsMatcher: (typeof import("get-tsconfig"))["createPathsMatcher"],
): ((specifier: string) => string[]) | undefined {
  const matchers: Array<(specifier: string) => string[]> = [];
  const visited = new Set<string>([resolve(rootTsconfig.path)]);
  const pending: Array<{ ref: string; baseDir: string }> = (
    rootTsconfig.config.references || []
  ).map((ref) => ({ ref: ref.path!, baseDir: dirname(rootTsconfig.path) }));

  while (pending.length > 0) {
    const { ref, baseDir } = pending.shift()!;
    const resolved = resolve(baseDir, ref);
    const stat = existsSync(resolved) ? statSync(resolved) : undefined;
    const configFile = stat?.isDirectory()
      ? join(resolved, "tsconfig.json")
      : resolved;
    if (visited.has(configFile)) {
      continue;
    }
    visited.add(configFile);
    const tsconfig = getTsconfig(dirname(configFile), basename(configFile));
    if (!tsconfig) {
      continue;
    }
    if (tsconfig.config.compilerOptions?.paths) {
      const matcher = createPathsMatcher(tsconfig);
      if (matcher) {
        matchers.push(matcher);
      }
    }
    for (const nested of tsconfig.config.references || []) {
      if (nested.path) {
        pending.push({ ref: nested.path, baseDir: dirname(tsconfig.path) });
      }
    }
  }

  if (matchers.length === 0) {
    return undefined;
  }
  return (specifier) => matchers.flatMap((matcher) => matcher(specifier));
}

export default function createJiti(
  filename: string,
  userOptions: JitiOptions = {},
  parentContext: Pick<
    Context,
    | "parentModule"
    | "parentCache"
    | "nativeImport"
    | "onError"
    | "createRequire"
  >,
  isNested = false,
): Jiti {
  // Resolve options
  const opts = isNested ? userOptions : resolveJitiOptions(userOptions);

  // Normalize filename (if url)
  if (typeof filename === "string" && filename.startsWith("file://")) {
    filename = fileURLToPath(filename);
  }

  // Normalize aliases (and disable if non given)
  const alias =
    opts.alias && Object.keys(opts.alias).length > 0
      ? normalizeAliases(opts.alias || {})
      : undefined;

  // Initialize tsconfig paths matcher (lazy-loaded to avoid cost when disabled)
  let resolveTsConfigPaths: ((specifier: string) => string[]) | undefined;
  if (opts.tsconfigPaths) {
    const { getTsconfig, createPathsMatcher } =
      require("get-tsconfig") as typeof import("get-tsconfig");
    const searchPath =
      typeof opts.tsconfigPaths === "string"
        ? opts.tsconfigPaths
        : dirname(filename);
    const tsconfig = getTsconfig(searchPath);
    if (tsconfig) {
      resolveTsConfigPaths = createPathsMatcher(tsconfig)!;
      // Solution-style tsconfigs can keep `paths` in referenced projects
      // instead of the root config (#440)
      if (!resolveTsConfigPaths) {
        resolveTsConfigPaths = createReferencedPathsMatcher(
          tsconfig,
          getTsconfig,
          createPathsMatcher,
        );
      }
    }
  }

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
  if (!isNested && isDir(filename)) {
    filename = join(filename, "_index.js");
  }

  const url = pathToFileURL(filename);

  const additionalExts = [...(opts.extensions as string[])].filter(
    (ext) => ext !== ".js",
  );

  const nativeRequire = parentContext.createRequire(
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
    resolveTsConfigPaths,
    nativeModules,
    transformModules,
    isNativeRe,
    isTransformRe,
    additionalExts,
    nativeRequire,
    onError: parentContext.onError,
    parentModule: parentContext.parentModule,
    parentCache: parentContext.parentCache,
    nativeImport: parentContext.nativeImport,
    createRequire: parentContext.createRequire,
  };

  // Debug
  if (!isNested) {
    debug(
      ctx,
      "[init]",
      ...[
        ["version:", pkg.version],
        ["module-cache:", opts.moduleCache],
        ["fs-cache:", opts.fsCache],
        ["rebuild-fs-cache:", opts.rebuildFsCache],
        ["interop-defaults:", opts.interopDefault],
      ].flat(),
    );
  }

  // Prepare cache dir
  if (!isNested) {
    prepareCacheDir(ctx);
  }

  // Create jiti instance
  const jiti: Jiti = Object.assign(
    function jiti(id: string) {
      return jitiRequire(ctx, id, { async: false });
    },
    {
      cache: opts.moduleCache ? nativeRequire.cache : Object.create(null),
      extensions: nativeRequire.extensions,
      main: nativeRequire.main,
      options: opts,
      resolve: Object.assign(
        function resolve(path: string, options?: NodeJS.RequireResolveOptions) {
          return jitiResolve(ctx, path, { ...options, async: false });
        },
        {
          paths: nativeRequire.resolve.paths,
        },
      ),
      transform(opts: TransformOptions) {
        return transform(ctx, opts);
      },
      evalModule(source: string, options?: EvalModuleOptions) {
        return evalModule(ctx, source, options);
      },
      async import<T = unknown>(
        id: string,
        opts?: JitiResolveOptions & { default?: true },
      ): Promise<T> {
        const mod = await jitiRequire(ctx, id, { ...opts, async: true });
        return opts?.default ? (mod?.default ?? mod) : mod;
      },
      esmResolve(id: string, opts?: string | JitiResolveOptions): string {
        if (typeof opts === "string") {
          opts = { parentURL: opts };
        }
        const resolved = jitiResolve(ctx, id, {
          parentURL: url as any,
          ...opts,
          async: true,
        });
        if (
          !resolved ||
          typeof resolved !== "string" ||
          resolved.startsWith("file://")
        ) {
          return resolved;
        }
        return pathToFileURL(resolved);
      },
    },
  ) as Jiti;

  return jiti;
}
