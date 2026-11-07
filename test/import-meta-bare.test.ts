import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { normalize } from "pathe";
import { pathToFileURL } from "mlly";
import { createJiti } from "../lib/jiti.mjs";

describe("bare import.meta transform (#497)", () => {
  const testDir = join(tmpdir(), `jiti-bare-meta-${Date.now()}`);

  function setupFiles() {
    mkdirSync(testDir, { recursive: true });
    const existsPath = join(testDir, "exists.js");
    writeFileSync(existsPath, "export const marker = 42;");

    const helperPath = join(testDir, "helper.ts");
    writeFileSync(
      helperPath,
      `
export function inspect(meta: ImportMeta) {
  let resolved: string;
  try {
    resolved = meta.resolve("./exists.js");
  } catch (e: any) {
    resolved = "THREW: " + e.message;
  }
  return {
    url: meta.url,
    filename: meta.filename,
    dirname: meta.dirname,
    resolved,
  };
}
`,
    );

    const entryPath = join(testDir, "entry.ts");
    writeFileSync(
      entryPath,
      `
import { inspect } from "./helper.ts";
export const info = inspect(import.meta);
export const destructure = (() => {
  const { url, filename, dirname, resolve } = import.meta;
  return { url, filename, dirname, resolved: resolve("./exists.js") };
})();
export const computed = {
  url: import.meta["url"],
  resolved: import.meta["resolve"]("./exists.js"),
};
`,
    );

    return { entryPath, existsPath, helperPath };
  }

  it("transforms bare import.meta in async jiti.import (#497)", async () => {
    const { entryPath, existsPath } = setupFiles();
    try {
      const jiti = createJiti(import.meta.url, { moduleCache: false });
      const mod = (await jiti.import(entryPath)) as any;

      const expectedUrl = pathToFileURL(entryPath);
      const expectedExistsUrl = pathToFileURL(existsPath);

      expect(mod.info.url).toBe(expectedUrl);
      expect(mod.info.url).not.toMatch(/^data:/);
      expect(normalize(mod.info.filename)).toBe(normalize(entryPath));
      expect(normalize(mod.info.dirname)).toBe(normalize(testDir));
      expect(mod.info.resolved).toBe(expectedExistsUrl);

      // Destructuring import.meta
      expect(mod.destructure.url).toBe(expectedUrl);
      expect(normalize(mod.destructure.filename)).toBe(normalize(entryPath));
      expect(normalize(mod.destructure.dirname)).toBe(normalize(testDir));
      expect(mod.destructure.resolved).toBe(expectedExistsUrl);

      // Computed access
      expect(mod.computed.url).toBe(expectedUrl);
      expect(mod.computed.resolved).toBe(expectedExistsUrl);
    } finally {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it("transforms bare import.meta in sync jiti require without SyntaxError (#497)", () => {
    const { entryPath, existsPath } = setupFiles();
    try {
      const jiti = createJiti(import.meta.url, { moduleCache: false });
      const mod = jiti(entryPath) as any;

      const expectedUrl = pathToFileURL(entryPath);
      const expectedExistsUrl = pathToFileURL(existsPath);

      expect(mod.info.url).toBe(expectedUrl);
      expect(normalize(mod.info.filename)).toBe(normalize(entryPath));
      expect(normalize(mod.info.dirname)).toBe(normalize(testDir));
      expect(mod.info.resolved).toBe(expectedExistsUrl);
    } finally {
      rmSync(testDir, { recursive: true, force: true });
    }
  });
});
