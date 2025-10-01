const runtime =
  // eslint-disable-next-line unicorn/no-nested-ternary
  "Bun" in globalThis ? "bun" : "Deno" in globalThis ? "deno" : "node";

console.log("--------------------------------");

console.log(
  `> ${runtime} ${globalThis.Deno?.version.deno || globalThis.Bun?.version || process.version}`,
);

const initialMem = process.memoryUsage().heapUsed;
let lastMem = initialMem;
const logMemory = (label) => {
  const mem = process.memoryUsage().heapUsed;
  console.log(
    label,
    "+" + ((mem - lastMem) / 1024 / 1024).toFixed(2) + " MB" + " (heap)",
  );
  lastMem = mem;
};

console.time("jiti:load");
const { createJiti } = await import("jiti");
console.timeEnd("jiti:load");
logMemory("jiti:load");

console.time("jiti:init");
const jiti = createJiti(import.meta.url, {
  moduleCache: false,
  fsCache: false,
});
console.timeEnd("jiti:init");
logMemory("jiti:init");

for (let i = 0; i < 4; i++) {
  console.time("jiti:import:ts");
  await jiti.import("../fixtures/typescript/test.ts");
  console.timeEnd("jiti:import:ts");
  logMemory("jiti:import:ts");
}
