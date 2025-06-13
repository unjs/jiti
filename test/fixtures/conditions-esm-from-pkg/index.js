async function run() {
  const { createJiti } = await import("../../../lib/jiti.mjs");

  const jiti = createJiti(import.meta.url);

  const mod = await jiti.import("test-package-1");

  if (mod.namedMagic === "named-magic" && mod.default === "default-magic") {
    console.log("Works!");
    return;
  }

  console.error("broken!", { mod });
}

run();
