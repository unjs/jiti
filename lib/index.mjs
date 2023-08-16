export default function (filename, opts) {
  const isBrowser =
    typeof window !== "undefined" &&
    typeof document !== "undefined" &&
    typeof navigator !== "undefined";
  const isVitest =
    typeof process !== "undefined" && process.env && process.env.VITEST;
  // In browsers, or in Vitest,
  // we bypass jiti transform and fallback to the native import and let the runtime handles it
  if (isBrowser || isVitest) {
    return (file, options) => {
      return options._import();
    };
  }

  const promise = import("./index.js").then((r) => r.default(filename, opts));
  return (...args) => {
    return promise.then((jiti) => jiti(...args));
  };
}
