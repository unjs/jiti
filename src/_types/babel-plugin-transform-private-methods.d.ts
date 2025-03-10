declare module "@babel/plugin-transform-private-methods" {
  import type { declare } from "@babel/helper-plugin-utils";
  const transformPrivateMethods: ReturnType<typeof declare>;
  export default transformPrivateMethods;
}
