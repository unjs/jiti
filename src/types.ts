import type { JitiOptions, ModuleCache } from "../lib/types";
export type {
  JitiOptions,
  ModuleCache,
  EvalModuleOptions,
  Jiti,
  TransformOptions,
  TransformResult,
  JitiResolveOptions,
} from "../lib/types";

export interface Context {
  filename: string;
  url: string;
  parentModule?: NodeModule;
  parentCache?: ModuleCache;
  nativeImport?: (id: string) => Promise<any>;
  onError?: (error: Error) => void;
  opts: JitiOptions;
  nativeModules: string[];
  transformModules: string[];
  isNativeRe: RegExp;
  isTransformRe: RegExp;
  alias?: Record<string, string>;
  additionalExts: string[];
  nativeRequire: NodeRequire;
  createRequire: (typeof import("node:module"))["createRequire"];
  callbackStore?: Map<string, SourceTransformer>;
}

export type SourceTransformer = (source: string, filename: string) => Promise<string> | string;

export interface CacheOptions {
  key: string;
  invalidate?: boolean;
  transform?: () => string | Promise<string>;
}
