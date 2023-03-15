import { transformSync } from "@babel/core";
import type {
  TransformOptions as BabelTransformOptions,
  PluginItem,
} from "@babel/core";
import { TransformOptions, TRANSFORM_RESULT } from "./types";
import { TransformImportMetaPlugin } from "./plugins/babel-plugin-transform-import-meta";
import { importMetaEnvPlugin } from "./plugins/import-meta-env";

export default function transform(opts: TransformOptions): TRANSFORM_RESULT {
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
        require("@babel/plugin-transform-modules-commonjs"),
        { allowTopLevelThis: true },
      ],
      [require("babel-plugin-dynamic-import-node"), { noInterop: true }],
      [TransformImportMetaPlugin, { filename: opts.filename }],
      [require("@babel/plugin-syntax-class-properties")],
      [require("@babel/plugin-proposal-export-namespace-from")],
      [
        importMetaEnvPlugin,
        { transformMode: "runtime", example: ".env", envFilePath: ".env" },
      ],
    ],
  };

  if (opts.ts) {
    _opts.plugins.push([
      require("@babel/plugin-transform-typescript"),
      { allowDeclareFields: true },
    ]);
    // `unshift` because these plugin must come before `@babel/plugin-syntax-class-properties`
    _opts.plugins.unshift(
      [require("babel-plugin-transform-typescript-metadata")],
      [require("@babel/plugin-proposal-decorators"), { legacy: true }]
    );
    _opts.plugins.push(require("babel-plugin-parameter-decorator"));
    _opts.plugins.push(require("@babel/plugin-syntax-import-assertions"));
  }

  if (opts.legacy) {
    _opts.plugins.push(
      require("@babel/plugin-proposal-nullish-coalescing-operator")
    );
    _opts.plugins.push(require("@babel/plugin-proposal-optional-chaining"));
  }

  if (opts.babel && Array.isArray(opts.babel.plugins)) {
    _opts.plugins?.push(...opts.babel.plugins);
  }

  try {
    console.log(transformSync(opts.source, _opts)?.code);
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
