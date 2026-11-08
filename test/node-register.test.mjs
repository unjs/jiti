import "jiti/register";
import { fileURLToPath } from "node:url";
import { readdir } from "node:fs/promises";
import { test } from "node:test";
import assert from "node:assert";

const fixturesDir = fileURLToPath(new URL("fixtures", import.meta.url));

const fixtures = await readdir(fixturesDir);

for (const fixture of fixtures) {
  test("fixtures/" + fixture + " (ESM)", async () => {
    const promise = import(`./fixtures/${fixture}`);
    const shouldReject =
      fixture === "error-parse" || fixture === "error-runtime";
    if (await shouldReject) {
      assert.rejects(promise);
    } else {
      assert.doesNotReject(promise);
    }
  });
}

test("import.meta.resolve works under jiti/register (#501)", async () => {
  await assert.doesNotReject(import("./fixtures/import-meta/resolve.ts"));
});
