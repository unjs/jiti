import { fileURLToPath } from 'node:url';
import TerserPlugin from 'terser-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { purgePolyfills } from "unplugin-purge-polyfills";

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
    filename: "[name].cjs",
    path: fileURLToPath(import.meta.resolve('./dist')),
    libraryTarget: "commonjs2",
    libraryExport: "default",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".cjs", ".mjs", ".json"],
    alias: {
      "@babel/code-frame": fileURLToPath(import.meta.resolve("./stubs/babel-codeframe.mjs")),
      "@babel/helper-compilation-targets": fileURLToPath(import.meta.resolve(
        "./stubs/helper-compilation-targets.mjs",
      )),
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
