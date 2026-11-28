import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import { test } from "node:test";

import { createJiti } from "../../lib/jiti-native.mjs";

const fixtures = await readdir(new URL("../fixtures", import.meta.url));

const jiti = createJiti(import.meta.url, { importMeta: import.meta });

// Mostly broken because default type is set to commonjs in fixtures root
const ignore = new Set(
  [
    "error-runtime",
    "error-parse",
    "pure-esm-dep",
    "proto",
    "json",
    "esm",
    "env",
    "typescript",
    "top-level-await",
    "deps",
    "circular",
    "data-uri",
    "jsx",
    // TODO: Once supported, we should both enable test and avoid transform in supported Node.js versions
    "explicit-resource-management",
  ].filter(Boolean),
);

for (const fixture of fixtures) {
  if (ignore.has(fixture)) {
    continue;
  }

  test("fixtures/" + fixture + " (ESM) (Native)", async () => {
    await jiti.import("../fixtures/" + fixture);
  });
}

test("normalizeParentURL converts plain filesystem paths to file:// URLs", () => {
  const captureParent = (parentURL?: string | URL) => {
    let seenParent: string | URL | undefined;
    const instance = createJiti(parentURL, {
      importMeta: {
        ...import.meta,
        resolve(_id: string, parent?: string | URL) {
          seenParent = parent;
          return String(parent);
        },
      },
    });
    instance.esmResolve("./entry.js");
    return seenParent;
  };

  assert.equal(
    captureParent("/path/to/caller.mjs"),
    "file:///path/to/caller.mjs",
  );
  assert.equal(captureParent("/path/to/dir/"), "file:///path/to/dir/_");
  assert.equal(
    captureParent("C:/path/to/caller.mjs"),
    "file:///C:/path/to/caller.mjs",
  );
  assert.equal(
    captureParent(String.raw`C:\path\to\caller.mjs`),
    "file:///C:/path/to/caller.mjs",
  );
  assert.equal(
    captureParent(String.raw`\\server\share\caller.mjs`),
    "file://server/share/caller.mjs",
  );
  assert.equal(
    captureParent("/path/to/a#b%20c/caller.mjs"),
    "file:///path/to/a%23b%2520c/caller.mjs",
  );
  assert.equal(
    captureParent("/work/a\\b/caller.mjs"),
    "file:///work/a%5Cb/caller.mjs",
  );
  assert.equal(
    captureParent("file:///path/to/caller.mjs"),
    "file:///path/to/caller.mjs",
  );
  const url = new URL("file:///path/to/caller.mjs");
  assert.equal(captureParent(url), url);
});
