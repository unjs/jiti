import { createJiti } from "../../../lib/jiti.cjs";

async function main() {
  const jiti = createJiti(import.meta.url);

  const mod = await jiti.import("./export-promise.mjs", { default: false });
  console.log("module:", mod);

  const defaultMod = await jiti.import("./export-promise.mjs", {
    default: true,
  });
  console.log("default module:", defaultMod);
}

main().catch((error_) => {
  console.error("Error:", error_);
});
