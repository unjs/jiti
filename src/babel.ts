import type {
  TransformOptions as BabelTransformOptions,
  PluginItem,
} from "@babel/core";
import { transformSync } from "@babel/core";
import proposalDecoratorsPlugin from "@babel/plugin-proposal-decorators";
import syntaxImportAssertionsPlugin from "@babel/plugin-syntax-import-assertions";
import syntaxJSXPlugin from "@babel/plugin-syntax-jsx";
import syntaxClassPropertiesPlugin from "@babel/plugin-syntax-class-properties";
import transformClassPropertiesPlugin from "@babel/plugin-transform-class-properties";
import transformPrivateMethodsPlugin from "@babel/plugin-transform-private-methods";
import transformExportNamespaceFromPlugin from "@babel/plugin-transform-export-namespace-from";
import transformReactJSX from "@babel/plugin-transform-react-jsx";
import transformTypeScriptPlugin from "@babel/plugin-transform-typescript";
import parameterDecoratorPlugin from "babel-plugin-parameter-decorator";
import transformTypeScriptMetaPlugin from "./plugins/babel-plugin-transform-typescript-metadata";
import importMetaEnvPlugin from "./plugins/import-meta-env";
import importMetaResolvePlugin from "./plugins/import-meta-resolve";
import importMetaPathsPlugin from "./plugins/import-meta-paths";
import transformModulesPlugin from "./plugins/transform-module";
import type { TransformOptions, TransformResult } from "./types";

export default function transform(opts: TransformOptions): TransformResult {
  const transforms = [[transformExportNamespaceFromPlugin]];

  if (opts.experimentalTransforms) {
    transforms.push(
      [transformClassPropertiesPlugin],
      [transformPrivateMethodsPlugin],
    );
  }

  const _opts: BabelTransformOptions & { plugins: PluginItem[] } = {
    babelrc: false,
    configFile: false,
    compact: false,
    retainLines:
      typeof opts.retainLines === "boolean" ? opts.retainLines : true,
    filename: "",
    cwd: "/",
    ...opts.babel,
    plugins: [
      [
        transformModulesPlugin,
        {
          allowTopLevelThis: true,
          noInterop: !opts.interopDefault,
          async: opts.async,
        },
      ],
      [importMetaPathsPlugin, { filename: opts.filename }],
      [importMetaEnvPlugin],
      [importMetaResolvePlugin],
      [syntaxClassPropertiesPlugin],
      ...transforms,
    ],
  };

  if (opts.jsx) {
    _opts.plugins.push(
      [syntaxJSXPlugin],
      [transformReactJSX, Object.assign({}, opts.jsx)],
    );
  }

  if (opts.ts) {
    _opts.plugins.push([
      transformTypeScriptPlugin,
      {
        allowDeclareFields: true,
        isTSX: opts.jsx && /\.[cm]?tsx$/.test(opts.filename || ""),
      },
    ]);
    // `unshift` because these plugin must come before `@babel/plugin-transform-class-properties`
    _opts.plugins.unshift(
      [transformTypeScriptMetaPlugin],
      [proposalDecoratorsPlugin, { legacy: true }],
    );
    _opts.plugins.push(parameterDecoratorPlugin);
    _opts.plugins.push(syntaxImportAssertionsPlugin);
  }

  if (opts.babel && Array.isArray(opts.babel.plugins)) {
    _opts.plugins?.push(...opts.babel.plugins);
  }

  try {
    return {
      code: transformSync(opts.source, _opts)?.code || "",
    };
  } catch (error: any) {
    return {
      error,
      code:
        "exports.__JITI_ERROR__ = " +
        JSON.stringify({
          filename: opts.filename,
          line: error.loc?.line || 0,
          column: error.loc?.column || 0,
          code: error.code
            ?.replace("BABEL_", "")
            .replace("PARSE_ERROR", "ParseError"),
          message: error.message?.replace("/: ", "").replace(/\(.+\)\s*$/, ""),
        }),
    };
  }
}
