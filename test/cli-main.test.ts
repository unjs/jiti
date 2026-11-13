import { resolve } from "node:path";
import { normalize } from "pathe";
import { fileURLToPath } from "node:url";
import { x } from "tinyexec";
import { describe, it, expect } from "vitest";

describe("cli and register main module", () => {
  const dir = fileURLToPath(new URL(".", import.meta.url));
  const jitiCli = resolve(dir, "../lib/jiti-cli.mjs");
  const jitiRegister = resolve(dir, "../lib/jiti-register.mjs");

  it("sets require.main === module and import.meta.main in jiti CLI", async () => {
    const script = resolve(dir, "cli-main/main-test.ts");

    const { stdout, exitCode } = await x("node", [jitiCli, script]);
    expect(exitCode).toBe(0);
    const result = JSON.parse(stdout.trim());

    expect(result.parentRequireMain).toBe(true);
    expect(result.parentImportMetaMain).toBe(true);
    expect(result.parentShadowedImportMetaMain).toBe(true);
    expect(result.childRequireMain).toBe(false);
    expect(result.childImportMetaMain).toBe(false);
    expect(normalize(result.childMainFilename)).toBe(normalize(script));
  });

  it("sets require.main === module and import.meta.main under jiti/register", async () => {
    const script = resolve(dir, "cli-main/main-test.ts");

    const { stdout, exitCode } = await x("node", [
      "--import",
      jitiRegister,
      script,
    ]);
    expect(exitCode).toBe(0);
    const result = JSON.parse(stdout.trim());

    expect(result.parentRequireMain).toBe(true);
    expect(result.parentImportMetaMain).toBe(true);
    expect(result.parentShadowedImportMetaMain).toBe(true);
    expect(result.childRequireMain).toBe(false);
    expect(result.childImportMetaMain).toBe(false);
    expect(normalize(result.childMainFilename)).toBe(normalize(script));
  });
});
