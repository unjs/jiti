import path from "node:path";
import fsp from "node:fs/promises";

import { purgePolyfills } from "unplugin-purge-polyfills";
import TerserPlugin from "terser-webpack-plugin";
import { createRequire } from "node:module";
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const require = createRequire(import.meta.url);

const isProd = process.env.NODE_ENV === "production";

export default {
  target: "node",
  mode: isProd ? "production" : "development",
  entry: {
    jiti: "./src/jiti.ts",
    babel: "./src/babel.ts",
  },
  devtool: false,
  output: {
    filename: "[name].js",
    path: path.resolve("dist"),
    libraryTarget: "commonjs2",
    libraryExport: "default",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@babel/code-frame": require.resolve("./stubs/babel-codeframe"),
      "@babel/helper-compilation-targets": require.resolve(
        "./stubs/helper-compilation-targets",
      ),
    },
  },
  plugins: [
    process.argv.find(arg => arg.includes('--analyze')) && new BundleAnalyzerPlugin({}),
    purgePolyfills.webpack({
      mode: "transform",
      logLevel: "verbose",
    }),
  ],
  ignoreWarnings: [/critical dependency:/i],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  node: false,
  optimization: {
    nodeEnv: false,
    moduleIds: "named",
    chunkIds: "named",
    minimizer: isProd
      ? [
        new TerserPlugin({
          terserOptions: {
            // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
            mangle: false,
          },
        }),
      ]
      : [],
  },
};
