declare module "babel-plugin-parameter-decorator" {
  import type { declare } from "@babel/helper-plugin-utils";
  const parameterDecoratorPlugin: ReturnType<typeof declare>;
  export default parameterDecoratorPlugin;
}
