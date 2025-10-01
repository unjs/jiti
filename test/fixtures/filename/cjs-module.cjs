module.exports = {
  filename: __filename,
  dirname: __dirname,
  stackTop: require("./get-stack-trace.cjs").getStackTrace(),
};
