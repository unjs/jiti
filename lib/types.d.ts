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
  import: (id: string) => Promise<unknown>;
  /**
   * Transform source code
   */
  transform: (opts: TransformOptions) => string;
  /**
   * Register global (CommonJS) require hook
   */
  register: () => () => void;
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
   * Enable hard-source caching with HMR support (enabled by default).
   *
   * Can also be disabled using `JITI_CACHE=0` environment variable.
   *
   * **Note:** It is recommended to keep this option enabled for performance.
   */
  cache?: boolean | string;

  /**
   * Enable sourcemaps (enabled by default)
   *
   * Can also be disabled using `JITI_SOURCE_MAPS=0` environment variable.
   */
  sourceMaps?: boolean;

  /**
   * Enable CommonJS require cache integration (enabled by default)
   *
   * Disabling allows requiring same module multiple times.
   *
   * Can also be disabled using `JITI_REQUIRE_CACHE=0` environment variable.
   */
  requireCache?: boolean;

  /**
   * Interop default export (disabled by default)
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
   */
  alias?: Record<string, string>;

  nativeModules?: string[];

  transformModules?: string[];
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
  async: boolean;
  [key: string]: any;
}

export interface TransformResult {
  code: string;
  error?: any;
}
