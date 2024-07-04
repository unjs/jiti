declare module "babel-plugin-transform-typescript-metadata" {
  import type { declare } from "@babel/helper-plugin-utils";
  const transformTypeScriptMetaPlugin: ReturnType<typeof declare>;
  export default transformTypeScriptMetaPlugin;
}
