import { fileURLToPath } from "node:url";
import { rspack } from "@rspack/core";
import { defineConfig } from "@rspack/cli";

export default defineConfig({
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
  ignoreWarnings: [
    {
      module: /[\\/]node_modules[\\/]mlly[\\/]/,
      message: /the request of a dependency is an expression/,
    },
    {
      module: /[\\/]node_modules[\\/]@babel.*/,
      message: /require.extensions is not supported/,
    },
    {
      module: /[\\/]node_modules[\\/]@babel.*/,
      message:
        /the request of a dependency is an expression|require function is used in a way in which/,
    },
  ],
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
    minimizer: [
      new rspack.SwcJsMinimizerRspackPlugin({
        minimizerOptions: { mangle: false },
      }),
    ],
  },
});
