const path = require("node:path");

const resolvedPath = require.resolve("./foo.mjs", {
  paths: [path.resolve(__dirname, "./_dist")],
});
console.log("resolved path", resolvedPath);
