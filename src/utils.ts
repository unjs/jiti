import { lstatSync, accessSync, constants, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { isAbsolute, join } from "pathe";
import type { PackageJson } from "pkg-types";
import { pathToFileURL } from "mlly";
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
  return `(${opts?.async ? "async " : ""}function (exports, require, module, __filename, __dirname, jitiImport, jitiESMResolve) { ${source}\n});`;
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
  "[data]": green("[data]"),
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
  return ctx.opts.interopDefault ? interopDefault(mod) : mod;
}

// Source: https://github.com/unjs/mlly/blob/2348417d25522b98ed60ccc10eb030abb2f65744/src/cjs.ts#L59C1-L93C2
function interopDefault(
  sourceModule: any,
  opts: { preferNamespace?: boolean } = {},
): any {
  if (!isObject(sourceModule) || !("default" in sourceModule)) {
    return sourceModule;
  }
  const defaultValue = sourceModule.default;
  if (
    defaultValue === undefined ||
    defaultValue === null ||
    !Object.isExtensible(defaultValue)
  ) {
    return sourceModule;
  }
  const _defaultType = typeof defaultValue;
  if (
    _defaultType !== "object" &&
    !(_defaultType === "function" && !opts.preferNamespace)
  ) {
    return opts.preferNamespace ? sourceModule : defaultValue;
  }
  for (const key in sourceModule) {
    try {
      if (!(key in defaultValue)) {
        Object.defineProperty(defaultValue, key, {
          enumerable: key !== "default",
          configurable: key !== "default",
          get() {
            return sourceModule[key];
          },
        });
      }
    } catch (error_) {
      console.log(error_);
    }
  }
  return defaultValue;
}

export function normalizeWindowsImportId(id: string) {
  if (!isWindows || !isAbsolute(id)) {
    return id;
  }
  return pathToFileURL(id);
}
