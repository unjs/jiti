import { pathToFileURL } from "node:url";
import { smart } from "@babel/template";
import type { NodePath, PluginObj } from "@babel/core";
import type { Statement, MemberExpression } from "@babel/types";

export default function importMetaResolvePlugin(_ctx: any) {
  return <PluginObj>{
    name: "import-meta-resolve",
    visitor: {
      Program(path) {
        const metas: Array<NodePath<MemberExpression>> = [];

        path.traverse({
          MemberExpression(memberExpPath) {
            const { node } = memberExpPath;

            if (
              node.object.type === "MetaProperty" &&
              node.object.meta.name === "import" &&
              node.object.property.name === "meta" &&
              node.property.type === "Identifier" &&
              node.property.name === "resolve"
            ) {
              metas.push(memberExpPath);
            }
          },
        });

        if (metas.length === 0) {
          return;
        }

        for (const meta of metas) {
          meta.replaceWith({
            type: "ExpressionStatement",
            expression: { type: "Identifier", name: "jitiESMResolve" },
          });
        }
      },
    },
  };
}
