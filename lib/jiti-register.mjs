// https://nodejs.org/api/module.html#moduleregisterhooksoptions
// https://nodejs.org/api/module.html#moduleregisterspecifier-parenturl-options
import * as nodeModule from "node:module";

// `module.register()` is deprecated since Node.js 26 (DEP0205). Node.js 22 also has
// `registerHooks()`, but it can't tell `require()` apart from `import` there.
const useSyncHooks =
  typeof nodeModule.registerHooks === "function" &&
  Number(process.versions.node.split(".")[0]) >= 24;

if (useSyncHooks) {
  const { initialize, resolve, load } = await import("./jiti-hooks.mjs");
  await initialize();
  nodeModule.registerHooks({ resolve, load });
} else {
  nodeModule.register("./jiti-hooks.mjs", import.meta.url, {});
}
