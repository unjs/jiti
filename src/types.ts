import type { ConditionsConfig, JitiOptions, ModuleCache } from "../lib/types";
import type { PackageJson } from "pkg-types";
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
}

export interface ExtendedPackageJson extends PackageJson {
  conditions?: ConditionsConfig;
}

export interface ConditionsConfigResolvedItem {
  match: string[] | null;
  ignore: string[] | null;
  values: string[];
}

export type ConditionsConfigResolved = ConditionsConfigResolvedItem[];
