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
});

describe("interopDefault symbol methods", () => {
  const { writeFileSync, mkdirSync, rmSync } = require("node:fs");
  const { tmpdir } = require("node:os");
  const { resolve } = require("node:path");

  const { createJiti } = require("../lib/jiti.cjs");
  const dir = resolve(tmpdir(), "jiti-interop-symbol-test");

  beforeEach(() => {
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      resolve(dir, "dep.mjs"),
      `export const marker = 1;
export default {
  regular() { return this; },
  [Symbol.asyncDispose]: async function () {},
  [Symbol.dispose]: function () {},
};
`,
    );
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("does not wrap symbol-keyed fallback methods (#437)", async () => {
    const jiti = createJiti(resolve(dir, "_"), { interopDefault: true });
    const mod: any = await jiti.import("./dep.mjs");
    const def = mod.default;

    // Symbol-keyed methods must come through unwrapped: V8 rejects bound
    // functions for the using declaration protocols, and the engine invokes
    // them with the proxy as receiver, which resolves through the same trap.
    expect(mod[Symbol.asyncDispose]).toBe(def[Symbol.asyncDispose]);
    expect(mod[Symbol.dispose]).toBe(def[Symbol.dispose]);

    // String-keyed fallback methods keep the bind, so extraction preserves
    // this === default export.
    const { regular } = mod;
    expect(regular()).toBe(def);
  });
});
