import { lstatSync, accessSync, constants, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { isAbsolute, join } from "pathe";
import type { PackageJson } from "pkg-types";
import { interopDefault as mllyInteropDefault, pathToFileURL } from "mlly";
import { isWindows } from "std-env";
import type { Context } from "./types";
import { gray, green, blue, yellow, cyan, red } from "yoctocolors";

export function isDir(filename: string | URL): boolean {
  if (typeof filename !== "string" || filename.startsWith("file://")) {
    return false;
  }
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
      } catch {
        // Ignore errors
      }
      break;
    } catch {
      // Ignore errors
    }
  }
}

export function wrapModule(source: string, opts?: { async?: boolean }) {
  return `(${opts?.async ? "async " : ""}function (exports, require, module, __filename, __dirname, jitiImport) { ${source}\n});`;
}

const debugMap = {
  true: green("true"),
  false: yellow("false"),
  "[esm]": blue("[esm]"),
  "[cjs]": green("[cjs]"),
  "[import]": blue("[import]"),
  "[require]": green("[require]"),
  "[native]": cyan("[native]"),
  "[transpile]": yellow("[transpile]"),
  "[fallback]": red("[fallback]"),
  "[unknown]": red("[unknown]"),
  "[hit]": green("[hit]"),
  "[miss]": yellow("[miss]"),
  "[json]": green("[json]"),
};

export function debug(ctx: Context, ...args: unknown[]) {
  if (!ctx.opts.debug) {
    return;
  }
  const cwd = process.cwd();
  console.log(
    gray(
      [
        "[jiti]",
        ...args.map((arg) => {
          if ((arg as string) in debugMap) {
            return debugMap[arg as keyof typeof debugMap];
          }
          if (typeof arg !== "string") {
            return JSON.stringify(arg);
          }
          return arg.replace(cwd, ".");
        }),
      ].join(" "),
    ),
  );
}

export function jitiInteropDefault(ctx: Context, mod: any) {
  return ctx.opts.interopDefault ? mllyInteropDefault(mod) : mod;
}

export function normalizeWindowsImportId(id: string) {
  if (!isWindows || !isAbsolute(id)) {
    return id;
  }
  return pathToFileURL(id);
}
