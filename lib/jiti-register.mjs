import * as module from "node:module";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { readFileSync } from "node:fs";
import { createJiti } from "./jiti.mjs";
import {
  findClosestPackageJsonSync,
  evaluateModule,
  wrapSource,
} from "./utils.mjs";

// https://nodejs.org/api/module.html#moduleregisterspecifier-parenturl-options
module.register("./jiti-hooks.mjs", import.meta.url, {});

if ("registerHooks" in module) {
  const jiti = createJiti();

  // https://nodejs.org/api/module.html#moduleregisterhooksoptions
  module.registerHooks({
    resolve(specifier, context, nextResolve) {
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
    },

    load(url, context, nextLoad) {
      const { shouldSkip } = evaluateModule(url, jiti);

      if (shouldSkip) {
        return nextLoad(url, context);
      }

      const filename = fileURLToPath(url);

      if (url.endsWith(".js")) {
        const pkg = findClosestPackageJsonSync(dirname(filename));
        if (pkg && pkg.type === "module") {
          return nextLoad(url, context);
        }
      }

      const rawSource = readFileSync(filename, "utf8");

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
        async: false,
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
        source: wrapSource(transpiledSource, filename, "sync", import.meta.url),
        format: "module",
        shortCircuit: true,
      };
    },
  });
}
