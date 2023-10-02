import { isTest } from "std-env";

let createRequire = () => {
  throw new Error(
    "createRequire is not supported in browser of test environment.",
  );
};

try {
  createRequire = await import("module").then((m) => m.createRequire);
} catch {}

export default function (filename, opts) {
  const isBrowser =
    typeof window !== "undefined" &&
    typeof document !== "undefined" &&
    typeof navigator !== "undefined";

  // In browsers, or in Vitest,
  // we bypass jiti transform and fallback to the native import and let the runtime handles it
  if (isBrowser || isTest) {
    const jiti = () => {
      throw new Error(
        "jiti() is not supported in browser or test environment. Use `await jiti.import()` instead.",
      );
    };
    jiti.import = (file, options) => {
      return options._import();
    };
    return jiti;
  }

  const require = createRequire(import.meta.url);
  return require("./index.js")(filename, opts);
}
