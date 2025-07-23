// Based on babel-plugin-transform-modules-commonjs v7.24.7
// MIT - Copyright (c) 2014-present Sebastian McKenzie and other contributors
// https://github.com/babel/babel/tree/c7bb6e0f/packages/babel-plugin-transform-modules-commonjs/src

import type { NodePath, PluginPass, Visitor } from "@babel/core";
import { types as t, template } from "@babel/core";
import { isModule } from "@babel/helper-module-imports";
import type {
  PluginOptions,
  RewriteModuleStatementsAndPrepareHeaderOptions,
} from "@babel/helper-module-transforms";
import {
  buildNamespaceInitStatements,
  ensureStatementsHoisted,
  getModuleName,
  isSideEffectImport,
  rewriteModuleStatementsAndPrepareHeader,
  wrapInterop,
} from "@babel/helper-module-transforms";
import type { PluginAPI } from "@babel/helper-plugin-utils";
import { declare } from "@babel/helper-plugin-utils";
import simplifyAccess from "@babel/helper-simple-access";
import type { Scope } from "@babel/traverse";
import { transformDynamicImport } from "./dynamic-import";
import { defineCommonJSHook, makeInvokers } from "./hooks";
import { lazyImportsHook } from "./lazy";

interface Options extends PluginOptions {
  allowCommonJSExports?: boolean;
  allowTopLevelThis?: boolean;
  importInterop?: RewriteModuleStatementsAndPrepareHeaderOptions["importInterop"];
  lazy?: RewriteModuleStatementsAndPrepareHeaderOptions["lazy"];
  loose?: boolean;
  mjsStrictNamespace?: boolean;
  noInterop?: boolean;
  strict?: boolean;
  strictMode?: boolean;
  strictNamespace?: boolean;
  async: boolean;
}

// @ts-expect-error
export default declare((api: PluginAPI, options: Options) => {
  // api.assertVersion(REQUIRED_VERSION(7));

  const {
    // 'true' for imports to strictly have .default, instead of having
    // destructuring-like behavior for their properties. This matches the behavior
    // of the initial Node.js (v12) behavior when importing a CommonJS without
    // the __esModule property.
    // .strictNamespace is for non-mjs files, mjsStrictNamespace if for mjs files.
    strictNamespace = false,
    mjsStrictNamespace = strictNamespace,

    allowTopLevelThis,
    strict,
    strictMode,
    noInterop,
    importInterop,
    lazy = false,
    // Defaulting to 'true' for now. May change before 7.x major.
    allowCommonJSExports = true,
    loose = false,
    async = false,
  } = options;

  const constantReexports = api.assumption("constantReexports") ?? loose;
  const enumerableModuleMeta = api.assumption("enumerableModuleMeta") ?? loose;
  const noIncompleteNsImportDetection =
    api.assumption("noIncompleteNsImportDetection") ?? false;

  if (
    typeof lazy !== "boolean" &&
    typeof lazy !== "function" &&
    (!Array.isArray(lazy) || !lazy.every((item) => typeof item === "string"))
  ) {
    throw new Error(`.lazy must be a boolean, array of strings, or a function`);
  }

  if (typeof strictNamespace !== "boolean") {
    throw new TypeError(`.strictNamespace must be a boolean, or undefined`);
  }
  if (typeof mjsStrictNamespace !== "boolean") {
    throw new TypeError(`.mjsStrictNamespace must be a boolean, or undefined`);
  }

  const getAssertion = (localName: string) => template.expression.ast`
    (function(){
      throw new Error(
        "The CommonJS '" + "${localName}" + "' variable is not available in ES6 modules." +
        "Consider setting setting sourceType:script or sourceType:unambiguous in your " +
        "Babel config for this file.");
    })()
  `;

  const moduleExportsVisitor: Visitor<{ scope: Scope }> = {
    ReferencedIdentifier(path) {
      const localName = path.node.name;
      if (localName !== "module" && localName !== "exports") return;

      const localBinding = path.scope.getBinding(localName);
      const rootBinding = this.scope.getBinding(localName);

      if (
        // redeclared in this scope
        rootBinding !== localBinding ||
        (path.parentPath.isObjectProperty({ value: path.node }) &&
          path.parentPath.parentPath.isObjectPattern()) ||
        path.parentPath.isAssignmentExpression({ left: path.node }) ||
        path.isAssignmentExpression({ left: path.node })
      ) {
        return;
      }

      path.replaceWith(getAssertion(localName));
    },

    UpdateExpression(path) {
      const arg = path.get("argument");
      if (!arg.isIdentifier()) return;
      const localName = arg.node.name;
      if (localName !== "module" && localName !== "exports") return;

      const localBinding = path.scope.getBinding(localName);
      const rootBinding = this.scope.getBinding(localName);

      // redeclared in this scope
      if (rootBinding !== localBinding) return;

      path.replaceWith(
        t.assignmentExpression(
          path.node.operator[0] + "=",
          arg.node,
          getAssertion(localName),
        ),
      );
    },

    AssignmentExpression(path) {
      const left = path.get("left");
      if (left.isIdentifier()) {
        const localName = left.node.name;
        if (localName !== "module" && localName !== "exports") return;

        const localBinding = path.scope.getBinding(localName);
        const rootBinding = this.scope.getBinding(localName);

        // redeclared in this scope
        if (rootBinding !== localBinding) return;

        const right = path.get("right");
        right.replaceWith(
          t.sequenceExpression([right.node, getAssertion(localName)]),
        );
      } else if (left.isPattern()) {
        const ids = left.getOuterBindingIdentifiers();
        const localName = Object.keys(ids).find((localName) => {
          if (localName !== "module" && localName !== "exports") return false;

          return (
            this.scope.getBinding(localName) ===
            path.scope.getBinding(localName)
          );
        });

        if (localName) {
          const right = path.get("right");
          right.replaceWith(
            t.sequenceExpression([right.node, getAssertion(localName)]),
          );
        }
      }
    },
  };

  return {
    name: "transform-modules-commonjs",

    pre() {
      this.file.set("@babel/plugin-transform-modules-*", "commonjs");

      if (lazy) defineCommonJSHook(this.file, lazyImportsHook(lazy));
    },

    visitor: {
      ["CallExpression" +
        // @ts-expect-error
        (api.types.importExpression ? "|ImportExpression" : "")](
        this: PluginPass,
        path: NodePath<t.CallExpression | t.ImportExpression>,
      ) {
        if (path.isCallExpression() && !t.isImport(path.node.callee)) return;

        let { scope } = path;
        do {
          scope.rename("require");
        } while ((scope = scope.parent));

        transformDynamicImport(path, noInterop, this.file);
      },

      Program: {
        exit(path, state) {
          if (!isModule(path)) return;

          // Rename the bindings auto-injected into the scope so there is no
          // risk of conflict between the bindings.
          path.scope.rename("exports");
          path.scope.rename("module");
          path.scope.rename("require");
          path.scope.rename("__filename");
          path.scope.rename("__dirname");

          // Rewrite references to 'module' and 'exports' to throw exceptions.
          // These objects are specific to CommonJS and are not available in
          // real ES6 implementations.
          if (!allowCommonJSExports) {
            if (process.env.BABEL_8_BREAKING) {
              simplifyAccess(path, new Set(["module", "exports"]));
            } else {
              simplifyAccess(path, new Set(["module", "exports"]), false);
            }
            path.traverse(moduleExportsVisitor, {
              scope: path.scope,
            });
          }

          let moduleName = getModuleName(this.file.opts, options);
          // @ts-expect-error
          if (moduleName) moduleName = t.stringLiteral(moduleName);

          const hooks = makeInvokers(this.file);

          const { meta, headers } = rewriteModuleStatementsAndPrepareHeader(
            path,
            {
              exportName: "exports",
              constantReexports,
              enumerableModuleMeta,
              strict,
              strictMode,
              allowTopLevelThis,
              noInterop,
              importInterop,
              wrapReference: hooks.wrapReference,
              getWrapperPayload: hooks.getWrapperPayload,
              esNamespaceOnly:
                typeof state.filename === "string" &&
                /\.mjs$/.test(state.filename)
                  ? mjsStrictNamespace
                  : strictNamespace,
              noIncompleteNsImportDetection,
              filename: this.file.opts.filename,
            },
          );

          for (const [source, metadata] of meta.source) {
            const loadExpr = async
              ? t.awaitExpression(
                  t.callExpression(t.identifier("jitiImport"), [
                    t.stringLiteral(source),
                  ]),
                )
              : t.callExpression(t.identifier("require"), [
                  t.stringLiteral(source),
                ]);

            let header: t.Statement | undefined | null;
            if (isSideEffectImport(metadata)) {
              if (lazy && metadata.wrap === "function") {
                throw new Error("Assertion failure");
              }

              header = t.expressionStatement(loadExpr);
            } else {
              const init =
                wrapInterop(path, loadExpr, metadata.interop) || loadExpr;

              if (metadata.wrap) {
                const res = hooks.buildRequireWrapper!(
                  metadata.name,
                  init,
                  metadata.wrap,
                  metadata.referenced,
                );
                if (res === false) continue;
                else {
                  header = res;
                }
              }
              header ??= template.statement.ast`
                var ${metadata.name} = ${init};
              `;
            }
            header.loc = metadata.loc;
            headers.push(
              header,
              ...buildNamespaceInitStatements(
                meta,
                metadata,
                constantReexports,
                hooks.wrapReference,
              ),
            );
          }

          ensureStatementsHoisted(headers);
          path.unshiftContainer("body", headers);
          // eslint-disable-next-line unicorn/no-array-for-each
          path.get("body").forEach((path) => {
            if (!headers.includes(path.node)) return;
            if (path.isVariableDeclaration()) {
              path.scope.registerDeclaration(path);
            }
          });
        },
      },
    },
  };
});

export { defineCommonJSHook } from "./hooks";
