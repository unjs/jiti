import { afterEach, describe, beforeEach, it, expect, vi } from "vitest";

import { getCacheDir } from "../src/utils";

describe("utils", () => {
  describe("getCacheDir", () => {
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
      const originalTmpdir = process.env.TMPDIR
      delete process.env.TMPDIR
      expect(getCacheDir()).toBe("/tmp/node-jiti");
      process.env.TMPDIR = originalTmpdir
    });

    it("returns TMPDIR when TMPDIR is not CWD", () => {
      vi.stubEnv("TMPDIR", notCwd);
      expect(getCacheDir()).toBe("/cwd__NOT__/node-jiti");
    });

    it("returns the system's TMPDIR when TMPDIR is CWD", () => {
      vi.stubEnv('TMPDIR', cwd)
      expect(getCacheDir()).toBe("/tmp/node-jiti");
    });

    it("returns TMPDIR when TMPDIR is CWD and TMPDIR is kept", () => {
      vi.stubEnv('TMPDIR', cwd)
      vi.stubEnv('JITI_TMPDIR_KEEP', 'true')

      expect(getCacheDir()).toBe("/cwd/node-jiti");
    });
  });
});
