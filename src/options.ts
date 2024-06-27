import { destr } from "destr";
import { lt } from "semver";
import objectHash from "object-hash";

import type { JITIOptions } from "./types";

const _EnvDebug = destr<boolean>(process.env.JITI_DEBUG);
const _EnvCache = destr<boolean>(process.env.JITI_CACHE);
const _EnvRequireCache = destr<boolean>(process.env.JITI_REQUIRE_CACHE);
const _EnvSourceMaps = destr<boolean>(process.env.JITI_SOURCE_MAPS);
const _EnvAlias = destr<Record<string, string>>(process.env.JITI_ALIAS);
const _EnvTransform = destr<string[]>(process.env.JITI_TRANSFORM_MODULES);
const _EnvNative = destr<string[]>(process.env.JITI_NATIVE_MODULES);
const _ExpBun = destr<string[]>(process.env.JITI_EXPERIMENTAL_BUN);

const jitiDefaults: JITIOptions = {
  debug: _EnvDebug,
  cache: _EnvCache === undefined ? true : !!_EnvCache,
  requireCache: _EnvRequireCache === undefined ? true : !!_EnvRequireCache,
  sourceMaps: _EnvSourceMaps === undefined ? false : !!_EnvSourceMaps,
  interopDefault: false,
  cacheVersion: "7",
  extensions: [".js", ".mjs", ".cjs", ".ts", ".mts", ".cts", ".json"],
  alias: _EnvAlias,
  nativeModules: _EnvNative || [],
  transformModules: _EnvTransform || [],
  experimentalBun: _ExpBun === undefined ? !!process.versions.bun : !!_ExpBun,
};

export function resolveJitiOptions(userOptions: JITIOptions): JITIOptions {
  const opts: JITIOptions = { ...jitiDefaults, ...userOptions };

  // Cache dependencies
  if (opts.transformOptions) {
    opts.cacheVersion += "-" + objectHash(opts.transformOptions);
  }

  return opts;
}
