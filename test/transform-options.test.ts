import * as path from "node:path";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import { describe, it, expect } from "vitest";
import { createJiti } from "../lib/jiti.mjs";
import type { PluginObj } from "@babel/core";

describe("transformOptions", () => {
  it("exposes the file path to a custom babel plugin", async () => {
    const fixture = path.join(
      os.tmpdir(),
      `jiti-transform-options-${Date.now()}.ts`,
    );
    await fs.writeFile(fixture, `export const value: number = 42;\n`);

    const seenFilenames: string[] = [];
    const recordFilenamePlugin = (): PluginObj => ({
      visitor: {
        Program(_, { filename }) {
          if (filename) {
            seenFilenames.push(filename);
          }
        },
      },
    });

    try {
      const jiti = createJiti(import.meta.url, {
        cache: false,
        transformOptions: {
          babel: {
            plugins: [recordFilenamePlugin],
          },
        },
      });

      const mod = (await jiti.import(fixture)) as any;

      expect(mod.value).toBe(42);
      expect(seenFilenames).toContain(fixture);
    } finally {
      await fs.unlink(fixture);
    }
  });
});
