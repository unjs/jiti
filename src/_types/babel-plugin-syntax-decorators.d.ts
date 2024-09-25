declare module "@babel/plugin-syntax-decorators" {
  export interface Options {
    legacy?: boolean;
    version?:
      | "legacy"
      | "2018-09"
      | "2021-12"
      | "2022-03"
      | "2023-01"
      | "2023-05"
      | "2023-11";
    decoratorsBeforeExport?: boolean;
  }

  import type { declare } from "@babel/helper-plugin-utils";
  const syntaxDecoratorsPlugin: ReturnType<typeof declare<Options>>;
  export default syntaxDecoratorsPlugin;
}
