# jiti

> Runtime typescript and ESM support for Node.js (CommonJS)

[![version][npm-v-src]][npm-v-href]
[![downloads][npm-d-src]][npm-d-href]
[![size][size-src]][size-href]

## Features

- Stable typescript and esm syntax support
- Provide sync interface to replace require
- Super slim and zero dependency
- Syntax detect to avoid extra transform
- CommonJS cache integration
- Filesystem transpile cache + V8 compile cache

## Usage

```js
const jiti = require('jiti')(__filename)

jiti('./path/to/file.ts')
```

You can also pass options as second argument:

```js
const jiti = require('jiti')(__filename, { debug: true })
```

## Options

### `debug`

- Type: Boolean
- Default: `false`

Enable debug to see which files are transpiled

### `cache`

- Type: Boolean
- Default: `true`

Use transpile cache

### `cacheDir`

- Type: String
- Default: `node_modules/.cache/jiti` or `{TMP_DIR}/node-jiti`


Cache directroy (only effective if `cache` is `true`)

### `transform`

- Type: Function
- Default: Babel (lazy loaded)

Transform function. See [src/babel](./src/babel.ts) for more details

## Compared to Alternatives

### [`standard-things/esm`](https://github.com/standard-things/esm)

- `+` Much more stable thanks to babel
- `+` Less low level operations
- `+` Typescript support
- `-` Slower (without cache)

### [`babel-register`](https://babeljs.io/docs/en/babel-register)

- `+` Smaller install size (~1M vs ~11M with same plugins)
- `+` Configured out of the box
- `+` Smart syntax detect to avoid unnecessary trnaspilation
- `+` Does not ignores `node_modules`. ESM everywhere yay!
- `+` Embeddable

### [`esbuild`](https://github.com/evanw/esbuild)

- `+` No native dependency
- `+` More stable thanks to babel
- `-` Slower
- `+` Embeddable

### `ts-node`

- `+` Support both esm and typescript
- `/` No typechecking support / Faster
- `+` Smart syntax detect to avoid unnecessary transpilation

### Native ESM Support (MJS)

- It is not (yet) landed as a stable feature
- No typescript support
- Limitted to `.mjs` files with different executation context (no `__filename`, `require`, etc)

### Bundlers (`rollup`, `webpack`, `snowpack`, etc)

Meanwhile it would be much better making an optimized bundle to deploy to production or as npm package, using bundler setup and watching is frustrating during project development that's where `jiti` (or similar tools like `ts-node`) would be more convenient.

**Note:** However currently only babel transform is supported, configurable transform support is in the roadmap so using `esbuild` or other solutions would be possible.

## Development

- Clone Repo
- Run `yarn`
- Run `yarn build`
- Run `yarn dev`
- Run `node ./test/jiti.js`

## Roadmap

- [x] Basic working
- [x] Syntax detect and fallback to CJS require
- [x] Improve project build system
- [x] File system cache
- [x] Configurable transform
- [ ] Add tests
- [ ] Support `node -r jiti`
- [ ] esbuild support

## License

MIT. Made with 💖

<!-- Refs -->
[npm-v-src]: https://img.shields.io/npm/v/jiti?style=flat-square
[npm-v-href]: https://npmjs.com/package/jiti

[npm-d-src]: https://img.shields.io/npm/dm/jiti?style=flat-square
[npm-d-href]: https://npmjs.com/package/jiti

[github-actions-src]: https://img.shields.io/github/workflow/status/nuxt-contrib/jiti/ci/master?style=flat-square
[github-actions-href]: https://github.com/nuxt-contrib/jiti/actions?query=workflow%3Aci

[size-src]: https://packagephobia.now.sh/badge?p=jiti
[size-href]: https://packagephobia.now.sh/result?p=jiti
