import { lstatSync, accessSync, constants, readFileSync } from "fs";
import { createHash } from "crypto";
import { tmpdir } from "os";
import { join } from "pathe";
import type { PackageJson } from "pkg-types";

export function getCacheDir() {
  if (process.cwd() !== tmpdir() || process.env.JITI_TMPDIR_KEEP) {
    return join(tmpdir(), "node-jiti");
  }

  // Workaround for pnpm setting an incorrect `TMPDIR`.
  // Set `JITI_TMPDIR_KEEP` to a truthy value to disable this workaround.
  // https://github.com/pnpm/pnpm/issues/6140
  // https://github.com/unjs/jiti/issues/120
  const currentTmpDir = process.env.TMPDIR;
  delete process.env.TMPDIR;
  const defaultTmpDir = tmpdir();
  process.env.TMPDIR = currentTmpDir;
  return join(defaultTmpDir, "node-jiti");
}

export function isDir(filename: string): boolean {
  try {
    const stat = lstatSync(filename);
    return stat.isDirectory();
  } catch {
    // lstatSync throws an error if path doesn't exist
    return false;
  }
}

export function isWritable(filename: string): boolean {
  try {
    accessSync(filename, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

export function md5(content: string, len = 8) {
  return createHash("md5").update(content).digest("hex").slice(0, len);
}

export function detectLegacySyntax(code: string) {
  return code.match(/\?\.|\?\?/);
}

export function isObject(val: any) {
  return val !== null && typeof val === "object";
}

export function readNearestPackageJSON(path: string): PackageJson | undefined {
  while (path && path !== "." && path !== "/") {
    path = join(path, "..");
    try {
      const pkg = readFileSync(join(path, "package.json"), "utf8");
      try {
        return JSON.parse(pkg);
      } catch {}
      break;
    } catch {}
  }
}
