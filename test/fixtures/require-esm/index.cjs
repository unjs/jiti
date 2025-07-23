async function run() {
  let mod;
  try {
    mod = require("./_dist/esm.js");
  } catch {
    const { createJiti } = await import("../../../lib/jiti.mjs");
    const jiti = createJiti(__filename);
    mod = await jiti.import("./_dist/esm.js");
  }
  mod = mod.default;
  if (typeof mod.fn === "function" && typeof mod.fn2 === "function") {
    console.log("Works!");
    return;
  }
  console.error("broken!", { mod });
}

run();
