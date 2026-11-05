import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { createJiti } from "../lib/jiti.mjs";

const fixturesDir = join(__dirname, "fixtures/import-attributes");
const dataJson = join(fixturesDir, "data.json");
const wrongType = join(fixturesDir, "wrong-type.ts");
const correctType = join(fixturesDir, "correct-type.ts");
const noAttributes = join(fixturesDir, "no-attributes.ts");
const dynamicWrong = join(fixturesDir, "dynamic-wrong.ts");

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
});
