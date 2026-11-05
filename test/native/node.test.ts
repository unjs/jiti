import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";

import { createJiti } from "../../lib/jiti-native.mjs";

const fixtures = await readdir(new URL("../fixtures", import.meta.url));

const jiti = createJiti(import.meta.url, { importMeta: import.meta });

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

test("plain path parent is normalized to a file URL", () => {
  const caller = join(process.cwd(), "caller.mjs");
  let parent = "";
  const jiti = createJiti(caller, {
    importMeta: {
      resolve: (_id, p) => {
        parent = p;
        return "";
      },
    },
  });
  jiti.esmResolve("./exists.js");
  assert.equal(new URL(parent).href, pathToFileURL(caller).href);
});
