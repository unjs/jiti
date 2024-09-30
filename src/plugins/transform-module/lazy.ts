// Based on babel-plugin-transform-modules-commonjs v7.24.7
// MIT - Copyright (c) 2014-present Sebastian McKenzie and other contributors
// https://github.com/babel/babel/tree/c7bb6e0f/packages/babel-plugin-transform-modules-commonjs/src
import { template, types as t } from "@babel/core";
import { isSideEffectImport } from "@babel/helper-module-transforms";
import type { CommonJSHook } from "./hooks";

type Lazy = boolean | string[] | ((source: string) => boolean);

export const lazyImportsHook = (lazy: Lazy): CommonJSHook => ({
  name: `babel-plugin-transform-modules-commonjs/lazy`,
  version: "7.24.7",
  getWrapperPayload(source, metadata) {
    if (isSideEffectImport(metadata) || metadata.reexportAll) {
      return null;
    }
    if (lazy === true) {
      // 'true' means that local relative files are eagerly loaded and
      // dependency modules are loaded lazily.
      return source.includes(".") ? null : "lazy/function";
    }
    if (Array.isArray(lazy)) {
      return lazy.includes(source) ? "lazy/function" : null;
    }
    if (typeof lazy === "function") {
      return lazy(source) ? "lazy/function" : null;
    }
  },
  buildRequireWrapper(name, init, payload, referenced) {
    if (payload === "lazy/function") {
      if (!referenced) return false;
      return template.statement.ast`
        function ${name}() {
          const data = ${init};
          ${name} = function(){ return data; };
          return data;
        }
      `;
    }
  },
  wrapReference(ref, payload) {
    if (payload === "lazy/function") return t.callExpression(ref, []);
  },
});
