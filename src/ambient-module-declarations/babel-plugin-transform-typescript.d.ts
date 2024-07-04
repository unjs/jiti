declare module "@babel/plugin-transform-typescript" {
  import type { declare } from "@babel/helper-plugin-utils";
  import type { Options as SyntaxOptions } from "@babel/plugin-syntax-typescript";

  export interface Options extends SyntaxOptions {
    /** @default true */
    allowNamespaces?: boolean;
    /** @default "React.createElement" */
    jsxPragma?: string;
    /** @default "React.Fragment" */
    jsxPragmaFrag?: string;
    onlyRemoveTypeImports?: boolean;
    optimizeConstEnums?: boolean;
    allowDeclareFields?: boolean;
  }

  const transformTypeScriptMetaPlugin: ReturnType<typeof declare<Options>>;
  export default transformTypeScriptMetaPlugin;
}
