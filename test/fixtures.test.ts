import { join, resolve, dirname } from "node:path";
import { execa } from "execa";
import { describe, it, expect } from "vitest";
import fg from "fast-glob";

describe("fixtures", async () => {
  const jitiPath = resolve(__dirname, "../lib/jiti-cli.mjs");

  const root = dirname(__dirname);
  const dir = join(__dirname, "fixtures");
  const fixtures = await fg("*/index.*", { cwd: dir });

  for (const fixture of fixtures) {
    const name = dirname(fixture);
    it(name, async () => {
      const fixtureEntry = join(dir, fixture);
      const cwd = dirname(fixtureEntry);

      // Clean up absolute paths and sourcemap locations for stable snapshots
      function cleanUpSnap(str: string) {
        return (
          (str + "\n")
            .replace(/\n\t/g, "\n")
            .replace(/\\+/g, "/")
            .split(cwd.replace(/\\/g, "/"))
            .join("<cwd>") // workaround for replaceAll in Node 14
            .split(root.replace(/\\/g, "/"))
            .join("<root>") // workaround for replaceAll in Node 14
            .replace(/:\d+:\d+([\s')])/g, "$1") // remove line numbers in stacktrace
            .replace(/node:(internal|events)/g, "$1") // in Node 16 internal will be presented as node:internal
            .replace(/\.js\)/g, ")")
            .replace(/file:\/{3}/g, "file://")
            .replace(/Node.js v[\d.]+/, "Node.js v<version>")
            .replace(/ParseError: \w:\/:\s+/, "ParseError: ") // Unknown chars in Windows
            .replace("TypeError [ERR_INVALID_ARG_TYPE]:", "TypeError:")
            .replace("eval_evalModule", "evalModule")
            // Node 18
            .replace(
              "  ErrorCaptureStackTrace(err);",
              "validateFunction(listener, 'listener');",
            )
            .replace("internal/errors:496", "events:276")
            .replace("    ^", "  ^")
            .replace(
              "at async asyncRunEntryPointWithESMLoader (internal/modules/run_main) {",
              "",
            )
            .replace("at async loadESM (internal/process/esm_loader)", "")
            .replace(
              "at async handleMainPromise (internal/modules/run_main) {",
              "",
            )
            .trim()
        );
      }

      const { stdout, stderr } = await execa("node", [jitiPath, fixtureEntry], {
        cwd,
        stdio: "pipe",
        reject: false,
        env: {
          JITI_CACHE: "false",
        },
      });

      if (name.includes("error")) {
        expect(cleanUpSnap(stderr)).toMatchSnapshot("stderr");
      } else {
        // expect no error
        expect(stderr).toBe("");
      }

      expect(cleanUpSnap(stdout)).toMatchSnapshot("stdout");
    });
  }
});
