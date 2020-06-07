# jiti

Just-in-time compiler for typescript and esm files for CommonJS environments.

## Features

- Stable typescript and esm syntax support (currently using babel)
- Provide sync interface to replace `require()` and `esm()`
- Super slim and zero dependency (~1M install size)
- Syntax detect to avoid extra transform
- CommonJS cache integration

## Usage

```js
const jiti = require('jiti')(__filename)

jiti('./path/to/file.ts')
```

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
- [ ] Sourcemap support
- [ ] File system cache
- [ ] Add tests
- [ ] Configurable transform (esbuild)

## License

MIT
