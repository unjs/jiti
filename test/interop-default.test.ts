import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { x } from "tinyexec";
import { describe, expect, it } from "vitest";

const nodeMajor = Number(process.versions.node.split(".")[0]);

describe("interopDefault", () => {
  it.skipIf(nodeMajor < 24)(
    "keeps the default export receiver for native disposal symbols",
    async () => {
      const dir = await mkdtemp(join(tmpdir(), "jiti-interop-default-"));

      try {
        await writeFile(
          join(dir, "sync.mjs"),
          [
            "class SyncResource {",
            '  #status = "open";',
            "  getStatus() { return this.#status; }",
            '  [Symbol.dispose]() { this.#status = "closed"; console.log("sync:" + this.#status); }',
            "}",
            "export default new SyncResource();",
          ].join("\n"),
        );
        await writeFile(
          join(dir, "async.mjs"),
          [
            "class AsyncResource {",
            '  #status = "open";',
            "  getStatus() { return this.#status; }",
            '  async [Symbol.asyncDispose]() { this.#status = "closed"; console.log("async:" + this.#status); }',
            "}",
            "export default new AsyncResource();",
          ].join("\n"),
        );
        await writeFile(
          join(dir, "run.mjs"),
          [
            `import { createJiti } from ${JSON.stringify(new URL("../lib/jiti.mjs", import.meta.url).href)};`,
            "const jiti = createJiti(import.meta.url);",
            "{",
            '  using resource = await jiti.import("./sync.mjs");',
            '  console.log("sync-before:" + resource.getStatus());',
            "}",
            "{",
            '  await using resource = await jiti.import("./async.mjs");',
            '  console.log("async-before:" + resource.getStatus());',
            "}",
          ].join("\n"),
        );

        const { stdout, stderr } = await x("node", [join(dir, "run.mjs")], {
          nodeOptions: {
            cwd: dir,
            stdio: "pipe",
          },
        });

        expect(stderr).toBe("");
        expect(stdout.trim().split(/\r?\n/g)).toEqual([
          "sync-before:open",
          "sync:closed",
          "async-before:open",
          "async:closed",
        ]);
      } finally {
        await rm(dir, { recursive: true, force: true });
      }
    },
  );
});
