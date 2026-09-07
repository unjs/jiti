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

  describe("resolveJitiOptions", () => {
    it("enables tryNative when Deno is in globalThis", async () => {
      const { resolveJitiOptions } = await import("../src/options");
      (globalThis as any).Deno = {};
      try {
        const opts = resolveJitiOptions({});
        expect(opts.tryNative).toBe(true);
      } finally {
        delete (globalThis as any).Deno;
      }
    });

    it("enables tryNative when Bun is in globalThis", async () => {
      const { resolveJitiOptions } = await import("../src/options");
      (globalThis as any).Bun = {};
      try {
        const opts = resolveJitiOptions({});
        expect(opts.tryNative).toBe(true);
      } finally {
        delete (globalThis as any).Bun;
      }
    });

    it("disables tryNative by default in standard environment", async () => {
      const { resolveJitiOptions } = await import("../src/options");
      delete (globalThis as any).Deno;
      delete (globalThis as any).Bun;
      const opts = resolveJitiOptions({});
      expect(opts.tryNative).toBe(false);
    });
  });
});
