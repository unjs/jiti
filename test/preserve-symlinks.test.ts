import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { x } from "tinyexec";
import { describe, expect, it } from "vitest";

describe("preserve symlinks", () => {
  it("resolves transitive dependencies from the symlinked path", async () => {
    const temp = mkdtempSync(join(tmpdir(), "jiti-preserve-symlinks-"));
    const root = join(temp, "package-root");
    const outside = join(temp, "outside");

    try {
      mkdirSync(join(root, "node_modules", "test-package"), {
        recursive: true,
      });
      mkdirSync(outside, { recursive: true });
      writeFileSync(
        join(root, "node_modules", "test-package", "package.json"),
        JSON.stringify({ name: "test-package", main: "index.js" }),
      );
      writeFileSync(
        join(root, "node_modules", "test-package", "index.js"),
        "module.exports = 'resolved-through-symlink';\n",
      );
      writeFileSync(
        join(outside, "helper.ts"),
        "import value from 'test-package'; export default value;\n",
      );
      symlinkSync(
        outside,
        join(root, "linked"),
        process.platform === "win32" ? "junction" : "dir",
      );

      const jitiURL = pathToFileURL(resolve(__dirname, "../lib/jiti.mjs"));
      const entry = join(root, "entry.mjs");
      const script = join(temp, "load.mjs");
      writeFileSync(
        script,
        [
          `import { createJiti } from ${JSON.stringify(jitiURL.href)};`,
          `const jiti = createJiti(${JSON.stringify(entry)}, { fsCache: false });`,
          `process.stdout.write(String(await jiti.import("./linked/helper", { default: true })));`,
        ].join("\n"),
      );

      const { stdout, stderr } = await x(
        "node",
        ["--preserve-symlinks", "--preserve-symlinks-main", script],
        { nodeOptions: { stdio: "pipe" } },
      );

      expect(stderr).toBe("");
      expect(stdout.trim()).toBe("resolved-through-symlink");
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it("resolves via the explicit parentURL alias, not the entry's own alias", async () => {
    const temp = mkdtempSync(join(tmpdir(), "jiti-preserve-symlinks-"));
    const realTarget = join(temp, "real-target");
    const aliasA = join(temp, "alias-a");
    const aliasB = join(temp, "alias-b");

    try {
      mkdirSync(join(realTarget, "node_modules", "test-package"), {
        recursive: true,
      });
      writeFileSync(
        join(realTarget, "node_modules", "test-package", "package.json"),
        JSON.stringify({ name: "test-package", main: "index.js" }),
      );
      writeFileSync(
        join(realTarget, "node_modules", "test-package", "index.js"),
        "module.exports = 'resolved-through-symlink';\n",
      );

      // Two distinct aliases for the same physical directory: the jiti
      // instance's own entry lives behind aliasA, but the resolve call below
      // passes an explicit parentURL behind aliasB. The returned path should
      // reflect aliasB (the requested parentURL), not aliasA (the entry's
      // own, unrelated location that ctx.nativeRequire happens to be bound to).
      const junctionType = process.platform === "win32" ? "junction" : "dir";
      symlinkSync(realTarget, aliasA, junctionType);
      symlinkSync(realTarget, aliasB, junctionType);

      const jitiURL = pathToFileURL(resolve(__dirname, "../lib/jiti.mjs"));
      const entry = join(aliasA, "entry.mjs");
      const parentFile = join(aliasB, "caller.mjs");
      const script = join(temp, "load.mjs");
      writeFileSync(
        script,
        [
          `import { pathToFileURL } from "node:url";`,
          `import { createJiti } from ${JSON.stringify(jitiURL.href)};`,
          `const jiti = createJiti(${JSON.stringify(entry)}, { fsCache: false });`,
          `const resolved = jiti.esmResolve("test-package", pathToFileURL(${JSON.stringify(parentFile)}).href);`,
          `process.stdout.write(String(resolved));`,
        ].join("\n"),
      );

      const { stdout, stderr } = await x(
        "node",
        ["--preserve-symlinks", "--preserve-symlinks-main", script],
        { nodeOptions: { stdio: "pipe" } },
      );

      expect(stderr).toBe("");
      expect(stdout).toContain("alias-b");
      expect(stdout).not.toContain("alias-a");
    } finally {
      rmSync(temp, { recursive: true, force: true });
    }
  });
});
