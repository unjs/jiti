import { fileURLToPath } from "node:url";
import { readdir, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
// @ts-ignore
import { test, expect } from "bun:test";

import { createJiti } from "..";

const fixturesDir = fileURLToPath(new URL("fixtures", import.meta.url));

const fixtures = await readdir(fixturesDir);

const _jiti = createJiti(fixturesDir, {
  debug: true,
  interopDefault: true,
  requireCache: false,
  cache: false,
});

for (const fixture of fixtures) {
  if (
    fixture === "error-runtime" ||
    fixture === "error-parse" ||
    fixture === "typescript"
  ) {
    continue;
  }
  if (
    fixture !== "esm" &&
    fixture !== "top-level-await" &&
    fixture !== "json"
  ) {
    test("fixtures/" + fixture + " (CJS)", () => {
      _jiti("./" + fixture);
    });
  }
  test("fixtures/" + fixture + " (ESM)", async () => {
    await _jiti.import("./" + fixture);
  });
}

test("hmr", async () => {
  await mkdir(join(fixturesDir, "../.tmp"), { recursive: true });
  const tmpFile = join(fixturesDir, "../.tmp/bun.mjs");

  let value;

  await writeFile(tmpFile, "export default 1");
  value = _jiti(tmpFile);
  expect(value).toBe(1);

  await writeFile(tmpFile, "export default 2");
  value = _jiti(tmpFile);
  expect(value).toBe(2);
});
