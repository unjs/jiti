import { lstatSync, accessSync, constants, readFileSync } from "node:fs";
import crypto from "node:crypto";
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
  const hash =
    !("Deno" in globalThis) && crypto.getFips?.()
      ? crypto.createHash("sha256")
      : crypto.createHash("md5");
  return hash.update(content).digest("hex").slice(0, len);
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

function interopDefault(mod: any): any {
  const modType = typeof mod;
  if (mod === null || (modType !== "object" && modType !== "function")) {
    return mod;
  }

  const def = mod.default;
  const defType = typeof def;
  if (def === null || def === undefined) {
    return mod;
  }
  const defIsObj = defType === "object" || defType === "function";

  return new Proxy(mod, {
    get(target, prop, receiver) {
      if (prop === "__esModule") {
        return true;
      }
      if (prop === "default") {
        return def;
      }
      if (Reflect.has(target, prop)) {
        return Reflect.get(target, prop, receiver);
      }
      if (defIsObj) {
        let fallback = Reflect.get(def, prop, receiver);
        if (typeof fallback === "function") {
          fallback = fallback.bind(def);
        }
        return fallback;
      }
    },
    apply(target, thisArg, args) {
      if (typeof target === "function") {
        return Reflect.apply(target, thisArg, args);
      }
      if (defType === "function") {
        return Reflect.apply(def, thisArg, args);
      }
    },
  });
}

export function normalizeWindowsImportId(id: string) {
  if (!isWindows || !isAbsolute(id)) {
    return id;
  }
  return pathToFileURL(id);
}
