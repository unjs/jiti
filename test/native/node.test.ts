import { readdir } from "node:fs/promises";
import { strict as assert } from "node:assert";
import { test } from "node:test";

import { createJiti } from "../../lib/jiti-native.mjs";

const fixtures = await readdir(new URL("../fixtures", import.meta.url));

const jiti = createJiti(import.meta.url, { importMeta: import.meta });

test("normalizes plain filesystem parent paths to file URLs", () => {
  assert.equal(
    jiti.esmResolve("./exists.js", {
      parentURL: "C:/path/to/caller.mjs",
    }),
    "file:///C:/path/to/exists.js",
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
