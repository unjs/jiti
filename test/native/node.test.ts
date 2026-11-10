import assert from "node:assert";
import { readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import { createJiti } from "../../lib/jiti-native.mjs";

const fixtures = await readdir(new URL("../fixtures", import.meta.url));

const jiti = createJiti(import.meta.url, { importMeta: import.meta });

test("resolve with a plain filesystem path as parent", () => {
  const testFile = fileURLToPath(import.meta.url);
  const plainPathJiti = createJiti(testFile);
  const resolved = plainPathJiti.esmResolve("./node.test.ts");
  assert.match(resolved, /^file:\/\/\//);
  assert.strictEqual(resolved, import.meta.url);
});

test("resolve with a filesystem path containing a URL control character", () => {
  const testFile = fileURLToPath(import.meta.url);
  const parent = join(dirname(testFile), "a#b", "parent.mjs");
  assert.strictEqual(
    createJiti(parent).esmResolve("./node.test.ts"),
    new URL("a%23b/node.test.ts", import.meta.url).href,
  );
});

test("resolve with an absolute file URL string as parent", () => {
  const parent = new URL("parent.mjs", import.meta.url).href.replace(
    /^file:\/\//,
    "file:",
  );
  assert.strictEqual(
    createJiti(parent).esmResolve("./node.test.ts"),
    new URL("node.test.ts", import.meta.url).href,
  );
});

test("resolve with a URL object as parent", () => {
  const urlJiti = createJiti(new URL(".", import.meta.url));
  assert.strictEqual(
    urlJiti.esmResolve("./node.test.ts"),
    new URL("node.test.ts", import.meta.url).href,
  );
});

// Mostly broken because default type is set to commonjs in fixtures root
const ignore = new Set(
  [
    "error-runtime",
    "error-parse",
    "pure-esm-dep",
    "proto",
    "json",
    "esm",
    "env",
    "typescript",
    "top-level-await",
    "deps",
    "circular",
    "data-uri",
    "jsx",
    // TODO: Once supported, we should both enable test and avoid transform in supported Node.js versions
    "explicit-resource-management",
  ].filter(Boolean),
);

for (const fixture of fixtures) {
  if (ignore.has(fixture)) {
    continue;
  }

  test("fixtures/" + fixture + " (ESM) (Native)", async () => {
    await jiti.import("../fixtures/" + fixture);
  });
}
