declare module "@babel/plugin-proposal-decorators" {
  import type { declare } from "@babel/helper-plugin-utils";
  import type { Options as SyntaxOptions } from "@babel/plugin-syntax-decorators";

  export interface Options extends SyntaxOptions {
    /**
     * @deprecated use `constantSuper` assumption instead. Only supported in 2021-12 version.
     */
    loose?: boolean;
  }

  const proposalDecoratorsPlugin: ReturnType<typeof declare<Options>>;
  export default proposalDecoratorsPlugin;
}