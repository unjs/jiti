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

- Type: String| Function
- Default: `babel`

Transform function. As an alternative to providing a transform function, you may use one of the built-in code transformers, which are lazy loaded.

Supported built-ins:

- `babel` ([source](./src/babel.ts))
- `esbuild-async` ([source](./src/esbuild-async.ts))
- `esbuild-sync` ([source](./src/esbuild-sync.ts))

Example using `esbuild-async`:

```js
// using esbuild
const jiti = require('jiti')(__filename, { transform: 'esbuild' })

// using esbuild sync version
const jiti = require('jiti')(__filename, { transform: 'esbuild', sync: true })
```

## Compared to Alternatives

See [Alternatives](./Alternatives.md)

## Development

- Clone Repo
- Run `yarn`
- Run `yarn build`
- Run `yarn dev`
- Run `node ./test/jiti.babel.js` or `node ./test/jiti.esbuild.js`

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
