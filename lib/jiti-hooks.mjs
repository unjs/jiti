import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { createJiti } from "./jiti.mjs";
import {
  findClosestPackageJson,
  evaluateModule,
  wrapSource,
} from "./utils.mjs";

let jiti;

// https://nodejs.org/api/module.html#initialize
export async function initialize() {
  jiti = createJiti();
}

// https://nodejs.org/api/module.html#resolvespecifier-context-nextresolve
export async function resolve(specifier, context, nextResolve) {
  const { shouldSkip, conditions } = evaluateModule(
    specifier,
    jiti,
    context?.conditions,
  );

  if (shouldSkip) {
    return nextResolve(specifier, context);
  }

  const resolvedPath = jiti.esmResolve(specifier, {
    parentURL: context?.parentURL,
    conditions,
  });

  return {
    url: resolvedPath,
    shortCircuit: true,
  };
}

// https://nodejs.org/api/module.html#loadurl-context-nextload
export async function load(url, context, nextLoad) {
  const { shouldSkip } = evaluateModule(url, jiti);

  if (shouldSkip) {
    return nextLoad(url, context);
  }

  const filename = fileURLToPath(url);

  if (url.endsWith(".js")) {
    const pkg = await findClosestPackageJson(dirname(filename));
    if (pkg && pkg.type === "module") {
      return nextLoad(url, context);
    }
  }

  const rawSource = await readFile(filename, "utf8");

  if (url.endsWith(".json")) {
    return {
      source: `export default ${rawSource}`,
      format: "module",
      shortCircuit: true,
    };
  }

  const transpiledSource = jiti.transform({
    source: rawSource,
    filename: filename,
    ts: url.endsWith("ts"),
    retainLines: true,
    async: true,
    jsx: jiti.options.jsx,
  });

  if (url.endsWith(".js") && !transpiledSource.includes("jitiImport")) {
    return {
      source: transpiledSource,
      format: "commonjs",
      shortCircuit: true,
    };
  }

  return {
    source: wrapSource(transpiledSource, filename, "async", import.meta.url),
    format: "module",
    shortCircuit: true,
  };
}
