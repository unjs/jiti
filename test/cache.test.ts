import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCache } from "../src/cache";

const fs = vi.hoisted(() => ({
  writes: [] as string[],
  failRename: false,
  failRm: false,
}));

vi.mock("node:fs", async (importOriginal) => {
  const original = await importOriginal<typeof import("node:fs")>();
  return {
    ...original,
    writeFileSync: ((path: string, ...args: any[]) => {
      fs.writes.push(String(path));
      return (original.writeFileSync as any)(path, ...args);
    }) as typeof original.writeFileSync,
    renameSync: ((...args: Parameters<typeof original.renameSync>) => {
      if (fs.failRename) throw new Error("rename failed");
      return original.renameSync(...args);
    }) as typeof original.renameSync,
    rmSync: ((...args: Parameters<typeof original.rmSync>) => {
      if (fs.failRm) throw new Error("rm failed");
      return original.rmSync(...args);
    }) as typeof original.rmSync,
  };
});

describe("getCache", () => {
  let cacheDir: string;

  const ctx = () => ({ opts: { fsCache: cacheDir } }) as any;
  const topts = {
    filename: "/project/src/mod.ts",
    source: "export const x = 1",
  } as any;
  const cachedFiles = () => readdirSync(cacheDir);

  beforeEach(() => {
    cacheDir = mkdtempSync(join(tmpdir(), "jiti-cache-test-"));
    fs.writes.length = 0;
    fs.failRename = false;
    fs.failRm = false;
  });

  afterEach(() => {
    fs.failRename = false;
    fs.failRm = false;
    rmSync(cacheDir, { recursive: true, force: true });
  });

  it("stores the transformed code and serves it on the next call", () => {
    const get = vi.fn(() => "transformed();");

    expect(getCache(ctx(), topts, get)).toBe("transformed();");
    expect(getCache(ctx(), topts, get)).toContain("transformed();");

    expect(get).toHaveBeenCalledTimes(1);
    expect(cachedFiles()).toHaveLength(1);
    expect(readFileSync(join(cacheDir, cachedFiles()[0]), "utf8")).toContain(
      "transformed();",
    );
  });

  it("replaces an entry without writing to the cache file in place", () => {
    getCache(ctx(), topts, () => "first();");
    const [cacheFile] = cachedFiles();
    const cacheFilePath = join(cacheDir, cacheFile);
    fs.writes.length = 0;

    // another source for the same file: the entry is rebuilt
    getCache(
      ctx(),
      { ...topts, source: "export const x = 2" },
      () => "second();",
    );

    // a reader must never see the file while it is truncated or half written
    expect(fs.writes).not.toContain(cacheFilePath);
    expect(readFileSync(cacheFilePath, "utf8")).toContain("second();");
  });

  it("does not leave temporary files behind", () => {
    getCache(ctx(), topts, () => "first();");
    getCache(
      ctx(),
      { ...topts, source: "export const x = 2" },
      () => "second();",
    );

    expect(cachedFiles().filter((file) => file.endsWith(".tmp"))).toEqual([]);
  });

  it("still returns the code and cleans up when the entry can not be replaced", () => {
    getCache(ctx(), topts, () => "first();");
    const [entry] = cachedFiles();
    // a non empty directory at the entry's place makes the rename fail
    rmSync(join(cacheDir, entry));
    mkdirSync(join(cacheDir, entry));
    writeFileSync(join(cacheDir, entry, "blocker"), "");

    const rebuild = {
      opts: { fsCache: cacheDir, rebuildFsCache: true },
    } as any;
    const result = getCache(rebuild, topts, () => "second();");

    expect(result).toBe("second();");
    expect(cachedFiles()).toEqual([entry]);
  });

  it("still returns the code when the entry can not be replaced and the cleanup fails too", () => {
    fs.failRename = true;
    fs.failRm = true;

    expect(getCache(ctx(), topts, () => "first();")).toBe("first();");
  });
});
