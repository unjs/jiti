import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import { createJiti } from "../lib/jiti.mjs";
import type { ModuleCache } from "../lib/types";

const cases = ["ts", "js", "mjs"].flatMap((ext) =>
  ["static", "reexport", "dynamic"].map((kind) => ({ ext, kind })),
);
cases.push({ ext: "cjs", kind: "require" });
cases.push({ ext: "ts", kind: "json" });
cases.push({ ext: "ts", kind: "json-bom" });

describe("moduleCache: false", () => {
  it.each(cases)("reloads $kind $ext dependencies", async ({ ext, kind }) => {
    const root = await mkdtemp(path.join(tmpdir(), "jiti-no-cache-"));
    try {
      const filename = path.join(root, `config.${ext}`);
      const json = kind.startsWith("json");
      const helper = path.join(root, json ? "helper.json" : `helper.${ext}`);
      const leaf = path.join(root, `leaf.${ext}`);
      await writeFile(path.join(root, "package.json"), '{"type":"module"}');
      let entry = `export {default} from './helper.${ext}'`;
      let intermediate = `export {default} from './leaf.${ext}'`;
      switch (kind) {
        case "require": {
          entry = `module.exports = require('./helper.${ext}')`;
          intermediate = `module.exports = require('./leaf.${ext}')`;
          break;
        }
        case "dynamic": {
          entry = `export default (await import('./helper.${ext}')).default`;
          intermediate = `export default (await import('./leaf.${ext}')).default`;
          break;
        }
        case "json":
        case "json-bom": {
          entry = `import value from './helper.json'; import same from './helper.json'; if(value !== same) throw new Error('JSON module identity changed'); export default value.value`;
          break;
        }
        case "static": {
          entry = `import value from './helper.${ext}'; export default value`;
          break;
        }
      }
      await writeFile(filename, entry);
      if (!json) {
        await writeFile(helper, intermediate);
      }
      const jiti = createJiti(filename, {
        moduleCache: false,
        tryNative: false,
        interopDefault: false,
      });
      const nativeCache = createRequire(filename).cache;
      const priorCache = new Set(Object.keys(nativeCache));
      for (const value of [1, 2, 3]) {
        let source = `await Promise.resolve(); export default ${value}`;
        if (json) {
          source =
            (kind === "json-bom" ? "\uFEFF" : "") + JSON.stringify({ value });
        } else if (kind === "require") {
          source = `module.exports = ${value}`;
        }
        await writeFile(json ? helper : leaf, source);
        const loaded = await jiti.import<{ default?: number }>(filename);
        expect(loaded.default ?? loaded).toBe(value);
        const cache: ModuleCache = Object.create(null);
        const evaluated = await jiti.evalModule(
          await readFile(filename, "utf8"),
          { filename, async: true, cache },
        );
        expect((evaluated as { default?: number }).default ?? evaluated).toBe(
          value,
        );
        expect(
          Object.keys(cache)
            .map((name) => path.basename(name))
            .sort(),
        ).toEqual(
          json
            ? ["config.ts", "helper.json"]
            : [`config.${ext}`, `helper.${ext}`, `leaf.${ext}`],
        );
        const rootModule = Object.values(cache).find(
          (mod) => mod.filename === filename,
        )!;
        expect(
          rootModule.children.map((mod) => path.basename(mod.filename)),
        ).toEqual([path.basename(helper)]);
      }
      expect(
        Object.keys(nativeCache).filter(
          (name) =>
            !priorCache.has(name) &&
            name.replaceAll("\\", "/").startsWith(root.replaceAll("\\", "/")),
        ),
      ).toEqual([]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
