/**
 * Based on https://github.com/iendeavor/import-meta-env/tree/main/packages/babel 0.4.2 (MIT)

Modified to use runtime only without dotenv dependency

---

MIT License

Copyright (c) 2021 Ernest

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

import type BabelCore from "@babel/core";
import type { PluginObj } from "@babel/core";

export const accessor = `process.env`;

const replaceEnvForRuntime = (
  template: typeof BabelCore.template,
  property: string,
) => template.expression.ast(`${accessor}.${property}`);

export function importMetaEnvPlugin({ template, types }: any) {
  return <PluginObj>{
    name: "@import-meta-env/babel",
    visitor: {
      Identifier(path) {
        if (!types.isIdentifier(path)) {
          return;
        }

        // {}.{}
        if (!types.isMemberExpression(path.parentPath)) {
          return;
        }
        // {}.{}.{}
        if (!types.isMemberExpression(path.parentPath.node)) {
          return;
        }
        // {}.{}.{}.{}
        // @ts-ignore
        if (!types.isMemberExpression(path.parentPath.node.object)) {
          return;
        }

        // {}.{}.{}.PROPERTY
        // @ts-ignore
        if (path.parentPath.computed) {
          return;
        }
        // @ts-ignore
        if (!types.isIdentifier(path.parentPath.node.property)) {
          return;
        }

        // {}.{}.env.PROPERTY
        // @ts-ignore
        if (!types.isIdentifier(path.parentPath.node.object.property)) {
          return;
        }
        // @ts-ignore
        if (path.parentPath.node.object.property.name !== "env") {
          return;
        }

        // import.meta.env.PROPERTY
        // @ts-ignore
        if (!types.isMetaProperty(path.parentPath.node.object.object)) {
          return;
        }
        // @ts-ignore
        if (path.parentPath.node.object.object.property.name !== "meta") {
          return;
        }
        // @ts-ignore
        if (path.parentPath.node.object.object.meta.name !== "import") {
          return;
        }

        path.parentPath.replaceWith(
          // @ts-ignore
          replaceEnvForRuntime(template, path.parentPath.node.property.name),
        );
      },
    },
  };
}
