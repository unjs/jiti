// Test to demonstrate filename differences between CJS and ESM modules
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

{
  // Test CJS module
  const cjsResult = require("./cjs-module.cjs");
  const cjsStackPath = cjsResult.stackTop.getFileName();
  console.log("CJS __filename:", cjsResult.filename);
  console.log("CJS filename in stack:", cjsStackPath);
  console.log("These are equal?", cjsResult.filename === cjsStackPath);
  console.log(
    "CJS filename in stack is resolved on current platform?",
    path.resolve(cjsStackPath) === cjsStackPath,
  );
}

{
  // Test CTS module
  const ctsResult = require("./cts-module.cts");
  const ctsStackPath = ctsResult.stackTop.getFileName();
  console.log("CTS __filename:", ctsResult.filename);
  console.log("CTS filename in stack:", ctsStackPath);
  console.log("These are equal?", ctsResult.filename === ctsStackPath);
  console.log(
    "CTS filename in stack is resolved on current platform?",
    path.resolve(ctsStackPath) === ctsStackPath,
  );
}

{
  // Test ESM module
  const esmResult = await import("./esm-module.mjs");
  const esmStackUrl = esmResult.stackTop.getFileName();
  console.log("ESM URL:", esmResult.url);
  console.log("ESM filename in stack:", esmStackUrl);
  console.log("These are equal?", esmResult.url === esmStackUrl);
  const esmStackUrlAsPath = fileURLToPath(esmStackUrl);
  console.log(
    "ESM URL as path in stack is resolved on current platform?",
    path.resolve(esmStackUrlAsPath) === esmStackUrlAsPath,
  );
}

{
  // Test MTS module
  // @ts-expect-error -- allow importing TS extension should probably be enabled?
  const mtsResult = await import("./mts-module.mts");
  const mtsStackUrl = mtsResult.stackTop.getFileName();
  console.log("MTS URL:", mtsResult.url);
  console.log("MTS URL in stack:", mtsStackUrl);
  console.log("These are equal?", mtsResult.url === mtsStackUrl);
  const mtsStackUrlAsPath = fileURLToPath(mtsStackUrl);
  console.log(
    "MTS filename in stack is resolved on current platform?",
    path.resolve(mtsStackUrlAsPath) === mtsStackUrlAsPath,
  );
}
