import { resolve, join, dirname } from "node:path";
import { writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { describe, it, expect } from "vitest";
import { x } from "tinyexec";

describe("esmResolveTempFile", () => {
  const jitiPath = resolve(__dirname, "../lib/jiti-cli.mjs");
  const fixture = resolve(__dirname, "fixtures/import-meta/index.ts");

  it("works with esmResolveTempFile enabled", async () => {
    const { stdout, stderr } = await x("node", [jitiPath, fixture], {
      nodeOptions: {
        stdio: "pipe",
        env: {
          JITI_CACHE: "false",
          JITI_ESM_RESOLVE_TEMP_FILE: "true",
        },
      },
    });

    expect(stdout).toContain("hello!");
    expect(stdout).toContain("import.meta.dirname:");
    const errors = stderr
      .split("\n")
      .filter((l) => l && !l.includes("ExperimentalWarning"));
    expect(errors.join("\n").trim()).toBe("");
  });

  it("uses temp file for ESM fallback (debug output)", async () => {
    const { stdout, stderr } = await x("node", [jitiPath, fixture], {
      nodeOptions: {
        stdio: "pipe",
        env: {
          JITI_CACHE: "false",
          JITI_ESM_RESOLVE_TEMP_FILE: "true",
          JITI_DEBUG: "1",
        },
      },
    });

    // Debug output goes to stdout; the ESM fallback path should be triggered
    const output = stdout + stderr;
    expect(output).toContain("[esm]");
    expect(output).toContain("[fallback]");
  });

  it("handles large ESM files with import.meta.custom", async () => {
    // Large files can trigger ENAMETOOLONG with data URL approach on some
    // OS/filesystem combinations. The temp file approach avoids this.
    const largeCode = `
      declare global { interface ImportMeta { custom: any; } }
      import.meta.custom = { test: true };
      const padding = ${JSON.stringify("x".repeat(500_000))};
      console.log("large-esm-ok:", padding.length);
      export {};
    `;

    const tmpFile = join(tmpdir(), "jiti-test-large-esm.ts");
    const tmpEntry = join(tmpdir(), "jiti-test-large-esm-entry.ts");
    writeFileSync(tmpFile, largeCode);
    writeFileSync(
      tmpEntry,
      `await import(${JSON.stringify(tmpFile)});\nexport default {};`,
    );

    try {
      const { stdout, stderr } = await x("node", [jitiPath, tmpEntry], {
        nodeOptions: {
          stdio: "pipe",
          env: {
            JITI_CACHE: "false",
            JITI_ESM_RESOLVE_TEMP_FILE: "true",
          },
        },
      });

      expect(stdout).toContain("large-esm-ok: 500000");
      const errors = stderr
        .split("\n")
        .filter((l) => l && !l.includes("ExperimentalWarning"));
      expect(errors.join("\n").trim()).toBe("");
    } finally {
      try {
        unlinkSync(tmpFile);
      } catch {}
      try {
        unlinkSync(tmpEntry);
      } catch {}
    }
  });
});
