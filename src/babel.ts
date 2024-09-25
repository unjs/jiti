import type {
  TransformOptions as BabelTransformOptions,
  PluginItem,
} from "@babel/core";
import { transformSync } from "@babel/core";
import proposalDecoratorsPlugin from "@babel/plugin-proposal-decorators";
import syntaxClassPropertiesPlugin from "@babel/plugin-syntax-class-properties";
import syntaxImportAssertionsPlugin from "@babel/plugin-syntax-import-assertions";
import transformExportNamespaceFromPlugin from "@babel/plugin-transform-export-namespace-from";
import transformTypeScriptPlugin from "@babel/plugin-transform-typescript";
import parameterDecoratorPlugin from "babel-plugin-parameter-decorator";
// import transformTypeScriptMetaPlugin from "babel-plugin-transform-typescript-metadata";
import transformTypeScriptMetaPlugin from "./plugins/babel-plugin-transform-typescript-metadata";
import syntaxJSXPlugin from "@babel/plugin-syntax-jsx";
import transformReactJSX from "@babel/plugin-transform-react-jsx";
import { TransformImportMetaPlugin } from "./plugins/babel-plugin-transform-import-meta";
import { importMetaEnvPlugin } from "./plugins/import-meta-env";
import transformModulesPlugin from "./plugins/transform-module";
import type { TransformOptions, TransformResult } from "./types";

export default function transform(opts: TransformOptions): TransformResult {
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
      [TransformImportMetaPlugin, { filename: opts.filename }],
      [syntaxClassPropertiesPlugin],
      [transformExportNamespaceFromPlugin],
      [importMetaEnvPlugin],
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
      { allowDeclareFields: true },
    ]);
    // `unshift` because these plugin must come before `@babel/plugin-syntax-class-properties`
    _opts.plugins.unshift(
      [transformTypeScriptMetaPlugin],
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
