declare module "@babel/plugin-transform-react-jsx" {
  import type { declare } from "@babel/helper-plugin-utils";

  /** Reference: https://babeljs.io/docs/babel-plugin-transform-react-jsx#options */
  export interface Options {
    throwIfNamespace?: boolean;
    runtime?: "classic" | "automatic";
    importSource?: string;
    pragma?: string;
    pragmaFrag?: string;
    useBuiltIns?: boolean;
    useSpread?: boolean;
  }

  const transformReactJSXPlugin: ReturnType<typeof declare<Options>>;
  export default transformReactJSXPlugin;
}
