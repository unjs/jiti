import { smart } from "@babel/template";
import type { NodePath, PluginObj } from "@babel/core";
import type { Statement, MemberExpression } from "@babel/types";
import { dirname } from "pathe";
import { fileURLToPath, pathToFileURL } from "mlly";

// Based on https://github.com/javiertury/babel-plugin-transform-import-meta/blob/master/src/index.ts v2.1.1 (MIT License)
// Modifications
// 1. Inlines resolved filename into the code when possible instead of injecting a require
// 2. Add support for import.meta.dirname, import.meta.filename and import.meta.main

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
        const metaMains: Array<NodePath<MemberExpression>> = [];

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
                case "main": {
                  metaMains.push(memberExpPath);
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

        // Update import.meta.main
        // If `require` or `module` is shadowed where import.meta.main is used
        // (e.g. a function parameter named `require`), evaluate the check once at
        // the top of the module, where they still refer to the module wrapper's.
        const isMainCheck = "Boolean(require.main && require.main === module)";
        const isShadowed = (scope: NodePath["scope"]) =>
          scope.hasBinding("require", true) || scope.hasBinding("module", true);
        let hoistedMain: string | undefined;
        for (const metaMain of metaMains) {
          if (isShadowed(metaMain.scope) && !isShadowed(path.scope)) {
            if (!hoistedMain) {
              hoistedMain = path.scope.generateUidIdentifier("isMain").name;
              path.unshiftContainer(
                "body",
                smart.ast`var ${hoistedMain} = ${isMainCheck};` as Statement,
              );
            }
            metaMain.replaceWith(smart.ast`${hoistedMain}` as Statement);
            continue;
          }
          metaMain.replaceWith(smart.ast`${isMainCheck}` as Statement);
        }
      },
    },
  };
}
