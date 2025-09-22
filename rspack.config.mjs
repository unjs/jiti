import { fileURLToPath } from "node:url";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import { rspack } from "@rspack/core";

export default {
  target: "node",
  mode: "production",
  entry: {
    jiti: "./src/jiti.ts",
    babel: "./src/babel.ts",
  },
  devtool: false,
  output: {
    filename: "[name].cjs",
    path: fileURLToPath(import.meta.resolve("./dist")),
    libraryTarget: "commonjs2",
    libraryExport: "default",
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".cjs", ".mjs", ".json"],
    alias: {
      "@babel/code-frame": fileURLToPath(
        import.meta.resolve("./stubs/babel-codeframe.mjs"),
      ),
      "@babel/helper-compilation-targets": fileURLToPath(
        import.meta.resolve("./stubs/helper-compilation-targets.mjs"),
      ),
    },
  },
  plugins: [
    process.argv.find((arg) => arg.includes("--analyze")) &&
      new BundleAnalyzerPlugin({}),
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
    minimize: true,
    minimizer: [new rspack.SwcJsMinimizerRspackPlugin({ mangle: false })],
  },
};
