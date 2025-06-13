import { lstatSync, accessSync, constants, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, isAbsolute, join } from "pathe";
import type { PackageJson } from "pkg-types";
import { pathToFileURL } from "mlly";
import { isWindows } from "std-env";
import type {
  ConditionsConfigResolved,
  ConditionsConfigResolvedItem,
  Context,
  ExtendedPackageJson,
  JitiOptions,
} from "./types";
import { gray, green, blue, yellow, cyan, red } from "yoctocolors";
import { minimatch } from "minimatch";
import type { ConditionsConfig } from "../lib/types";

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

export function hasAccessSync(path: string) {
  try {
    accessSync(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export function findClosestPackageJsonSync(
  dir: string,
): ExtendedPackageJson | null {
  if (dir === "/") return null;

  const packageJsonPath = join(dir, "package.json");

  if (hasAccessSync(packageJsonPath)) {
    return JSON.parse(readFileSync(packageJsonPath, "utf8"));
  }

  return findClosestPackageJsonSync(dirname(dir));
}

export function array<T>(v: T | T[]): T[] {
  return Array.isArray(v) ? v : [v];
}

export function resolveConditionsConfig(
  opts: JitiOptions,
): ConditionsConfigResolved {
  let src: ConditionsConfig | boolean | undefined = undefined;

  if (opts.conditions === true) {
    const pkg = findClosestPackageJsonSync(process.cwd());

    if (pkg && pkg.conditions) {
      src = pkg.conditions;
    }
  } else {
    src = opts.conditions;
  }

  if (src) {
    if (Array.isArray(src)) {
      return src.map((value): ConditionsConfigResolvedItem => {
        return typeof value === "string"
          ? {
              match: null,
              ignore: null,
              values: [value],
            }
          : {
              match: value.match ? array(value.match) : null,
              ignore: value.ignore ? array(value.ignore) : null,
              values: value.values,
            };
      });
    } else if (typeof src === "object") {
      return Object.entries(src).map(
        ([key, values]): ConditionsConfigResolvedItem => {
          return {
            match: [key],
            ignore: null,
            values,
          };
        },
      );
    }
  }

  return [
    {
      match: null,
      ignore: null,
      values: [],
    },
  ];
}

export function getMatchingConditions(
  config: ConditionsConfigResolved,
  specifier: string,
  extraConditions?: string[] | null,
): string[] | undefined {
  const conditions: Set<string> = new Set(extraConditions || []);

  for (const { match, ignore, values } of config) {
    if (
      (!match || match.some((m) => minimatch(specifier, m))) &&
      (!ignore || !ignore.some((i) => minimatch(specifier, i)))
    ) {
      for (const value of values) {
        conditions.add(value);
      }
    }
  }

  return conditions.size > 0 ? [...conditions] : undefined;
}
