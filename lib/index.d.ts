import {
  JITI,
  JITIImportOptions,
  JITIOptions,
  ModuleCache,
  TransformOptions,
} from "../dist/types.js";

export = createJITI;
declare function createJITI(
  filename: string,
  userOptions?: JITIOptions,
  parentModule?: NodeModule,
  parentCache?: ModuleCache,
  parentImportOptions?: JITIImportOptions,
): JITI;
declare namespace createJITI {
  export type { JITI, JITIOptions, TransformOptions };
}
