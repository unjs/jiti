/**
 * Forked from https://github.com/iendeavor/import-meta-env/tree/main/packages/babel 0.4.2 (MIT License - Copyright (c) 2021 Ernest)
 */

import type { PluginObj } from "@babel/core";
import type { Identifier, MemberExpression, MetaProperty } from "@babel/types";

export function importMetaEnvPlugin({ template, types }: any) {
  return <PluginObj>{
    name: "@import-meta-env/babel",
    visitor: {
      Identifier(path) {
        if (!types.isIdentifier(path)) {
          return;
        }

        // {}.{} or {}?.{} (meta.env or meta?.env)
        if (
          !types.isMemberExpression(path.parentPath) &&
          !types.isOptionalMemberExpression(path.parentPath)
        ) {
          return;
        }

        // {}.{}.{} (import.meta.env)
        if (!types.isMemberExpression(path.parentPath.node)) {
          return;
        }

        const parentNode = path.parentPath.node as MemberExpression;

        if (!types.isMetaProperty(parentNode.object)) {
          return;
        }

        const parentNodeObjMeta = parentNode.object as MetaProperty;

        if (
          parentNodeObjMeta.meta.name === "import" &&
          parentNodeObjMeta.property.name === "meta" &&
          (parentNode.property as Identifier).name === "env"
        ) {
          path.parentPath.replaceWith(template.expression.ast("process.env"));
        }
      },
    },
  };
}
