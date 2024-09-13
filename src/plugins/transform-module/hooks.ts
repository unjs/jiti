// Based on babel-plugin-transform-modules-commonjs v7.24.7
// MIT - Copyright (c) 2014-present Sebastian McKenzie and other contributors
// https://github.com/babel/babel/tree/c7bb6e0f/packages/babel-plugin-transform-modules-commonjs/src

import type { BabelFile, types as t } from "@babel/core";
import type { isSideEffectImport } from "@babel/helper-module-transforms";

const commonJSHooksKey =
  "@babel/plugin-transform-modules-commonjs/customWrapperPlugin";

type SourceMetadata = Parameters<typeof isSideEffectImport>[0];

// A hook exposes a set of function that can customize how `require()` calls and
// references to the imported bindings are handled. These functions can either
// return a result, or return `null` to delegate to the next hook.
export interface CommonJSHook {
  name: string;
  version: string;
  wrapReference?(
    ref: t.Expression,
    payload: unknown,
  ): t.CallExpression | null | undefined;
  // Optionally wrap a `require` call. If this function returns `false`, the
  // `require` call is removed from the generated code.
  buildRequireWrapper?(
    name: string,
    init: t.Expression,
    payload: unknown,
    referenced: boolean,
  ): t.Statement | false | null | undefined;
  getWrapperPayload?(
    source: string,
    metadata: SourceMetadata,
    importNodes: t.Node[],
  ): string | null | undefined;
}

export function defineCommonJSHook(file: BabelFile, hook: CommonJSHook) {
  let hooks = file.get(commonJSHooksKey);
  if (!hooks) file.set(commonJSHooksKey, (hooks = []));
  hooks.push(hook);
}

function findMap<T, U>(
  arr: T[] | null,
  cb: (el: T) => U,
): U | undefined | null {
  if (arr) {
    for (const el of arr) {
      const res = cb(el);
      if (res != null) return res;
    }
  }
}

export function makeInvokers(
  file: BabelFile,
): Pick<
  CommonJSHook,
  "wrapReference" | "getWrapperPayload" | "buildRequireWrapper"
> {
  const hooks: CommonJSHook[] | null = file.get(commonJSHooksKey);

  return {
    getWrapperPayload(...args) {
      return findMap(hooks, (hook) => hook.getWrapperPayload?.(...args));
    },
    wrapReference(...args) {
      return findMap(hooks, (hook) => hook.wrapReference?.(...args));
    },
    buildRequireWrapper(...args) {
      return findMap(hooks, (hook) => hook.buildRequireWrapper?.(...args));
    },
  };
}
