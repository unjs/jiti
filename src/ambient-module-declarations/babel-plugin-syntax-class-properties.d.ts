declare module "@babel/plugin-syntax-class-properties" {
  import type { declare } from "@babel/helper-plugin-utils";
  const syntaxClassPropertiesPlugin: ReturnType<typeof declare>;
  export default syntaxClassPropertiesPlugin;
}
