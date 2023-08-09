const path = require("path");
const fsp = require("fs/promises");

const TerserPlugin = require("terser-webpack-plugin");

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
    // https://github.com/unjs/jiti/issues/109
    // TODO: Remove in next semver-major version
    (compiler) => {
      const plugin = { name: "replace node: protocol" };
      compiler.hooks.done.tap(plugin, async () => {
        const jitiDist = path.resolve(compiler.options.context, "dist/jiti.js");
        const src = await fsp.readFile(jitiDist, "utf8");
        const newSrc = src.replace(/require\("node:/g, 'require("');
        await fsp.writeFile(jitiDist, newSrc, "utf8");
      });
    },
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
