import { describe, it, expect } from "vitest";
import { createJiti } from "../lib/jiti.mjs";

describe("virtualModules", () => {
  const virtualMod = {
    default: "hello",
    foo: 42,
  };

  it("sync require returns virtual module", () => {
    const jiti = createJiti(import.meta.url, {
      virtualModules: {
        "my-virtual-mod": virtualMod,
      },
    });
    const result = jiti("my-virtual-mod");
    expect(result).toMatchObject({ default: "hello", foo: 42 });
  });

  it("async import returns virtual module", async () => {
    const jiti = createJiti(import.meta.url, {
      virtualModules: {
        "my-virtual-mod": virtualMod,
      },
    });
    const result = await jiti.import("my-virtual-mod");
    expect(result).toMatchObject({ default: "hello", foo: 42 });
  });

  it("falls through to normal resolution when not in virtualModules", () => {
    const jiti = createJiti(import.meta.url, {
      virtualModules: {},
    });
    // node:path should resolve normally
    const result = jiti("node:path");
    expect(result.join).toBeDefined();
  });
});
