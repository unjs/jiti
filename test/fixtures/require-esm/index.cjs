async function run() {
  let mod;
  try {
    mod = require("./_dist/esm.js");
  } catch {
    const { createJiti } = await import("../../../lib/jiti.mjs");
    const jiti = createJiti(__filename, { interopDefault: true });
    mod = await jiti.import("./_dist/esm.js");
  }
  mod = mod.default;
  if (typeof mod.fn === "function") {
    console.log("Works!");
    return;
  }
  console.error("broken!", { mod });
}

run();
