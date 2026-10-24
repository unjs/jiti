import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
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

describe("evaluated module cache", () => {
  it.each(
    [false, true].flatMap((moduleCache) =>
      ["throw", "reject", "syntax"].map((failure) => ({
        moduleCache,
        failure,
      })),
    ),
  )(
    "retries $failure dependencies with moduleCache=$moduleCache",
    async ({ moduleCache, failure }) => {
      const root = await mkdtemp(path.join(tmpdir(), "jiti-cache-retry-"));
      const filename = path.join(root, "entry.cjs");
      const nativeCache = createRequire(filename).cache;
      try {
        const helper = path.join(root, "helper.cjs");
        const async = failure === "reject";
        const source = async
          ? "module.exports = await import('./helper.cjs')"
          : "module.exports = require('./helper.cjs')";
        await writeFile(filename, source);
        await writeFile(
          helper,
          failure === "syntax"
            ? "module.exports = ;"
            : `${async ? "await Promise.resolve();" : ""} throw new Error('dependency failed')`,
        );
        const jiti = createJiti(filename, {
          moduleCache,
          tryNative: false,
          interopDefault: false,
        });
        const cache: ModuleCache = Object.create(null);
        const evaluate = () =>
          jiti.evalModule(source, {
            filename,
            async,
            cache,
            forceTranspile: true,
          });
        const error =
          failure === "syntax" ? /Unexpected token/ : "dependency failed";
        if (async) {
          await expect(evaluate()).rejects.toThrow(error);
        } else {
          expect(evaluate).toThrow(error);
        }
        await writeFile(helper, "module.exports = { value: 42 }");
        expect(await evaluate()).toEqual({ value: 42 });
      } finally {
        for (const name of Object.keys(nativeCache)) {
          if (path.resolve(name).startsWith(root + path.sep)) {
            delete nativeCache[name];
          }
        }
        await rm(root, { recursive: true, force: true });
      }
    },
  );

  it.each([false, true])(
    "preserves a replacement module after an earlier rejection with moduleCache=%s",
    async (moduleCache) => {
      const root = await mkdtemp(
        path.join(tmpdir(), "jiti-cache-replacement-"),
      );
      const filename = path.join(root, "entry.cjs").replaceAll("\\", "/");
      const nativeCache = createRequire(filename).cache;
      try {
        await writeFile(filename, "module.exports = { value: 0 }");
        const jiti = createJiti(filename, {
          moduleCache,
          tryNative: false,
          interopDefault: false,
        });
        const cache: ModuleCache = Object.create(null);
        const options = { filename, async: true, cache, forceTranspile: true };
        const failed = jiti.evalModule(
          "await Promise.resolve(); throw new Error('earlier evaluation failed')",
          options,
        );
        const rejected = expect(failed).rejects.toThrow(
          "earlier evaluation failed",
        );
        expect(
          await jiti.evalModule("module.exports = { value: 42 }", options),
        ).toEqual({ value: 42 });
        await rejected;
        expect(
          await jiti.evalModule("module.exports = require('./entry.cjs')", {
            ...options,
            filename: path.join(root, "consumer.cjs").replaceAll("\\", "/"),
          }),
        ).toEqual({ value: 42 });
      } finally {
        for (const name of Object.keys(nativeCache)) {
          if (path.resolve(name).startsWith(root + path.sep)) {
            delete nativeCache[name];
          }
        }
        await rm(root, { recursive: true, force: true });
      }
    },
  );

  it("resolves packages relative to a cached JSON module", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "jiti-json-module-paths-"));
    const filename = path.join(root, "entry.ts");
    const packageEntry = path.join(
      root,
      "nested/node_modules/jiti-json-local/index.js",
    );
    const nativeRequire = createRequire(filename);
    try {
      await mkdir(path.dirname(packageEntry), { recursive: true });
      await writeFile(packageEntry, "module.exports = 42");
      const json = path.join(root, "nested/data.json");
      await writeFile(json, '{"value":42}');
      const jiti = createJiti(filename, {
        moduleCache: false,
        tryNative: false,
      });
      const cache: ModuleCache = Object.create(null);
      await jiti.evalModule("module.exports = require('./nested/data.json')", {
        filename,
        cache,
      });
      const mod = Object.values(cache).find(
        (entry) => path.resolve(entry.filename) === json,
      );
      expect(mod).toBeDefined();
      const resolved = nativeRequire.resolve("jiti-json-local", {
        paths: mod!.paths,
      });
      expect(path.normalize(resolved)).toBe(packageEntry);
      expect(nativeRequire(resolved)).toBe(42);
    } finally {
      delete nativeRequire.cache[packageEntry];
      await rm(root, { recursive: true, force: true });
    }
  });
});
