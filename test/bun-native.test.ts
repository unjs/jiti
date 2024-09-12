import { fileURLToPath } from "node:url";
import { readdir } from "node:fs/promises";
// @ts-ignore
import { test } from "bun:test";

import { createJiti } from "../lib/jiti-native.mjs";

const fixturesDir = fileURLToPath(new URL("fixtures", import.meta.url));

const fixtures = await readdir(fixturesDir);

const _jiti = createJiti(fixturesDir);

for (const fixture of fixtures) {
  if (
    fixture === "error-runtime" ||
    fixture === "error-parse" ||
    fixture === "typescript"
  ) {
    continue;
  }

  test("fixtures/" + fixture + " (ESM) (Native)", async () => {
    await _jiti.import("./" + fixture);
  });
}
