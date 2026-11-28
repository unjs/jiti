// Based on babel-plugin-transform-modules-commonjs v7.24.7
// MIT - Copyright (c) 2014-present Sebastian McKenzie and other contributors
// https://github.com/babel/babel/tree/c7bb6e0f/packages/babel-plugin-transform-modules-commonjs/src

// Heavily inspired by
// https://github.com/airbnb/babel-plugin-dynamic-import-node/blob/master/src/utils.js

import type { BabelFile, NodePath } from "@babel/core";
import { types as t } from "@babel/core";
import { buildDynamicImport } from "@babel/helper-module-transforms";

/**
 * Read the `with` / `assert` entry of an options object expression.
 * The key may be written as an identifier or as a string literal.
 */
function optionsEntry(node: t.ObjectExpression): t.ObjectProperty | undefined {
  for (const prop of node.properties) {
    if (!t.isObjectProperty(prop)) {
      continue;
    }
    let keyName: string | undefined;
    if (t.isIdentifier(prop.key)) {
      keyName = prop.key.name;
    } else if (t.isStringLiteral(prop.key)) {
      keyName = prop.key.value;
    }
    if (keyName === "with" || keyName === "assert") {
      return prop;
    }
  }
  return undefined;
}

/**
 * Convert the second argument of `import(specifier, options)` into an
 * expression that evaluates to the import attributes.
 *
 * Only an object literal whose `with` / `assert` entry is itself an object
 * literal can be resolved statically. Everything else — an options variable, a
 * `with` value held in a variable, a computed key — has to be evaluated at the
 * original import-call boundary, because Node reads the options synchronously
 * when `import()` is called, not when the module finally settles.
 */
function attributesFromOptionsNode(
  node: t.Node | undefined | null,
): t.Expression | undefined {
  if (!node) {
    return undefined;
  }
  if (t.isObjectExpression(node)) {
    const entry = optionsEntry(node);
    if (entry) {
      return entry.value as t.Expression;
    }
    // `{}` (or an object without a `with`/`assert` key) carries no attributes.
    return undefined;
  }
  if (!t.isExpression(node)) {
    return undefined;
  }
  // Options held in a variable: `import(id, opts)`.
  // `(o) => o && (o.with || o.assert)` reads the same shape Node reads.
  return t.callExpression(
    t.arrowFunctionExpression(
      [t.identifier("o")],
      t.logicalExpression(
        "&&",
        t.identifier("o"),
        t.logicalExpression(
          "||",
          t.memberExpression(t.identifier("o"), t.identifier("with")),
          t.memberExpression(t.identifier("o"), t.identifier("assert")),
        ),
      ),
    ),
    [node],
  );
}

const requireInterop = (
  source: t.Expression,
  file: BabelFile,
  noInterop: boolean | undefined,
  attributes?: t.Expression,
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

  // `deferToThen: false` + `wrapWithPromise: true` keeps the specifier and the
  // options evaluated synchronously at the `import()` call site, which is what
  // Node does. Deferring to `.then()` would let a later mutation of `kind`
  // change which attributes are validated.
  path.replaceWith(
    buildDynamicImport(path.node, false, true, (specifier: t.Node) =>
      requireInterop(specifier as t.Expression, file, noInterop, attributes),
    ),
  );
}
