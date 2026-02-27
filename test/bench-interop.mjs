/**
 * Benchmark to measure the performance impact of jiti's interopDefault Proxy wrapper.
 *
 * Compares jiti with interopDefault enabled vs disabled to isolate
 * the Proxy overhead from other jiti internals.
 *
 * Run: node test/bench-interop.mjs
 */

import { bench, compact, group, summary, run } from "mitata";
import { createJiti } from "../lib/jiti.mjs";
import { writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";

// Create test modules
const testModulePath = join(import.meta.dirname, "_bench-module.mjs");
writeFileSync(
  testModulePath,
  /* js */ `
export function add(a, b) {
  return a + b;
}

export default {
  multiply(a, b) {
    return a * b;
  }
};
`,
);

const propModulePath = join(import.meta.dirname, "_bench-prop-module.mjs");
writeFileSync(propModulePath, `export const value = 42;`);

// Load modules
const jiti = createJiti(import.meta.url);
const jitiNoInterop = createJiti(import.meta.url, { interopDefault: false });

const jitiMod = await jiti.import(testModulePath);
const jitiModNoInterop = await jitiNoInterop.import(testModulePath);
const jitiPropMod = await jiti.import(propModulePath);
const jitiPropModNoInterop = await jitiNoInterop.import(propModulePath);

// Sink to prevent dead code elimination
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let sink;

// Benchmarks
group("named export (add)", () => {
  compact(() => {
    summary(() => {
      bench("interopDefault=true", () => {
        sink = jitiMod.add(1, 2);
      });
      bench("interopDefault=false", () => {
        sink = jitiModNoInterop.add(1, 2);
      });
    });
  });
});

group("fallback to default (multiply)", () => {
  compact(() => {
    summary(() => {
      bench("interopDefault=false", () => {
        sink = jitiModNoInterop.default.multiply(2, 3);
      });
      bench("interopDefault=true", () => {
        sink = jitiMod.multiply(2, 3);
      });
    });
  });
});

group("property access", () => {
  compact(() => {
    summary(() => {
      bench("interopDefault=false", () => {
        sink = jitiPropModNoInterop.value;
      });
      bench("interopDefault=true", () => {
        sink = jitiPropMod.value;
      });
    });
  });
});

await run();

// Cleanup
unlinkSync(testModulePath);
unlinkSync(propModulePath);
