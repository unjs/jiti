import { randomUUID } from "node:crypto";
import { unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createJiti } from "../lib/jiti.mjs";

describe("interopDefault", () => {
  const jiti = createJiti(import.meta.url);
  let modulePath: string;

  beforeEach(() => {
    modulePath = join(tmpdir(), `jiti-interop-default-${randomUUID()}.cjs`);
    writeFileSync(modulePath, "module.exports = { value: 42 };\n");
  });

  afterEach(() => {
    unlinkSync(modulePath);
  });

  it("returns a property defined with Object.defineProperty after a cached read", () => {
    const mod: any = jiti(modulePath);
    const key = Symbol("lock");

    // Prime the cache with a miss before the property exists
    expect(mod[key]).toBeUndefined();

    Object.defineProperty(mod, key, { value: "defined" });

    expect(mod[key]).toBe("defined");
  });

  it("returns assigned values after a cached read", () => {
    const mod: any = jiti(modulePath);

    expect(mod.dynamic).toBeUndefined();

    mod.dynamic = "assigned";

    expect(mod.dynamic).toBe("assigned");
  });

  it("returns undefined after a cached property is deleted", () => {
    const mod: any = jiti(modulePath);

    expect(mod.value).toBe(42);

    delete mod.value;

    expect(mod.value).toBeUndefined();
  });
});
