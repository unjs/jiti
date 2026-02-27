import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

{
  // Test CJS module
  const cjs = require("./cjs-module.cjs");
  const cjsStackPath = cjs.stackTop.getFileName();
  console.log("CJS __filename:", cjs.filename);
  console.log("CJS filename in stack:", cjsStackPath);
  console.log("These are equal?", cjs.filename === cjsStackPath);
  console.log(
    "CJS filename in stack is resolved on current platform?",
    path.resolve(cjsStackPath) === cjsStackPath,
  );
}

console.log("");
console.log("--------------------------------");
console.log("");

{
  // Test CTS module
  const cts = require("./cts-module.cts");
  const ctsStackPath = cts.stackTop.getFileName();
  console.log("CTS __filename:", cts.filename);
  console.log("CTS filename in stack:", ctsStackPath);
  console.log("These are equal?", cts.filename === ctsStackPath);
  console.log(
    "CTS filename in stack is resolved on current platform?",
    path.resolve(ctsStackPath) === ctsStackPath,
  );
}

console.log("");
console.log("--------------------------------");
console.log("");

{
  // Test ESM module
  const esm = await import("./esm-module.mjs");
  const esmStackUrl = esm.stackTop.getFileName();
  console.log("ESM URL:", esm.url);
  console.log("ESM filename in stack:", esmStackUrl);
  console.log("These are equal?", esm.url === esmStackUrl);
  let esmStackUrlAsPath = null;
  try {
    esmStackUrlAsPath = fileURLToPath(esmStackUrl);
  } catch {
    console.log("ESM URL in stack was not a valid file URL!");
  }

  if (esmStackUrlAsPath != null) {
    console.log(
      "ESM URL as path in stack is resolved on current platform?",
      path.resolve(esmStackUrlAsPath) === esmStackUrlAsPath,
    );
  }
}

console.log("");
console.log("--------------------------------");
console.log("");

{
  // Test MTS module
  // @ts-expect-error -- allow importing TS extension should probably be enabled?
  const mts = await import("./mts-module.mts");
  const mtsStackUrl = mts.stackTop.getFileName();
  console.log("MTS URL:", mts.url);
  console.log("MTS URL in stack:", mtsStackUrl);
  console.log("These are equal?", mts.url === mtsStackUrl);
  let mtsStackUrlAsPath = null;
  try {
    mtsStackUrlAsPath = fileURLToPath(mtsStackUrl);
  } catch {
    console.log("MTS URL in stack was not a valid file URL!");
  }
  if (mtsStackUrlAsPath != null) {
    console.log(
      "MTS URL as path in stack is resolved on current platform?",
      path.resolve(mtsStackUrlAsPath) === mtsStackUrlAsPath,
    );
  }
}
