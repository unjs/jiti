import { afterEach, describe, beforeEach, it, expect, vi } from "vitest";
import { isWindows } from "std-env";
import { getCacheDir } from "../src/cache";
import { jitiInteropDefault } from "../src/utils";

describe("utils", () => {
  describe("jitiInteropDefault", () => {
    const ctx = { opts: { interopDefault: true } } as any;

    it("re-reads live-binding (mutable) named exports instead of returning a cached stale value (regression for #421)", () => {
      // Mirrors what jiti's own ESM->CJS transform (src/plugins/transform-module,
      // based on @babel/plugin-transform-modules-commonjs) emits for:
      //   export let counter = 1;
      //   export function increment() { counter++; }
      // Babel defines mutable exports as *live getters* on `exports` so every
      // read reflects the current value - that's how ESM live bindings survive
      // being downleveled to CommonJS.
      let counter = 1;
      const mod: any = { __esModule: true };
      Object.defineProperty(mod, "counter", {
        enumerable: true,
        get: () => counter,
      });
      mod.increment = () => {
        counter++;
      };

      const wrapped = jitiInteropDefault(ctx, mod);

      expect(wrapped.counter).toBe(1);
      wrapped.increment();
      expect(wrapped.counter).toBe(2);
    });
  });

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
});
