declare module "@babel/plugin-transform-class-properties" {
  import type { declare } from "@babel/helper-plugin-utils";
  const transformClassPropertiesPlugin: ReturnType<typeof declare>;
  export default transformClassPropertiesPlugin;
}
