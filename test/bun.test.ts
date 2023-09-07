import { fileURLToPath } from "node:url";
import { readdir, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
// @ts-ignore
import { test, expect } from "bun:test";

import jiti from "../lib/index.js";

const fixturesDir = fileURLToPath(new URL("fixtures", import.meta.url));

const fixtures = await readdir(fixturesDir);

const _jiti = jiti(fixturesDir, {
  debug: true,
  interopDefault: true,
  requireCache: false,
  cache: false,
});

for (const fixture of fixtures) {
  if (fixture.startsWith("error-")) {
    continue;
  }
  test("fixtures/" + fixture, () => {
    _jiti("./" + fixture);
  });
}

test("hmr", async () => {
  await mkdir(join(fixturesDir, "../.tmp"), { recursive: true });
  const tmpFile = join(fixturesDir, "../.tmp/bun.mjs");

  let value;

  await writeFile(tmpFile, "export default 1");
  value = _jiti(tmpFile);
  expect(value).toBe(1);

  value = _jiti(tmpFile);
  await writeFile(tmpFile, "export default 2");
  expect(value).toBe(2);
});
