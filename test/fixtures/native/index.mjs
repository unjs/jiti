import { createJiti } from "../../../lib/jiti.cjs";

async function main() {
  import("./test.mjs").then(console.log);

  const jiti = createJiti(import.meta.url, { tryNative: true });
  await jiti.import("./foo.ts");
}

main();
