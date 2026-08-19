import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "pathe";
import { describe, expect, it } from "vitest";
import createJiti from "../src/jiti";

function makeJiti(filename: string) {
  return createJiti(
    filename,
    { fsCache: false, moduleCache: false },
    {
      onError: (error) => {
        throw error;
      },
      nativeImport: (id) => import(id),
      createRequire,
    },
  );
}

describe("moduleCache: false", () => {
  it("reloads a changed CJS .js file (#418)", () => {
    const dir = mkdtempSync(join(tmpdir(), "jiti-module-cache-"));
    const file = join(dir, "config.js");
    writeFileSync(file, "module.exports = { n: 1 }\n");
    const jiti = makeJiti(join(dir, "_index.js"));
    try {
      expect(jiti(file)).toMatchObject({ n: 1 });
      writeFileSync(file, "module.exports = { n: 2 }\n");
      expect(jiti(file)).toMatchObject({ n: 2 });
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
