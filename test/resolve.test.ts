import { describe, it, expect } from "vitest";
import { createJiti } from "../lib/jiti.mjs";

describe("esmResolve", () => {
  it("resolves nonexistent relative targets to file URLs without throwing (#494)", () => {
    const jiti = createJiti(import.meta.url);
    const resolved = jiti.esmResolve("./missing.foo");
    expect(resolved).toBe(new URL("missing.foo", import.meta.url).href);
  });

  it("resolves nonexistent parent-relative targets (#494)", () => {
    const jiti = createJiti(import.meta.url);
    const resolved = jiti.esmResolve("../missing.bar");
    expect(resolved).toBe(new URL("../missing.bar", import.meta.url).href);
  });

  it("resolves nonexistent nested directory targets (#494)", () => {
    const jiti = createJiti(import.meta.url);
    const resolved = jiti.esmResolve("./missing-dir/index.js");
    expect(resolved).toBe(
      new URL("missing-dir/index.js", import.meta.url).href,
    );
  });

  it("preserves query and hash in nonexistent relative targets (#494)", () => {
    const jiti = createJiti(import.meta.url);
    const resolved = jiti.esmResolve("./missing.foo?v=1#sec");
    expect(resolved).toBe(new URL("missing.foo?v=1#sec", import.meta.url).href);
  });

  it("resolves with custom parentURL string and options object (#494)", () => {
    const jiti = createJiti(import.meta.url);
    const parent = "file:///custom/dir/index.js";
    expect(jiti.esmResolve("./missing.foo", parent)).toBe(
      "file:///custom/dir/missing.foo",
    );
    expect(jiti.esmResolve("./missing.foo", { parentURL: parent })).toBe(
      "file:///custom/dir/missing.foo",
    );
  });

  it("throws MODULE_NOT_FOUND for nonexistent packages (#494)", () => {
    const jiti = createJiti(import.meta.url);
    expect(() => jiti.esmResolve("not-installed-pkg")).toThrow();
    expect(() => jiti.esmResolve("not-installed-pkg/something.foo")).toThrow();
  });

  it("returns undefined with try: true for nonexistent packages (#494)", () => {
    const jiti = createJiti(import.meta.url);
    expect(
      jiti.esmResolve("nonexistent-package-abc-xyz", { try: true }),
    ).toBeUndefined();
  });
});
