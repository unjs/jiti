import { smart } from "@babel/template";
import type { NodePath, PluginObj } from "@babel/core";
import type { Statement, MemberExpression } from "@babel/types";
import { dirname } from "pathe";
import { fileURLToPath, pathToFileURL } from "mlly";

// Based on https://github.com/javiertury/babel-plugin-transform-import-meta/blob/master/src/index.ts v2.1.1 (MIT License)
// Modifications
// 1. Inlines resolved filename into the code when possible instead of injecting a require
// 2. Add support for import.meta.dirname and import.meta.filename

export default function importMetaPathsPlugin(
  _ctx: any,
  opts: { filename?: string },
) {
  return <PluginObj>{
    name: "import-meta-paths",
    visitor: {
      Program(path) {
        const metaUrls: Array<NodePath<MemberExpression>> = [];
        const metaDirnames: Array<NodePath<MemberExpression>> = [];
        const metaFilenames: Array<NodePath<MemberExpression>> = [];

        path.traverse({
          MemberExpression(memberExpPath) {
            const { node } = memberExpPath;

            if (
              node.object.type === "MetaProperty" &&
              node.object.meta.name === "import" &&
              node.object.property.name === "meta" &&
              node.property.type === "Identifier"
            ) {
              switch (node.property.name) {
                case "url": {
                  metaUrls.push(memberExpPath);
                  break;
                }
                case "dirname": {
                  metaDirnames.push(memberExpPath);
                  break;
                }
                case "filename": {
                  metaFilenames.push(memberExpPath);
                  break;
                }
              }
            }
          },
        });

        // Update import.meta.url
        for (const meta of metaUrls) {
          meta.replaceWith(
            smart.ast`${
              opts.filename
                ? JSON.stringify(pathToFileURL(opts.filename))
                : "require('url').pathToFileURL(__filename).toString()"
            }` as Statement,
          );
        }

        // Update import.meta.dirname
        for (const metaDirname of metaDirnames) {
          metaDirname.replaceWith(
            smart.ast`${
              opts.filename
                ? JSON.stringify(
                    dirname(fileURLToPath(pathToFileURL(opts.filename))),
                  )
                : "__dirname"
            }` as Statement,
          );
        }

        // Update import.meta.filename
        for (const metaFilename of metaFilenames) {
          metaFilename.replaceWith(
            smart.ast`${
              opts.filename
                ? JSON.stringify(fileURLToPath(pathToFileURL(opts.filename)))
                : "__filename"
            }` as Statement,
          );
        }
      },
    },
  };
}
