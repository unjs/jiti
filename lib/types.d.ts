export declare function createJiti(id: string, userOptions?: JitiOptions): Jiti;

/**
 * Jiti instance
 *
 * Calling jiti() is similar to CommonJS require() but adds extra features such as Typescript and ESM compatibility.
 *
 * **Note:**It is recommended to use `await jiti.import` instead
 */
export interface Jiti extends NodeRequire {
  /**
   * ESM import a module with additional Typescript and ESM compatibility.
   */
  import(id: string, opts?: JitiResolveOptions): Promise<unknown>;

  /**
   * Resolve with ESM import conditions.
   */
  esmResolve<T extends JitiResolveOptions = JitiResolveOptions>(
    id: string,
    opts?: T,
  ): T["try"] extends true ? string | undefined : string;

  /**
   * Transform source code
   */
  transform: (opts: TransformOptions) => string;

  /**
   * Evaluate transformed code as a module
   */
  evalModule: (source: string, options?: EvalModuleOptions) => unknown;
}

/**
 * Jiti instance options
 */
export interface JitiOptions {
  /**
   * Filesystem source cache (enabled by default)
   *
   * An string can be passed to set the custom cache directory.
   *
   * By default (when is `true`), jiti uses  `node_modules/.cache/jiti` (if exists) or `{TMP_DIR}/jiti`.
   *
   * This option can also be disabled using `JITI_FS_CACHE=false` environment variable.
   *
   * **Note:** It is recommended to keep this option enabled for better performance.
   */
  fsCache?: boolean | string;

  /** @deprecated Use `fsCache` option. */
  cache?: boolean | string;

  /**
   * Runtime module cache (enabled by default)
   *
   * Disabling allows editing code and importing same module multiple times.
   *
   * When enabled, jiti integrates with Node.js native CommonJS cache store.
   *
   * This option can also be disabled using `JITI_MODULE_CACHE=false` environment variable.
   */
  moduleCache?: boolean;

  /** @deprecated Use `moduleCache` option.  */
  requireCache?: boolean;

  /**
   * Custom transform function
   */
  transform?: (opts: TransformOptions) => TransformResult;

  /**
   * Enable verbose debugging (disabled by default).
   *
   * Can also be enabled using `JITI_DEBUG=1` environment variable.
   */
  debug?: boolean;

  /**
   * Enable sourcemaps (enabled by default)
   *
   * Can also be disabled using `JITI_SOURCE_MAPS=0` environment variable.
   */
  sourceMaps?: boolean;

  /**
   * Interop default export (disabled by default)
   *
   * Can be enabled using `JITI_INTEROP_DEFAULT=1` environment variable.
   */
  interopDefault?: boolean;

  /**
   * Jiti hard source cache version (internal)
   */
  cacheVersion?: string;

  /**
   * Supported extensions to resolve.
   *
   * Default `[".js", ".mjs", ".cjs", ".ts", ".mts", ".cts", ".json"]`
   */
  extensions?: string[];

  /**
   * Transform options
   */
  transformOptions?: Omit<TransformOptions, "source">;

  /**
   * Resolve aliases
   *
   * You can use `JITI_ALIAS` environment variable to set aliases as a JSON string.
   */
  alias?: Record<string, string>;

  /**
   * List of modules (within `node_modules`) to always use native require/import for them.
   *
   * You can use `JITI_NATIVE_MODULES` environment variable to set native modules as a JSON string.
   *
   */
  nativeModules?: string[];

  /**
   * List of modules (within `node_modules`) to transform them regardless of syntax.
   *
   * You can use `JITI_TRANSFORM_MODULES` environment variable to set transform modules as a JSON string.
   */
  transformModules?: string[];

  /**
   * Enable experimental native Bun support for transformations.
   */
  experimentalBun?: boolean;
}

export type ModuleCache = Record<string, NodeModule>;

export type EvalModuleOptions = Partial<{
  id: string;
  filename: string;
  ext: string;
  cache: ModuleCache;
  async: boolean;
}>;

export interface TransformOptions {
  source: string;
  filename?: string;
  ts?: boolean;
  retainLines?: boolean;
  interopDefault?: boolean;
  async: boolean;
  [key: string]: any;
}

export interface TransformResult {
  code: string;
  error?: any;
}

export interface JitiResolveOptions {
  conditions?: string[];
  parentURL?: string | URL;
  try?: boolean;
}
