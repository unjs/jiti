import type { HubInterface } from "@babel/traverse";

declare module "@babel/core" {
  export interface BabelFile
    extends HubInterface, Pick<PluginPass, "get" | "set"> {}
}

export {};
