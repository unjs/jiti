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
    interopDefault: _booleanEnv("JITI_INTEROP_DEFAULT", false),
    extensions: _jsonEnv<string[]>("JITI_EXTENSIONS", [
      ".js",
      ".mjs",
      ".cjs",
      ".ts",
      ".tsx",
    ]),
    alias: _jsonEnv<Record<string, string>>("JITI_ALIAS", {}),
    nativeModules: _jsonEnv<string[]>("JITI_NATIVE_MODULES", []),
    transformModules: _jsonEnv<string[]>("JITI_TRANSFORM_MODULES", []),
    experimentalBun: _jsonEnv<boolean>(
      "JITI_EXPERIMENTAL_BUN",
      !!process.versions.bun,
    ),
  };

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
