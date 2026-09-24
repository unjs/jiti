import { describe, it, expect } from "vitest";
import { resolveAlias } from "pathe/utils";
import { normalizeAliasWildcards } from "../src/resolve";

describe("normalizeAliasWildcards", () => {
  it("strips a single trailing wildcard from both alias and target", () => {
    expect(normalizeAliasWildcards({ "#/*": "./src/*" })).toEqual({
      "#/": "./src/",
    });
  });

  it("leaves plain prefix aliases untouched", () => {
    expect(normalizeAliasWildcards({ "~/": "./src/" })).toEqual({
      "~/": "./src/",
    });
  });

  it("handles a mix of wildcard and plain aliases", () => {
    expect(
      normalizeAliasWildcards({ "#/*": "./src/*", "~": "./other" }),
    ).toEqual({
      "#/": "./src/",
      "~": "./other",
    });
  });
});

describe("resolveAlias with wildcard aliases (README example: #/* -> ./src/*)", () => {
  it("substitutes a wildcard alias the same way as the equivalent plain-prefix alias", () => {
    const wildcard = normalizeAliasWildcards({ "#/*": "./src/*" });
    const plain = { "#/": "./src/" };
    expect(resolveAlias("#/data.ts", wildcard)).toBe(
      resolveAlias("#/data.ts", plain),
    );
  });

  it("resolves a wildcard alias, unlike the raw unnormalized alias map", () => {
    const raw = { "#/*": "./src/*" };
    // Before normalization, pathe's resolveAlias does a literal prefix match,
    // so the `*` is never substituted and the id is returned unchanged.
    expect(resolveAlias("#/data.ts", raw)).toBe("#/data.ts");
    expect(resolveAlias("#/data.ts", normalizeAliasWildcards(raw))).not.toBe(
      "#/data.ts",
    );
  });
});
