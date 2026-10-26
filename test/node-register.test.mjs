import "jiti/register";
import { fileURLToPath } from "node:url";
import { readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
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

const registerURL = new URL("../lib/jiti-register.mjs", import.meta.url).href;

function runWithRegister(args) {
  return spawnSync(process.execPath, ["--import", registerURL, ...args], {
    cwd: fileURLToPath(new URL("node-register", import.meta.url)),
    encoding: "utf8",
  });
}

test("register does not emit deprecation warnings", () => {
  const { status, stderr } = runWithRegister(["-e", ""]);
  assert.strictEqual(status, 0, stderr);
  assert.doesNotMatch(stderr, /DeprecationWarning/);
});

test(
  "require() of .ts from CommonJS is left to Node.js",
  { skip: !process.features.typescript && "no native TypeScript support" },
  () => {
    const { status, stdout, stderr } = runWithRegister(["./require-ts.cjs"]);
    assert.strictEqual(status, 0, stderr);
    assert.strictEqual(stdout.trim(), "42");
  },
);
