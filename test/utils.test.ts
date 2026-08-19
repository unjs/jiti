import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "pathe";
import { afterEach, describe, beforeEach, it, expect, vi } from "vitest";
import { isWindows } from "std-env";
import { getCacheDir } from "../src/cache";

describe("utils", () => {
  describe.skipIf(isWindows)("getCacheDir", () => {
    const cwd = "/cwd";
    const notCwd = `${cwd}__NOT__`;

    beforeEach(() => {
      vi.spyOn(process, "cwd").mockImplementation(() => cwd);
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllEnvs();
    });

    it("returns the system's TMPDIR when TMPDIR is not set", () => {
      const originalTmpdir = process.env.TMPDIR;
      delete process.env.TMPDIR;
      expect(getCacheDir({} as any)).toBe("/tmp/jiti");
      process.env.TMPDIR = originalTmpdir;
    });

    it("returns TMPDIR when TMPDIR is not CWD", () => {
      vi.stubEnv("TMPDIR", notCwd);
      expect(getCacheDir({} as any)).toBe("/cwd__NOT__/jiti");
    });

    it("returns the system's TMPDIR when TMPDIR is CWD", () => {
      vi.stubEnv("TMPDIR", cwd);
      expect(getCacheDir({} as any)).toBe("/tmp/jiti");
    });

    it("returns TMPDIR when TMPDIR is CWD and TMPDIR is kept", () => {
      vi.stubEnv("TMPDIR", cwd);
      vi.stubEnv("JITI_RESPECT_TMPDIR_ENV", "true");

      expect(getCacheDir({} as any)).toBe("/cwd/jiti");
    });
  });

  it("walks up from a nested file to the nearest node_modules (#459)", () => {
    const root = mkdtempSync(join(tmpdir(), "jiti-fscache-"));
    mkdirSync(join(root, "node_modules"));
    mkdirSync(join(root, "src"), { recursive: true });
    const filename = join(root, "src", "loader.ts");
    writeFileSync(filename, "");
    try {
      expect(getCacheDir({ filename } as any)).toBe(
        join(root, "node_modules/.cache/jiti"),
      );
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
