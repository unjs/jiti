# jiti

Require with just-in-time compiler for typescript and esm files

## Features

- Stable support for typescript and esm syntax
- Provide sync interface to use inplace of `esm` or `require`
- Super slim and zero dependency (~1.8M install size)
- Works with CJS cache
- [ ] Filesystem caching
- [ ] Syntax detect to avoid extra transforms

## Usage

```js
const jiti = require('jiti')(__filename)

jiti('./path/to/file.ts')
```

## How it works

Transform is based on babel and babel-preset-env

## Development

- Clone Repo
- Run `yarn`
- Run `yarn build`
- Run `yarn dev`
- Run `node ./test/jiti.js`

## Roadmap

- [x] Basic working
- [ ] File based caching
- [ ] Syntax detect and fallback to CJS require
- [ ] Configurable transform
- [ ] Try sourcemap improvements
- [ ] Simplify project build system

## License

MIT
