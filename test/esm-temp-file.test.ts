import { resolve, join } from "node:path";
import { writeFileSync, unlinkSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { describe, it, expect } from "vitest";
import { x } from "tinyexec";

describe("esmEvalTempFile", () => {
  const jitiPath = resolve(__dirname, "../lib/jiti-cli.mjs");
  const fixture = resolve(__dirname, "fixtures/import-meta/index.ts");

  it("works with esmEvalTempFile enabled", async () => {
    const { stdout, stderr } = await x("node", [jitiPath, fixture], {
      nodeOptions: {
        stdio: "pipe",
        env: {
          JITI_CACHE: "false",
          JITI_ESM_EVAL_TEMP_FILE: "true",
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
          JITI_ESM_EVAL_TEMP_FILE: "true",
          JITI_DEBUG: "1",
        },
      },
    });

    const output = stdout + stderr;
    expect(output).toContain("[tempfile]");
    expect(output).toMatch(/jiti-esm[/\\][^/\\]+\.mjs/);
  });

  it("does not re-execute user code when it throws ENAMETOOLONG", async () => {
    // Regression: previously the data-URL `.then(mod => mod.default(...args))`
    // and the temp-file fallback shared one `.catch`, so a user error with
    // `code: "ENAMETOOLONG"` re-ran user code via the temp-file path.
    const counter = join(
      tmpdir(),
      `jiti-enametoolong-counter-${Date.now()}.txt`,
    );
    const fixture = join(tmpdir(), `jiti-enametoolong-${Date.now()}.ts`);
    writeFileSync(
      fixture,
      [
        `declare global { interface ImportMeta { custom: any; } }`,
        `import.meta.custom = {};`,
        `import { appendFileSync } from "node:fs";`,
        `appendFileSync(${JSON.stringify(counter)}, "x");`,
        `const err: any = new Error("simulated long path");`,
        `err.code = "ENAMETOOLONG";`,
        `throw err;`,
        `export {};`,
      ].join("\n"),
    );

    try {
      await x("node", [jitiPath, fixture], {
        nodeOptions: {
          stdio: "pipe",
          env: { JITI_CACHE: "false" },
        },
      });
      let runs = "";
      try {
        runs = readFileSync(counter, "utf8");
      } catch {}
      expect(runs).toBe("x");
    } finally {
      try {
        unlinkSync(fixture);
      } catch {}
      try {
        unlinkSync(counter);
      } catch {}
    }
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
            JITI_ESM_EVAL_TEMP_FILE: "true",
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
