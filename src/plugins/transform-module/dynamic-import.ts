// Based on babel-plugin-transform-modules-commonjs v7.24.7
// MIT - Copyright (c) 2014-present Sebastian McKenzie and other contributors
// https://github.com/babel/babel/tree/c7bb6e0f/packages/babel-plugin-transform-modules-commonjs/src

// Heavily inspired by
// https://github.com/airbnb/babel-plugin-dynamic-import-node/blob/master/src/utils.js

import type { BabelFile, NodePath } from "@babel/core";
import { types as t } from "@babel/core";
import { buildDynamicImport } from "@babel/helper-module-transforms";

/**
 * Convert an import-attributes (`with { ... }`) object expression into the
 * plain object literal that `jitiImport(id, options)` expects.
 *
 * Both the standard `with` key and the legacy `assert` key are accepted, and a
 * key may be written as an identifier or as a string literal.
 */
function attributesFromOptionsNode(
  node: t.Node | undefined | null,
): t.ObjectExpression | undefined {
  if (!node || !t.isObjectExpression(node)) {
    return undefined;
  }
  for (const prop of node.properties) {
    if (!t.isObjectProperty(prop) || !t.isObjectExpression(prop.value)) {
      continue;
    }
    let keyName: string | undefined;
    if (t.isIdentifier(prop.key)) {
      keyName = prop.key.name;
    } else if (t.isStringLiteral(prop.key)) {
      keyName = prop.key.value;
    }
    if (keyName === "with" || keyName === "assert") {
      return prop.value;
    }
  }
  return undefined;
}

const requireInterop = (
  source: t.Expression,
  file: BabelFile,
  noInterop: boolean | undefined,
  attributes?: t.ObjectExpression,
) => {
  // `jitiImport(specifier)` or `jitiImport(specifier, { attributes })`
  const exp = attributes
    ? t.callExpression(t.identifier("jitiImport"), [
        source,
        t.objectExpression([
          t.objectProperty(t.identifier("attributes"), attributes),
        ]),
      ])
    : t.callExpression(t.identifier("jitiImport"), [source]);
  if (noInterop) {
    return exp;
  }
  return t.callExpression(t.memberExpression(exp, t.identifier("then")), [
    t.arrowFunctionExpression(
      [t.identifier("m")],
      t.callExpression(file.addHelper("interopRequireWildcard"), [
        t.identifier("m"),
      ]),
    ),
  ]);
};

export function transformDynamicImport(
  path: NodePath<t.CallExpression | t.ImportExpression>,
  noInterop: boolean | undefined,
  file: BabelFile,
) {
  // `import(specifier, { with: {...} })` -> options node (2nd argument).
  // With `parserOpts.createImportExpressions` (Babel 8 / explicit opt-in) the
  // node is an `ImportExpression` and the options live on `node.options`.
  const optionsNode = (
    path.isCallExpression()
      ? path.node.arguments[1]
      : (path.node as t.ImportExpression).options
  ) as t.Node | undefined | null;
  const attributes = attributesFromOptionsNode(optionsNode);

  path.replaceWith(
    buildDynamicImport(path.node, true, false, (specifier: t.Node) =>
      requireInterop(specifier as t.Expression, file, noInterop, attributes),
    ),
  );
}
