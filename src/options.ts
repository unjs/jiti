import type { JitiOptions } from "./types";

export function resolveJitiOptions(userOptions: JitiOptions): JitiOptions {
  const jitiDefaults: JitiOptions = {
    fsCache: _booleanEnv("JITI_FS_CACHE", _booleanEnv("JITI_CACHE", true)),
    moduleCache: _booleanEnv(
      "JITI_MODULE_CACHE",
      _booleanEnv("JITI_REQUIRE_CACHE", true),
    ),
    debug: _booleanEnv("JITI_DEBUG", false),
    sourceMaps: _booleanEnv("JITI_SOURCE_MAPS", false),
    interopDefault: _booleanEnv("JITI_INTEROP_DEFAULT", true),
    extensions: _jsonEnv<string[]>("JITI_EXTENSIONS", [
      ".js",
      ".mjs",
      ".cjs",
      ".ts",
      ".tsx",
      ".mts",
      ".cts",
    ]),
    alias: _jsonEnv<Record<string, string>>("JITI_ALIAS", {}),
    nativeModules: _jsonEnv<string[]>("JITI_NATIVE_MODULES", []),
    transformModules: _jsonEnv<string[]>("JITI_TRANSFORM_MODULES", []),
    tryNative: _jsonEnv<boolean>("JITI_TRY_NATIVE", "Bun" in globalThis),
    jsx: _booleanEnv("JITI_JSX", false),
  };

  if (jitiDefaults.jsx) {
    jitiDefaults.extensions!.push(".jsx", ".tsx");
  }

  const deprecatOverrides: JitiOptions = {};
  if (userOptions.cache !== undefined) {
    deprecatOverrides.fsCache = userOptions.cache;
  }
  if (userOptions.requireCache !== undefined) {
    deprecatOverrides.moduleCache = userOptions.requireCache;
  }

  const opts: JitiOptions = {
    ...jitiDefaults,
    ...deprecatOverrides,
    ...userOptions,
  };

  return opts;
}

function _booleanEnv(name: string, defaultValue: boolean): boolean {
  const val = _jsonEnv<boolean>(name, defaultValue);
  return Boolean(val);
}

function _jsonEnv<T>(name: string, defaultValue?: T): T | undefined {
  const envValue = process.env[name];
  if (!(name in process.env)) {
    return defaultValue;
  }
  try {
    return JSON.parse(envValue!) as T;
  } catch {
    return defaultValue;
  }
}
