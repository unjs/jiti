import { destr } from "destr";

import type { JitiOptions } from "./types";

export function resolveJitiOptions(userOptions: JitiOptions): JitiOptions {
  const _EnvFSCache =
    destr<boolean>(process.env.JITI_FS_CACHE) ??
    destr<boolean>(process.env.JITI_CACHE); // Backward compatibility
  const _EnvModuleCache =
    destr<boolean>(process.env.JITI_MODULE_CACHE) ??
    destr<boolean>(process.env.JITI_REQUIRE_CACHE); // Backward compatibility

  const _EnvDebug = destr<boolean>(process.env.JITI_DEBUG);
  const _EnvSourceMaps = destr<boolean>(process.env.JITI_SOURCE_MAPS);
  const _EnvAlias = destr<Record<string, string>>(process.env.JITI_ALIAS);
  const _EnvTransform = destr<string[]>(process.env.JITI_TRANSFORM_MODULES);
  const _EnvNative = destr<string[]>(process.env.JITI_NATIVE_MODULES);
  const _ExpBun = destr<string[]>(process.env.JITI_EXPERIMENTAL_BUN);

  const jitiDefaults: JitiOptions = {
    fsCache: _EnvFSCache === undefined ? true : !!_EnvFSCache,
    moduleCache: _EnvModuleCache === undefined ? true : !!_EnvModuleCache,
    debug: _EnvDebug,
    sourceMaps: _EnvSourceMaps === undefined ? false : !!_EnvSourceMaps,
    interopDefault: false,
    extensions: [".js", ".mjs", ".cjs", ".ts", ".mts", ".cts", ".json"],
    alias: _EnvAlias,
    nativeModules: _EnvNative || [],
    transformModules: _EnvTransform || [],
    experimentalBun: _ExpBun === undefined ? !!process.versions.bun : !!_ExpBun,
  };

  const deprecateOvverides: JitiOptions = {};
  if (userOptions.cache) {
    deprecateOvverides.fsCache = userOptions.cache;
  }
  if (userOptions.requireCache) {
    deprecateOvverides.requireCache = userOptions.requireCache;
  }

  const opts: JitiOptions = {
    ...jitiDefaults,
    ...deprecateOvverides,
    ...userOptions,
  };

  return opts;
}
