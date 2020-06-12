## Compared to alternatives

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
