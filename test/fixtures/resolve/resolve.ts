const path = require("node:path");

const resolvedPath = require.resolve("./foo.mjs", {
  paths: [path.resolve(__dirname, "./dist")],
});
console.log("resolved path", resolvedPath);
