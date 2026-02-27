async function run() {
  const { createJiti } = await import("../../../lib/jiti.mjs");
  const jiti = createJiti(__filename);
  await jiti.import("./resolve.ts");
}

run();
