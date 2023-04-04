import { resolve } from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import jiti from "../src/jiti";

describe("windows-jiti", () => {
  beforeEach(() => {
    vi.mock("os", () => {
      return {
        platform: () => "linux",
      };
    });
  });
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("import should fail", () => {
    const path = resolve(__dirname, "windows.ts");
    expect(path).toMatch(/^\w:/);
    let error: Error | undefined;
    try {
      jiti(null, { interopDefault: true, esmResolve: true })(path);
    } catch (error_) {
      error = error_;
    }
    expect(error).toBeDefined();
  });
});
