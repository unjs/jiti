import type { NodePath, PluginObj } from "@babel/core";
import { smart } from "@babel/template";
import type { MemberExpression, Statement } from "@babel/types";
import { dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export default function importMetaDirnamePlugin(
  _ctx: any,
  opts: { filename?: string },
) {
  return <PluginObj>{
    name: "import-meta-dirname",
    visitor: {
      Program(path) {
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
              if (node.property.name === "dirname") {
                metaDirnames.push(memberExpPath);
              } else if (node.property.name === "filename") {
                metaFilenames.push(memberExpPath);
              }
            }
          },
        });

        if (metaDirnames.length > 0) {
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
        }

        if (metaFilenames.length > 0) {
          for (const metaFilename of metaFilenames) {
            metaFilename.replaceWith(
              smart.ast`${
                opts.filename
                  ? JSON.stringify(fileURLToPath(pathToFileURL(opts.filename)))
                  : "__filename"
              }` as Statement,
            );
          }
        }
      },
    },
  };
}
