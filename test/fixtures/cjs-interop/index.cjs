const { createJiti } = require("../../../lib/jiti.cjs");
const path = require("node:path");

async function main() {
  const jiti = createJiti(__filename);

  const fn = await jiti.import(
    path.resolve(__dirname, "./function-default.cjs"),
    { default: true },
  );

  if (typeof fn === "function") {
    console.log("CJS function default interop test passed");
  } else {
    console.log("CJS function default interop test failed");
  }

  // #468: the same unwrapping must happen when the default export is a plain
  // object, not only when it is callable.
  const obj = await jiti.import(
    path.resolve(__dirname, "./object-default.cjs"),
    {
      default: true,
    },
  );

  if (obj?.test === 123 && obj.default === undefined) {
    console.log("CJS object default interop test passed");
  } else {
    console.log("CJS object default interop test failed");
  }
}

main().catch((error_) => {
  console.error("Error:", error_);
});
