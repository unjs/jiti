import "jiti/register";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
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

test("named imports from .ts files in ESM (#502)", async () => {
  const { add } = await import("./fixtures/node-register-exports/index.ts");
  assert.strictEqual(add(1, 2), 3);
});

test("entry in an import cycle is evaluated once (#502)", async () => {
  const { default: a } = await import("./node-register/cycle/a.ts");
  assert.strictEqual(a.result, "name is a");
  assert.strictEqual(globalThis.__jitiCycleEvaluations, 1);
});

test("import.meta.resolve works in .ts files loaded as CommonJS", async () => {
  const { resolved } = await import("./node-register/esm-resolve.ts");
  assert.strictEqual(
    resolved,
    new URL("node-register/esm-resolve.ts", import.meta.url).href,
  );
});

test("failed modules are removed from the module cache", async () => {
  const cache = createRequire(import.meta.url).cache;
  for (const path of [
    "node-register/throws.ts",
    "fixtures/error-parse/index.ts",
  ]) {
    await assert.rejects(import(`./${path}`));
    const filename = fileURLToPath(new URL(path, import.meta.url));
    assert.strictEqual(cache[filename], undefined, path);
  }
});
