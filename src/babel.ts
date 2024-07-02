import { transformSync } from "@babel/core";
import type {
  TransformOptions as BabelTransformOptions,
  PluginItem,
} from "@babel/core";
import type { TransformOptions, TransformResult } from "./types";
import { TransformImportMetaPlugin } from "./plugins/babel-plugin-transform-import-meta";
import { importMetaEnvPlugin } from "./plugins/import-meta-env";
import transformModulesPlugin from "./plugins/transform-module";
import tansformTypescriptMetaPlugin from "babel-plugin-transform-typescript-metadata";
// @ts-ignore
import syntaxClassPropertiesPlugin from "@babel/plugin-syntax-class-properties";
// @ts-ignore
import transformExportNamespaceFromPlugin from "@babel/plugin-transform-export-namespace-from";
// @ts-ignore
import tansformTypescriptPlugin from "@babel/plugin-transform-typescript";
// @ts-ignore
import proposalDecoratorsPlugin from "@babel/plugin-proposal-decorators";
// @ts-ignore
import parameterDecoratorPlugin from "babel-plugin-parameter-decorator";
// @ts-ignore
import syntaxImportAssertionsPlugin from "@babel/plugin-syntax-import-assertions";

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

  if (opts.ts) {
    _opts.plugins.push([
      tansformTypescriptPlugin,
      { allowDeclareFields: true },
    ]);
    // `unshift` because these plugin must come before `@babel/plugin-syntax-class-properties`
    _opts.plugins.unshift(
      [tansformTypescriptMetaPlugin],
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
