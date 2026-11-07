import type { PluginObj } from "@babel/core";

export default function importMetaPlugin(_ctx: any) {
  return <PluginObj>{
    name: "import-meta",
    visitor: {
      Program(path) {
        path.traverse({
          MetaProperty(metaPath) {
            if (
              metaPath.node.meta.name === "import" &&
              metaPath.node.property.name === "meta"
            ) {
              const parent = metaPath.parentPath;
              if (!parent.isMemberExpression() || parent.node.computed) {
                metaPath.replaceWith({
                  type: "Identifier",
                  name: "jitiImportMeta",
                });
              }
            }
          },
        });
      },
    },
  };
}
