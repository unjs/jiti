import type { JitiOptions, ModuleCache } from "../lib/types";
export type {
  JitiOptions,
  ModuleCache,
  EvalModuleOptions,
  Jiti,
  TransformOptions,
  TransformResult,
} from "../lib/types";

export interface Context {
  filename: string;
  url: URL;
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
}
