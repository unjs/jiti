import { pathToFileURL } from "url";
import { smart } from "@babel/template";
import type { NodePath, PluginObj } from "@babel/core";
import type { Statement, MemberExpression } from "@babel/types";

// Based on https://github.com/javiertury/babel-plugin-transform-import-meta/blob/master/src/index.ts v2.1.1 (MIT License)
// Modification: Inlines resolved filename into the code when possible instead of injecting a require
export function TransformImportMetaPlugin(
  _ctx: any,
  opts: { filename?: string },
) {
  return <PluginObj>{
    name: "transform-import-meta",
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
              node.property.name === "url"
            ) {
              metas.push(memberExpPath);
            }
          },
        });

        if (metas.length === 0) {
          return;
        }

        for (const meta of metas) {
          meta.replaceWith(
            smart.ast`${
              opts.filename
                ? JSON.stringify(pathToFileURL(opts.filename))
                : "require('url').pathToFileURL(__filename).toString()"
            }` as Statement,
          );
        }
      },
    },
  };
}
