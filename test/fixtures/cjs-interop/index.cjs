const { createJiti } = require("../../../lib/jiti.cjs");
const path = require("node:path");

async function main() {
  const jiti = createJiti(__filename);
  const modPath = path.resolve(__dirname, "./function-default.cjs");

  const loaded = await jiti.import(modPath, { default: true });

  if (typeof loaded === "function") {
    console.log("CJS function default interop test passed");
  } else {
    console.log("CJS function default interop test failed");
  }
}

main().catch((error_) => {
  console.error("Error:", error_);
});
