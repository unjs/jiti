# jiti

<!-- automd:badges color=F0DB4F bundlephobia -->

[![npm version](https://img.shields.io/npm/v/jiti?color=F0DB4F)](https://npmjs.com/package/jiti)
[![npm downloads](https://img.shields.io/npm/dm/jiti?color=F0DB4F)](https://npmjs.com/package/jiti)
[![bundle size](https://img.shields.io/bundlephobia/minzip/jiti?color=F0DB4F)](https://bundlephobia.com/package/jiti)

<!-- /automd -->

Just-in-Time Typescript and ESM support for Node.js.

> [!IMPORTANT]
> This is the development branch for jiti v2. Check out [jiti/v1](https://github.com/unjs/jiti/tree/v1) for latest stable docs and [unjs/jiti#174](https://github.com/unjs/jiti/issues/174) for the v2 roadmap.

## ✅ Features

- Seamless Typescript and ESM syntax support
- Seamless interoperability between ESM and CommonJS
- Synchronous API to replace `require()`
- Asynchronous API to replace `import()`
- ESM Loader support
- Super slim and zero dependency
- Smart syntax detection to avoid extra transforms
- Node.js native require cache integration
- Filesystem transpile with hard disk caches
- Custom resolve aliases

## 🌟 Used by

- [Docusaurus](https://docusaurus.io/)
- [FormKit](https://formkit.com/)
- [Histoire](https://histoire.dev/)
- [Knip](https://knip.dev/)
- [Nitro](https://nitro.unjs.io/)
- [Nuxt](https://nuxt.com/)
- [PostCSS loader](https://github.com/webpack-contrib/postcss-loader)
- [Rsbuild](https://rsbuild.dev/)
- [Size Limit](https://github.com/ai/size-limit)
- [Slidev](https://sli.dev/)
- [Tailwindcss](https://tailwindcss.com/)
- [Tokenami](https://github.com/tokenami/tokenami)
- [UnoCSS](https://unocss.dev/)
- [WXT](https://wxt.dev/)
- [Winglang](https://www.winglang.io/)
- [Graphql code generator](https://the-guild.dev/graphql/codegen)
- [Lingui](https://lingui.dev/)
- [Scaffdog](https://scaff.dog/)
- [...UnJS ecosystem](https://unjs.io/)
- [...58M+ npm monthly downloads](https://www.npmjs.com/package/jiti)
- [...5.5M+ public repositories](https://github.com/unjs/jiti/network/dependents)
- [ pr welcome add yours ]

## 💡 Usage

### CLI

You can use `jiti` CLI to quickly run any script with Typescript and native ESM support!

```bash
npx jiti ./index.ts

# or

jiti ./index.ts
```

### Programmatic

```js
// --- Initialize ---

// ESM
import { createJiti } from "jiti";
const jiti = createJiti(import.meta.url);

// CommonJS
const { createJiti } = require("jiti");
const jiti = createJiti(__filename);

// --- ESM Compatible APIs ---

// jiti.import() acts like import() with Typescript support
await jiti.import("./path/to/file.ts");

// jiti.esmResolve() acts like import.meta.resolve() with additional features
const resolvedPath = jiti.esmResolve("./src");

// --- CJS Compatible APIs ---

// jiti() acts like require() with Typescript and (non async) ESM support
jiti("./path/to/file.ts");

// jiti.resolve() acts like require.resolve() with additional features
const resolvedPath = jiti.resolve("./src");
```

You can also pass options as second argument:

```js
const jiti = createJiti(import.meta.url, { debug: true });
```

### Register global ESM loader

You can globally register jiti using [global hooks](https://nodejs.org/api/module.html#initialize).

**Note:** This is an experimental approach and only tested to work on Node.js > 20. I don't recommend it and unless you have to, please prefer explicit method.

```js
import "jiti/register";
```

Or:

```bash
node --import jiti/register index.ts
```

## ⚙️ Options

### `debug`

- Type: Boolean
- Default: `false`
- Environment variable: `JITI_DEBUG`

Enable verbose logging. You can use `JITI_DEBUG=1 <your command>` to enable it.

### `fsCache`

- Type: Boolean | String
- Default: `true`
- Environment variable: `JITI_FS_CACHE`

Filesystem source cache (enabled by default)

By default (when is `true`), jiti uses `node_modules/.cache/jiti` (if exists) or `{TMP_DIR}/jiti`.

**Note:** It is recommended to keep this option enabled for better performance.

### `moduleCache`

- Type: String
- Default: `true`
- Environment variable: `JITI_MODULE_CACHE`

Runtime module cache (enabled by default).

Disabling allows editing code and importing same module multiple times.

When enabled, jiti integrates with Node.js native CommonJS cache store.

### `transform`

- Type: Function
- Default: Babel (lazy loaded)

Transform function. See [src/babel](./src/babel.ts) for more details

### `sourceMaps`

- Type: Boolean
- Default `false`
- Environment variable: `JITI_SOURCE_MAPS`

Add inline source map to transformed source for better debugging.

### `interopDefault`

- Type: Boolean
- Default: `false`
- Environment variable: `JITI_INTEROP_DEFAULT`

Return the `.default` export of a module at the top-level.

### `alias`

- Type: Object
- Default: -
- Environment variable: `JITI_ALIAS`

Custom alias map used to resolve ids.

### `nativeModules`

- Type: Array
- Default: ['typescript`]
- Environment variable: `JITI_NATIVE_MODULES`

List of modules (within `node_modules`) to always use native require for them.

### `transformModules`

- Type: Array
- Default: []
- Environment variable: `JITI_TRANSFORM_MODULES`

List of modules (within `node_modules`) to transform them regardless of syntax.

### `experimentalBun`

- Type: Boolean
- Default: Enabled if `process.versions.bun` exists (Bun runtime)
- Environment variable: `JITI_EXPERIMENTAL_BUN`

Enable experimental native Bun support for transformations.

## Development

- Clone this repository
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
- Install dependencies using `pnpm install`
- Run `pnpm dev`
- Run `pnpm jiti ./test/path/to/file.ts`

## License

<!-- automd:contributors license=MIT author="pi0" -->

Published under the [MIT](https://github.com/unjs/jiti/blob/main/LICENSE) license.
Made by [@pi0](https://github.com/pi0) and [community](https://github.com/unjs/jiti/graphs/contributors) 💛
<br><br>
<a href="https://github.com/unjs/jiti/graphs/contributors">
<img src="https://contrib.rocks/image?repo=unjs/jiti" />
</a>

<!-- /automd -->

<!-- automd:with-automd -->
