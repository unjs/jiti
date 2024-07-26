import type { ConfigAPI } from "@babel/core";

declare module "@babel/helper-plugin-utils" {
  const knownAssumptions: readonly [
    "arrayLikeIsIterable",
    "constantReexports",
    "constantSuper",
    "enumerableModuleMeta",
    "ignoreFunctionLength",
    "ignoreToPrimitiveHint",
    "iterableIsArray",
    "mutableTemplateObject",
    "noClassCalls",
    "noDocumentAll",
    "noIncompleteNsImportDetection",
    "noNewArrows",
    "noUninitializedPrivateFieldAccess",
    "objectRestNoSymbols",
    "privateFieldsAsSymbols",
    "privateFieldsAsProperties",
    "pureGetters",
    "setClassMethods",
    "setComputedProperties",
    "setPublicClassFields",
    "setSpreadProperties",
    "skipForOfIteratorClosing",
    "superIsCallableConstructor",
  ];

  export type AssumptionName = (typeof knownAssumptions)[number];

  type AssumptionFunction = (name: AssumptionName) => boolean | undefined;

  export type Target =
    | "node"
    | "deno"
    | "chrome"
    | "opera"
    | "edge"
    | "firefox"
    | "safari"
    | "ie"
    | "ios"
    | "android"
    | "electron"
    | "samsung"
    | "opera_mobile";

  export type Targets = {
    [target in Target]?: string;
  };

  type TargetsFunction = () => Targets;

  export type PresetAPI = {
    targets: TargetsFunction;
    addExternalDependency: (ref: string) => void;
  } & ConfigAPI;

  export type PluginAPI = {
    assumption: AssumptionFunction;
  } & PresetAPI &
    BabelAPI;
}
