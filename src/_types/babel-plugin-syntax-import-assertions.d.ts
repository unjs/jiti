declare module "@babel/plugin-syntax-import-assertions" {
  import type { declare } from "@babel/helper-plugin-utils";
  const syntaxImportAssertionsPlugin: ReturnType<typeof declare>;
  export default syntaxImportAssertionsPlugin;
}
