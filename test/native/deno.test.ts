import { readdir } from "node:fs/promises";
import { test } from "node:test";

import { createJiti } from "../../lib/jiti-native.mjs";

const fixtures = await readdir(new URL("../fixtures", import.meta.url));

const jiti = createJiti(import.meta.url, { importMeta: import.meta });

// Mostly broken because default type is set to commonjs in fixtures root
const ignore = new Set(
  [
    "error-parse",
    "error-runtime",
    "typescript",
    "env",
    "esm",
    "proto",
    "json",
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
