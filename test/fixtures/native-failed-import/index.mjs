import { createJiti } from "../../../lib/jiti.cjs";

async function main() {
  await import("./a.ts").catch(() => {});

  const jiti = createJiti(import.meta.url);
  const mod = await jiti.import("./a.ts");
  console.log(mod.value);
}

main();
