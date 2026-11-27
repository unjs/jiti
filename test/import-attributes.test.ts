import { join } from "node:path";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { describe, it, expect } from "vitest";
import { createJiti } from "../lib/jiti.mjs";

const fixturesDir = join(__dirname, "fixtures/import-attributes");
const dataJson = join(fixturesDir, "data.json");
const wrongType = join(fixturesDir, "wrong-type.ts");
const correctType = join(fixturesDir, "correct-type.ts");
const noAttributes = join(fixturesDir, "no-attributes.ts");
const dynamicWrong = join(fixturesDir, "dynamic-wrong.ts");
const duplicateSpecifier = join(fixturesDir, "duplicate-specifier.ts");
const evalEntry = join(fixturesDir, "_eval-entry.ts");

function jiti() {
  return createJiti(join(fixturesDir, "_index.js"), {
    fsCache: false,
    moduleCache: false,
  });
}

describe("import attributes", () => {
  it("rejects a `type` attribute that does not match the module format", async () => {
    // `wrong-type.ts` declares `with { type: "css" }` for a `.json` file.
    // Node's native `import()` throws ERR_IMPORT_ATTRIBUTE_UNSUPPORTED here;
    // jiti used to drop the attribute entirely and resolve the module.
    await expect(jiti().import(wrongType, { default: true })).rejects.toThrow(
      /Import attribute "type" with value "css" is not supported/,
    );
  });

  it("rejects a mismatched `type` on a dynamic import", async () => {
    await expect(
      jiti().import(dynamicWrong, { default: true }),
    ).rejects.toThrow(
      /Import attribute "type" with value "css" is not supported/,
    );
  });

  it("accepts a matching `type: json` attribute", async () => {
    const result = await jiti().import(correctType, { default: true });
    expect(result).toEqual({ ok: true });
  });

  it("keeps working when no attributes are declared", async () => {
    // jiti resolves JSON without attributes through `require`, which is
    // intentional CommonJS interop; only *wrong* attributes are an error.
    const result = await jiti().import(noAttributes, { default: true });
    expect(result).toEqual({ ok: true });
  });

  it("exposes the resolved module path in the error message", async () => {
    await expect(jiti().import(wrongType, { default: true })).rejects.toThrow(
      dataJson.replace(/\\/g, "/"),
    );
  });

  it("accepts a caller-supplied `attributes` option", async () => {
    // Type-level: `jiti.import`'s declaration must expose `attributes`, or the
    // call below fails to type-check under `tsgo --noEmit`.
    // Runtime: passing the mismatch explicitly must still throw.
    await expect(
      jiti().import(wrongType, { attributes: { type: "css" } }),
    ).rejects.toThrow(
      /Import attribute "type" with value "css" is not supported/,
    );
  });

  it("rejects a mismatched `type` on the synchronous path", () => {
    // The synchronous lowering produces `require(source)`, which cannot carry
    // import attributes, so the mismatch is rejected at transform time.
    expect(() => jiti()(wrongType)).toThrow(
      /Import attribute "type" with value "css" is not supported/,
    );
  });

  it("keeps the error class and `code` on the synchronous path", () => {
    // The transform-time error travels through the generated module as
    // `__JITI_ERROR__`; it must be rebuilt with its original class so callers
    // can keep matching on `err.name` / `err.code` (#485).
    let caught: any;
    try {
      jiti()(wrongType);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(TypeError);
    expect(caught.code).toBe("ERR_IMPORT_ATTRIBUTE_UNSUPPORTED");
  });

  it("rejects a mismatched `type` on a dynamic import using the legacy `assert` form", async () => {
    // Inlined: TypeScript rejects the `assert` form at parse time (TS2880) even
    // though it is still accepted by Babel and shipped code.
    await expect(
      jiti().evalModule(
        `const mod = await import("./data.json", { assert: { type: "css" } });\nexport default mod.default;\n`,
        { filename: evalEntry, async: true },
      ),
    ).rejects.toThrow(
      /Import attribute "type" with value "css" is not supported/,
    );
  });

  it("rejects a mismatched `type` on a dynamic import using a string key", async () => {
    await expect(
      jiti().evalModule(
        `const mod = await import("./data.json", { "with": { type: "css" } });\nexport default mod.default;\n`,
        { filename: evalEntry, async: true },
      ),
    ).rejects.toThrow(
      /Import attribute "type" with value "css" is not supported/,
    );
  });

  it("validates every declaration when a specifier is imported with different attributes", () => {
    // `duplicate-specifier.ts` declares `type: "css"` and `type: "json"` for
    // the same file. Keyed by specifier alone, the second declaration used to
    // overwrite the first and hide the mismatch (#485).
    expect(() => jiti()(duplicateSpecifier)).toThrow(
      /Import attribute "type" with value "css" is not supported/,
    );
  });

  it("rejects a mismatched `type` on an aliased extension-less specifier", () => {
    // The specifier does not end with `.json`, so the compile-time check cannot
    // judge it; the attributes are forwarded to the runtime loader instead.
    // Inlined through `evalModule` so the fixture never has to be resolvable by
    // TypeScript (`#fixtures` is a jiti-only alias).
    const aliased = () =>
      createJiti(join(fixturesDir, "_index.js"), {
        fsCache: false,
        moduleCache: false,
        alias: { "#fixtures": fixturesDir },
      });
    expect(() =>
      aliased().evalModule(
        `import data from "#fixtures/data" with { type: "css" };\nexport default data;\n`,
        { filename: evalEntry },
      ),
    ).toThrow(/Import attribute "type" with value "css" is not supported/);
    expect(
      aliased().evalModule(
        `import data from "#fixtures/data" with { type: "json" };\nexport default data;\n`,
        { filename: evalEntry },
      ),
    ).toEqual({ default: { ok: true } });
  });

  it("tags fs cache entries with the current CACHE_VERSION", () => {
    // The transform output changed for unchanged source, so a stale cache entry
    // written by an older version must never be reused (#485).
    const cacheDir = mkdtempSync(join(tmpdir(), "jiti-import-attributes-"));
    try {
      createJiti(join(fixturesDir, "_index.js"), {
        fsCache: cacheDir,
        moduleCache: false,
      })(correctType);
      const entries = readdirSync(cacheDir);
      expect(entries.length).toBeGreaterThan(0);
      const cached = readFileSync(join(cacheDir, entries[0]), "utf8");
      expect(cached).toMatch(/\/\* v10-[0-9a-z]+ \*\/\n$/);
    } finally {
      rmSync(cacheDir, { recursive: true, force: true });
    }
  });
});
