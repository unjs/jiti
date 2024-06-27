const path = require("node:path");
const fsp = require("node:fs/promises");

const TerserPlugin = require("terser-webpack-plugin");
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const isProd = process.env.NODE_ENV === "production";

module.exports = {
  target: "node",
  mode: isProd ? "production" : "development",
  entry: {
    jiti: "./src/jiti.ts",
    babel: "./src/babel.ts",
  },
  devtool: false,
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
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
    process.argv.find(arg => arg.includes('--analyze')) && new BundleAnalyzerPlugin({})
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
