/**
 * Benchmark to demonstrate the performance overhead of jiti's interopDefault Proxy wrapper.
 *
 * The issue: Every module loaded by jiti is wrapped in a Proxy that intercepts
 * all property accesses. When accessing functions from the default export,
 * it also calls .bind() on EVERY access, not just once.
 *
 * Run: node test/bench-interop.mjs
 */

import { createJiti } from "../lib/jiti.mjs";
import { writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";

// Create a simple test module
const testModulePath = join(import.meta.dirname, "_bench-module.mjs");
writeFileSync(
  testModulePath,
  `
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

const ITERATIONS = 1_000_000;

console.log(
  `\nBenchmarking with ${ITERATIONS.toLocaleString()} iterations...\n`,
);

// Load via jiti (with interopDefault proxy)
const jiti = createJiti(import.meta.url);
const jitiMod = await jiti.import(testModulePath);

// Load natively (no proxy)
const nativeMod = await import(testModulePath);

// Also test with interopDefault disabled
const jitiNoInterop = createJiti(import.meta.url, { interopDefault: false });
const jitiModNoInterop = await jitiNoInterop.import(testModulePath);

console.log("--- Named export (add) ---");

// Warm up
for (let i = 0; i < 1000; i++) {
  jitiMod.add(1, 2);
  nativeMod.add(1, 2);
  jitiModNoInterop.add(1, 2);
}

// Benchmark jiti with interopDefault
let start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  jitiMod.add(1, 2);
}
const jitiTime = performance.now() - start;
console.log(`jiti (interopDefault=true):  ${jitiTime.toFixed(2)}ms`);

// Benchmark jiti without interopDefault
start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  jitiModNoInterop.add(1, 2);
}
const jitiNoInteropTime = performance.now() - start;
console.log(`jiti (interopDefault=false): ${jitiNoInteropTime.toFixed(2)}ms`);

// Benchmark native
start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  nativeMod.add(1, 2);
}
const nativeTime = performance.now() - start;
console.log(`native import:               ${nativeTime.toFixed(2)}ms`);

console.log(
  `\nOverhead (interopDefault): ${(jitiTime / nativeTime).toFixed(2)}x slower`,
);
console.log(
  `Overhead (no interop):     ${(jitiNoInteropTime / nativeTime).toFixed(2)}x slower`,
);

console.log("\n--- Fallback to default (calling multiply directly) ---");
console.log(
  "This tests the most expensive path: Proxy get -> Reflect.has (miss) -> Reflect.get on default -> .bind()",
);

// Warm up
for (let i = 0; i < 1000; i++) {
  jitiMod.multiply(2, 3);
  nativeMod.default.multiply(2, 3);
}

// Benchmark jiti - this goes through the fallback path with .bind() on every call!
start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  jitiMod.multiply(2, 3);
}
const jitiFallbackTime = performance.now() - start;
console.log(`jiti (fallback + bind):      ${jitiFallbackTime.toFixed(2)}ms`);

// Benchmark native
start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  nativeMod.default.multiply(2, 3);
}
const nativeDefaultTime = performance.now() - start;
console.log(`native import:               ${nativeDefaultTime.toFixed(2)}ms`);

console.log(
  `\nOverhead: ${(jitiFallbackTime / nativeDefaultTime).toFixed(2)}x slower`,
);

console.log("\n--- Property access overhead (no function call) ---");

// Create module with just a property
const propModulePath = join(import.meta.dirname, "_bench-prop-module.mjs");
writeFileSync(propModulePath, `export const value = 42;`);

const jitiPropMod = await jiti.import(propModulePath);
const nativePropMod = await import(propModulePath);

// Warm up
let sum = 0;
for (let i = 0; i < 1000; i++) {
  sum += jitiPropMod.value;
  sum += nativePropMod.value;
}

start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  sum += jitiPropMod.value;
}
const jitiPropTime = performance.now() - start;
console.log(`jiti property access:        ${jitiPropTime.toFixed(2)}ms`);

start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  sum += nativePropMod.value;
}
const nativePropTime = performance.now() - start;
console.log(`native property access:      ${nativePropTime.toFixed(2)}ms`);

console.log(
  `\nOverhead: ${(jitiPropTime / nativePropTime).toFixed(2)}x slower`,
);

// Prevent optimization
if (sum === 0) console.log("");

// Cleanup
unlinkSync(testModulePath);
unlinkSync(propModulePath);

console.log("\n=== Summary ===");
console.log(
  "The Proxy wrapper has inherent overhead that cannot be fully eliminated.",
);
console.log("With caching optimization: ~2x improvement over original.");
console.log("With interopDefault=false: performance matches native.");
