import { readdir } from "node:fs/promises";
// @ts-ignore
import { test } from "bun:test";

import { createJiti } from "../../lib/jiti-native.mjs";

const fixtures = await readdir(new URL("../fixtures", import.meta.url));

const jiti = createJiti(import.meta.url, { importMeta: import.meta });

const ignore = new Set([
  "error-runtime",
  "error-parse",
  "typescript",
  "data-uri",
]);

for (const fixture of fixtures) {
  if (ignore.has(fixture)) {
    continue;
  }

  test("fixtures/" + fixture + " (ESM) (Native)", async () => {
    await jiti.import("../fixtures/" + fixture);
  });
}
