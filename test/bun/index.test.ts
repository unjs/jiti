import { fileURLToPath } from "url";
import { readdirSync } from "node:fs";
// @ts-ignore
import { test } from "bun:test";

import jiti from "../../lib/index.js";

const fixturesDir = fileURLToPath(new URL("../fixtures", import.meta.url));

const fixtures = readdirSync(fixturesDir);

const _jiti = jiti(fixturesDir, { debug: true });

for (const fixture of fixtures) {
  if (fixture.startsWith("error-")) {
    continue;
  }
  test("fixtures/" + fixture, () => {
    _jiti("./" + fixture);
  });
}
