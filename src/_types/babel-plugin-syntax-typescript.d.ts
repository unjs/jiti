declare module "@babel/plugin-syntax-typescript" {
  export interface Options {
    disallowAmbiguousJSXLike?: boolean;
    dts?: boolean;
    isTSX?: boolean;
  }

  import type { declare } from "@babel/helper-plugin-utils";
  const syntaxTypeScriptPlugin: ReturnType<typeof declare<Options>>;
  export default syntaxTypeScriptPlugin;
}
