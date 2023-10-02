import { JITIOptions } from "./types";
import escapeStringRegexp from "escape-string-regexp";
import createRequire from "create-require";
import { join } from "pathe";
import { normalizeAliases } from "pathe/utils";
import { platform } from "os";
import { interopDefault } from "mlly";
import { mkdirSync } from "fs";
import { isDir } from "./utils";
import { accessSync, constants } from "fs";
import { tmpdir } from "os";

export type JITIContext = ReturnType<typeof createJitiContext>;

const isWindows = platform() === "win32";

export function createJitiContext(opts: JITIOptions, _filename: string) {
  // Normalize aliases (and disable if non given)
  const alias =
    opts.alias && Object.keys(opts.alias).length > 0
      ? normalizeAliases(opts.alias || {})
      : null;

  // List of modules to force transform or native
  const nativeModules = ["typescript", "jiti", ...(opts.nativeModules || [])];
  const transformModules = [...(opts.transformModules || [])];
  const isNativeRe = new RegExp(
    `node_modules/(${nativeModules
      .map((m) => escapeStringRegexp(m))
      .join("|")})/`,
  );
  const isTransformRe = new RegExp(
    `node_modules/(${transformModules
      .map((m) => escapeStringRegexp(m))
      .join("|")})/`,
  );

  function debug(...args: string[]) {
    if (opts.debug) {
      // eslint-disable-next-line no-console
      console.log("[jiti]", ...args);
    }
  }

  // If filename is dir, createRequire goes with parent directory, so we need fakepath
  if (!_filename) {
    _filename = process.cwd();
  }
  if (isDir(_filename)) {
    _filename = join(_filename, "index.js");
  }

  if (opts.cache === true) {
    opts.cache = getCacheDir();
  }
  if (opts.cache) {
    try {
      mkdirSync(opts.cache as string, { recursive: true });
      if (!isWritable(opts.cache)) {
        throw new Error("directory is not writable");
      }
    } catch (error: any) {
      debug("Error creating cache directory at ", opts.cache, error);
      opts.cache = false;
    }
  }

  const nativeRequire = createRequire(
    isWindows
      ? _filename.replace(/\//g, "\\") // Import maps does not work with normalized paths!
      : _filename,
  );

  function _interopDefault(mod: any) {
    return opts.interopDefault ? interopDefault(mod) : mod;
  }

  return {
    opts,
    _filename,
    _interopDefault,
    nativeRequire,
    alias,
    isNativeRe,
    isTransformRe,
    debug,
  };
}

export function getCacheDir() {
  let _tmpDir = tmpdir();

  // Workaround for pnpm setting an incorrect `TMPDIR`.
  // Set `JITI_RESPECT_TMPDIR_ENV` to a truthy value to disable this workaround.
  // https://github.com/pnpm/pnpm/issues/6140
  // https://github.com/unjs/jiti/issues/120
  if (
    process.env.TMPDIR &&
    _tmpDir === process.cwd() &&
    !process.env.JITI_RESPECT_TMPDIR_ENV
  ) {
    const _env = process.env.TMPDIR;
    delete process.env.TMPDIR;
    _tmpDir = tmpdir();
    process.env.TMPDIR = _env;
  }

  return join(_tmpDir, "node-jiti");
}

export function isWritable(filename: string): boolean {
  try {
    accessSync(filename, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}
