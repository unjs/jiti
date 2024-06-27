export type ModuleCache = Record<string, NodeModule>;

export type EvalModuleOptions = Partial<{
  id: string;
  filename: string;
  ext: string;
  cache: ModuleCache;
  async?: boolean;
}>;

export interface JITI extends NodeRequire {
  transform: (opts: TransformOptions) => string;
  register: () => () => void;
  evalModule: (source: string, options?: EvalModuleOptions) => unknown;
  /** @experimental Behavior of `jiti.import` might change in the future. */
  import: (id: string) => Promise<unknown>;
}

type ESMImport = (id: string) => Promise<any>;

export interface Context {
  filename: string;
  url: URL;
  userOptions: JITIOptions;
  parentModule?: NodeModule;
  parentCache?: ModuleCache;
  nativeImport: ESMImport;
  onError?: (error: Error) => void;
  opts: JITIOptions;
  nativeModules: string[];
  transformModules: string[];
  isNativeRe: RegExp;
  isTransformRe: RegExp;
  alias?: Record<string, string>;
  additionalExts: string[];
  nativeRequire: NodeRequire;
}

export type TransformOptions = {
  source: string;
  filename?: string;
  ts?: boolean;
  retainLines?: boolean;
  async?: boolean;
  [key: string]: any;
};

export type TRANSFORM_RESULT = {
  code: string;
  error?: any;
};

export type JITIOptions = {
  transform?: (opts: TransformOptions) => TRANSFORM_RESULT;
  debug?: boolean;
  cache?: boolean | string;
  sourceMaps?: boolean;
  requireCache?: boolean;
  v8cache?: boolean;
  interopDefault?: boolean;
  cacheVersion?: string;
  extensions?: string[];
  transformOptions?: Omit<TransformOptions, "source">;
  alias?: Record<string, string>;
  nativeModules?: string[];
  transformModules?: string[];
  experimentalBun?: boolean;
};
