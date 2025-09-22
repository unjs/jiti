# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## v2.6.0

[compare changes](https://github.com/unjs/jiti/compare/v2.5.1...v2.6.0)

### 🔥 Performance

- Lazy load babel transform ([#405](https://github.com/unjs/jiti/pull/405))

### 🩹 Fixes

- **cjs-interop:** Handle function default exports ([#396](https://github.com/unjs/jiti/pull/396))
- Always use native for `node:` specifiers ([#392](https://github.com/unjs/jiti/pull/392))

### 📦 Build

- Migrate to rspack ([#404](https://github.com/unjs/jiti/pull/404))

### 🏡 Chore

- Update deps ([5123334](https://github.com/unjs/jiti/commit/5123334))

### ✅ Tests

- Update deno and bun native test ignores ([df844f8](https://github.com/unjs/jiti/commit/df844f8))
- New bench script ([6404427](https://github.com/unjs/jiti/commit/6404427))

### ❤️ Contributors

- Pooya Parsa ([@pi0](https://github.com/pi0))
- Volodymyr Kolesnykov ([@sjinks](https://github.com/sjinks))
- Jungwoo LEE <jungwoo3490@naver.com>

## v2.5.1

[compare changes](https://github.com/unjs/jiti/compare/v2.5.0...v2.5.1)

### 🩹 Fixes

- **interop:** Passthrough module if it is a promise ([#389](https://github.com/unjs/jiti/pull/389))

### ❤️ Contributors

- Pooya Parsa <pyapar@gmail.com>

## v2.5.0

[compare changes](https://github.com/unjs/jiti/compare/v2.4.2...v2.5.0)

### 🚀 Enhancements

- Use `sha256` for cache entries in fips mode ([#375](https://github.com/unjs/jiti/pull/375))
- `rebuildFsCache` ( `JITI_REBUILD_FS_CACHE`) ([#379](https://github.com/unjs/jiti/pull/379))

### 🩹 Fixes

- Interop modules with nil default export ([#377](https://github.com/unjs/jiti/pull/377))
- **register:** Handle `require(<json>)` ([#374](https://github.com/unjs/jiti/pull/374))

### 🏡 Chore

- Update ci ([6b7fe8b](https://github.com/unjs/jiti/commit/6b7fe8b))
- Update deps ([fb2b903](https://github.com/unjs/jiti/commit/fb2b903))
- Add defaults in JSDocs ([#365](https://github.com/unjs/jiti/pull/365))
- Update deps ([35a6a61](https://github.com/unjs/jiti/commit/35a6a61))
- Lint ([dde7c82](https://github.com/unjs/jiti/commit/dde7c82))
- Update snapshot ([c567a37](https://github.com/unjs/jiti/commit/c567a37))

### ✅ Tests

- Update snapshot ([c7cfeed](https://github.com/unjs/jiti/commit/c7cfeed))
- Only include src for coverage report ([#372](https://github.com/unjs/jiti/pull/372))

### ❤️ Contributors

- Kricsleo ([@kricsleo](https://github.com/kricsleo))
- Pooya Parsa ([@pi0](https://github.com/pi0))
- Kanon ([@ysknsid25](https://github.com/ysknsid25))
- Arya Emami ([@aryaemami59](https://github.com/aryaemami59))

## v2.4.2

[compare changes](https://github.com/unjs/jiti/compare/v2.4.1...v2.4.2)

### 🩹 Fixes

- **cache:** Add `+map` suffix to fs entries when `sourceMaps` enabled ([#352](https://github.com/unjs/jiti/pull/352))
- Use native require cache of loaded entries only ([#348](https://github.com/unjs/jiti/pull/348))

### 🏡 Chore

- Update deps ([7b7ffef](https://github.com/unjs/jiti/commit/7b7ffef))

### ✅ Tests

- Simplify snapshot tests ([#351](https://github.com/unjs/jiti/pull/351))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v2.4.1

[compare changes](https://github.com/unjs/jiti/compare/v2.4.0...v2.4.1)

### 🩹 Fixes

- Interop modules with primitive default export ([#343](https://github.com/unjs/jiti/pull/343))

### 🏡 Chore

- Update deps ([58d3f5f](https://github.com/unjs/jiti/commit/58d3f5f))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v2.4.0

[compare changes](https://github.com/unjs/jiti/compare/v2.3.3...v2.4.0)

### 🚀 Enhancements

- Support generic type for `jiti.import<T>` ([#331](https://github.com/unjs/jiti/pull/331))

### 🩹 Fixes

- Try to resolve `.ts` files with `.js` extension from js files ([#337](https://github.com/unjs/jiti/pull/337))

### 🏡 Chore

- Update renovate.json ([86f11b3](https://github.com/unjs/jiti/commit/86f11b3))
- Update deps and lockfile ([5dfb0ec](https://github.com/unjs/jiti/commit/5dfb0ec))
- Add nvmrc ([899a782](https://github.com/unjs/jiti/commit/899a782))

### 🤖 CI

- Deno v2 compat ([f4d0062](https://github.com/unjs/jiti/commit/f4d0062))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Lars Kappert ([@webpro](http://github.com/webpro))
- Alexander <a.hywax@gmail.com>

## v2.3.3

[compare changes](https://github.com/unjs/jiti/compare/v2.3.2...v2.3.3)

### 🩹 Fixes

- **eval:** Return fallback value ([#326](https://github.com/unjs/jiti/pull/326))

### 💅 Refactors

- Remove some unused exports ([#327](https://github.com/unjs/jiti/pull/327))

### ❤️ Contributors

- Lars Kappert ([@webpro](http://github.com/webpro))

## v2.3.2

[compare changes](https://github.com/unjs/jiti/compare/v2.3.1...v2.3.2)

### 🩹 Fixes

- **eval:** Fallback in async mode ([#325](https://github.com/unjs/jiti/pull/325))

### 🏡 Chore

- Update lockfile ([3627a56](https://github.com/unjs/jiti/commit/3627a56))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v2.3.1

[compare changes](https://github.com/unjs/jiti/compare/v2.3.0...v2.3.1)

### 🩹 Fixes

- Conditional access to `mod.default` ([8c30a94](https://github.com/unjs/jiti/commit/8c30a94))

### 🏡 Chore

- Update note ([f67ed60](https://github.com/unjs/jiti/commit/f67ed60))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v2.3.0

[compare changes](https://github.com/unjs/jiti/compare/v2.2.1...v2.3.0)

### 🚀 Enhancements

- Support `jiti.import(id, {default: true})` ([#323](https://github.com/unjs/jiti/pull/323))

### 🩹 Fixes

- **interopDefault:** Avoid `in` operator for primitive inputs ([#321](https://github.com/unjs/jiti/pull/321))

### 💅 Refactors

- **interopDefault:** Simplify logic for default export checks ([#322](https://github.com/unjs/jiti/pull/322))

### 📖 Documentation

- Fix format ([#320](https://github.com/unjs/jiti/pull/320))
- Update interopDefault description and reference ([61891a0](https://github.com/unjs/jiti/commit/61891a0))
- Add note about interop default ([537fa39](https://github.com/unjs/jiti/commit/537fa39))

### 🏡 Chore

- Update lockfile ([c1325e9](https://github.com/unjs/jiti/commit/c1325e9))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- @beer ([@iiio2](http://github.com/iiio2))

## v2.2.1

[compare changes](https://github.com/unjs/jiti/compare/v2.2.0...v2.2.1)

### 🩹 Fixes

- Bump cache version ([3acd097](https://github.com/unjs/jiti/commit/3acd097))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v2.2.0

[compare changes](https://github.com/unjs/jiti/compare/v2.1.2...v2.2.0)

### 🚀 Enhancements

- Use smarter proxy for `interopDefault` ([#318](https://github.com/unjs/jiti/pull/318))

### 💅 Refactors

- Inline interopDefault from mlly ([8826047](https://github.com/unjs/jiti/commit/8826047))

### 🤖 CI

- Run nightly release once ([4f9d67d](https://github.com/unjs/jiti/commit/4f9d67d))
- Correct condition ([1384010](https://github.com/unjs/jiti/commit/1384010))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v2.1.2

[compare changes](https://github.com/unjs/jiti/compare/v2.1.1...v2.1.2)

### 🌊 Types

- Use local `NodeModule` type ([718bea2](https://github.com/unjs/jiti/commit/718bea2))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v2.1.1

[compare changes](https://github.com/unjs/jiti/compare/v2.1.0...v2.1.1)

### 🩹 Fixes

- **types:** Add standalone types for node require ([#316](https://github.com/unjs/jiti/pull/316))

### 🏡 Chore

- Updarte deps ([5998e3c](https://github.com/unjs/jiti/commit/5998e3c))

### ✅ Tests

- Add dependency tests ([1d86ca3](https://github.com/unjs/jiti/commit/1d86ca3))
- Ignore deps for node native register ([e7ffe04](https://github.com/unjs/jiti/commit/e7ffe04))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v2.1.0

[compare changes](https://github.com/unjs/jiti/compare/v2.0.0...v2.1.0)

### 🚀 Enhancements

- Enable `interopDefault` by default ([#310](https://github.com/unjs/jiti/pull/310))
- Support `import.meta.dirname` and `import.meta.filename` ([#308](https://github.com/unjs/jiti/pull/308))

### 🔥 Performance

- **cli:** Enable node 22 compile cache ([#312](https://github.com/unjs/jiti/pull/312))

### 🩹 Fixes

- Make `TransformOptions` type strict to allow auto-complete ([#305](https://github.com/unjs/jiti/pull/305))
- Properly handle tsx ([#311](https://github.com/unjs/jiti/pull/311))

### 💅 Refactors

- Deprecate commonjs api ([#313](https://github.com/unjs/jiti/pull/313))

### 📦 Build

- Fix `/register` and `/native` subpath types for `Node10` module resolution ([#304](https://github.com/unjs/jiti/pull/304))

### 🏡 Chore

- Remove ext for consistency ([e4a9bae](https://github.com/unjs/jiti/commit/e4a9bae))
- Add jsx field ([6a4e13a](https://github.com/unjs/jiti/commit/6a4e13a))
- Update dependencies ([ee90eca](https://github.com/unjs/jiti/commit/ee90eca))
- Lint ([85d7c41](https://github.com/unjs/jiti/commit/85d7c41))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Arya Emami ([@aryaemami59](http://github.com/aryaemami59))

## v2.0.0

[compare changes](https://github.com/unjs/jiti/compare/v2.0.0-rc.1...v2.0.0)

### 🚀 Enhancements

- Handle `data:` imports (non-native only) ([#299](https://github.com/unjs/jiti/pull/299))
- Support jsx ([#200](https://github.com/unjs/jiti/pull/200))
- Eval esm modules with fallback loader ([#300](https://github.com/unjs/jiti/pull/300))
- Support `import.meta.resolve` ([#301](https://github.com/unjs/jiti/pull/301))

### 🩹 Fixes

- Handle global url instance mismatch ([#298](https://github.com/unjs/jiti/pull/298))
- Optional access to `Reflect.metadata` ([#165](https://github.com/unjs/jiti/pull/165))
- Add only `paths` option to native `require.resolve` ([50e4280](https://github.com/unjs/jiti/commit/50e4280))

### 💅 Refactors

- Make `jiti.esmResolve` consistent with `import.meta.resolve` ([#303](https://github.com/unjs/jiti/pull/303))

### 📖 Documentation

- Add example for inline `JITI_ALIAS` ([a53715a](https://github.com/unjs/jiti/commit/a53715a))

### 🏡 Chore

- Update readme ([4e60353](https://github.com/unjs/jiti/commit/4e60353))
- Update lockfile ([10d8aab](https://github.com/unjs/jiti/commit/10d8aab))
- Update release script ([f0ed3cf](https://github.com/unjs/jiti/commit/f0ed3cf))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Vlad Sirenko ([@sirenkovladd](http://github.com/sirenkovladd))
- Ethan ([@yuusheng](http://github.com/yuusheng))
- Jakub Boháček <gh-noreply@bohacek.dev>
- Daniel Roe ([@danielroe](http://github.com/danielroe))

## v2.0.0-rc.1

[compare changes](https://github.com/unjs/jiti/compare/v2.0.0-beta.3...v2.0.0-rc.1)

### 🚀 Enhancements

- `jiti/native` export ([#289](https://github.com/unjs/jiti/pull/289))
- Improve `jiti/native` compatibility with node and deno ([#294](https://github.com/unjs/jiti/pull/294))

### 💅 Refactors

- Improve internal babel types ([#271](https://github.com/unjs/jiti/pull/271))
- Always use native impl for `jiti/native` ([#293](https://github.com/unjs/jiti/pull/293))
- Rename `experimentalBun` to `tryNative` ([#295](https://github.com/unjs/jiti/pull/295))

### 📦 Build

- Fix type resolution issue ([#269](https://github.com/unjs/jiti/pull/269))

### 🏡 Chore

- Stricter typechecks ([64dda9f](https://github.com/unjs/jiti/commit/64dda9f))
- Fix build ([e78daeb](https://github.com/unjs/jiti/commit/e78daeb))
- Update dependencies ([05b7bd4](https://github.com/unjs/jiti/commit/05b7bd4))
- Replace exec logic in test fixtures ([#286](https://github.com/unjs/jiti/pull/286))
- Add storybook to used by list ([#284](https://github.com/unjs/jiti/pull/284))
- Update jiti-native ([8b76742](https://github.com/unjs/jiti/commit/8b76742))
- Update lockfile ([3b8222b](https://github.com/unjs/jiti/commit/3b8222b))
- Prepare for rc ([ed32e11](https://github.com/unjs/jiti/commit/ed32e11))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Norbert De Langen <ndelangen@me.com>
- James Garbutt ([@43081j](http://github.com/43081j))
- Arya Emami ([@aryaemami59](http://github.com/aryaemami59))

## v2.0.0-beta.3

[compare changes](https://github.com/unjs/jiti/compare/v2.0.0-beta.2...v2.0.0-beta.3)

### 🚀 Enhancements

- Allow `try` and other resolve options for `import`/`esmResolve` ([#268](https://github.com/unjs/jiti/pull/268))
- Allow set `interopDefault` using `JITI_INTEROP_DEFAULT` env ([1c080a1](https://github.com/unjs/jiti/commit/1c080a1))

### 🔥 Performance

- Use native `createRequire` ([69da3c5](https://github.com/unjs/jiti/commit/69da3c5))

### 🩹 Fixes

- **cache:** Prefer `node_modules/.cache` if exists ([832f206](https://github.com/unjs/jiti/commit/832f206))
- Use native esm import for built-ins ([54d6b4a](https://github.com/unjs/jiti/commit/54d6b4a))
- Respect  `interopDefault` in babel transform ([485b4e9](https://github.com/unjs/jiti/commit/485b4e9))
- Split cache based on `interopDefault` ([f820a15](https://github.com/unjs/jiti/commit/f820a15))
- Remove ext from cache path ([50b1b3a](https://github.com/unjs/jiti/commit/50b1b3a))
- Proprly resolve `.mts`/`.cts` with `.mjs`/`.cjs` imports ([a5aefad](https://github.com/unjs/jiti/commit/a5aefad))
- **resolve:** Make sure parentURL is a dir ([d224e84](https://github.com/unjs/jiti/commit/d224e84))

### 💅 Refactors

- Improve debug logging ([463a8a3](https://github.com/unjs/jiti/commit/463a8a3))
- Rename `importResolve to `esmResolve` ([aac88e6](https://github.com/unjs/jiti/commit/aac88e6))
- Improve env handling ([ee4489d](https://github.com/unjs/jiti/commit/ee4489d))
- Use imporr/require in debug logs ([934a5bb](https://github.com/unjs/jiti/commit/934a5bb))

### 🏡 Chore

- Remove extra log ([483ced3](https://github.com/unjs/jiti/commit/483ced3))
- Update fixture ([e530242](https://github.com/unjs/jiti/commit/e530242))

### ✅ Tests

- Update snapshot ([3298489](https://github.com/unjs/jiti/commit/3298489))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v2.0.0-beta.2

[compare changes](https://github.com/unjs/jiti/compare/v2.0.0-beta.1...v2.0.0-beta.2)

### 🚀 Enhancements

- Add experimental esm loader support ([#266](https://github.com/unjs/jiti/pull/266))

### 🔥 Performance

- Reduce overhead of sub jiti instances ([#265](https://github.com/unjs/jiti/pull/265))

### 🩹 Fixes

- Resolve with esm conditions in async context ([#264](https://github.com/unjs/jiti/pull/264))

### 💅 Refactors

- Use more clear `fsCache` and `moduleCache` options ([#263](https://github.com/unjs/jiti/pull/263))
- Use esm imports for babel plugins ([22e259f](https://github.com/unjs/jiti/commit/22e259f))

### 📦 Build

- Overhaul lib exports ([#262](https://github.com/unjs/jiti/pull/262))
- Target es2020 ([c382c2f](https://github.com/unjs/jiti/commit/c382c2f))
- Target es2022 ([dbf0507](https://github.com/unjs/jiti/commit/dbf0507))

### 🏡 Chore

- Update readme ([8957f72](https://github.com/unjs/jiti/commit/8957f72))
- Remove unused deps ([e472f95](https://github.com/unjs/jiti/commit/e472f95))

### 🤖 CI

- Enable loader test ([#267](https://github.com/unjs/jiti/pull/267))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v2.0.0-beta.1

[compare changes](https://github.com/unjs/jiti/compare/v1.21.3...v2.0.0-beta.1)

### 🚀 Enhancements

- Basic top-level await support ([#239](https://github.com/unjs/jiti/pull/239))
- Native esm support ([#259](https://github.com/unjs/jiti/pull/259))

### 🩹 Fixes

- Use distinct cache paths for async mode ([6e8ec7a](https://github.com/unjs/jiti/commit/6e8ec7a))

### 💅 Refactors

- Split option normalization ([#172](https://github.com/unjs/jiti/pull/172))
- Split logic ([#240](https://github.com/unjs/jiti/pull/240))
- Remove legacy node syntax polyfills ([#260](https://github.com/unjs/jiti/pull/260))
- 3rd arg to createJiti is optional ([60a23e3](https://github.com/unjs/jiti/commit/60a23e3))
- Upgrade cache version to `8` ([99224ae](https://github.com/unjs/jiti/commit/99224ae))

### 📖 Documentation

- Update bundlephobia link ([#179](https://github.com/unjs/jiti/pull/179))

### 🏡 Chore

- Add v2 banner ([61a49a9](https://github.com/unjs/jiti/commit/61a49a9))
- Add `v1` to renovate branches ([38c38d2](https://github.com/unjs/jiti/commit/38c38d2))
- Update dependencies ([bd6b14b](https://github.com/unjs/jiti/commit/bd6b14b))
- Update to eslint v9 ([3c7740f](https://github.com/unjs/jiti/commit/3c7740f))
- Update deps and lockfile ([18fd99a](https://github.com/unjs/jiti/commit/18fd99a))
- Fix readme ([7746080](https://github.com/unjs/jiti/commit/7746080))
- Update docs ([73b29bb](https://github.com/unjs/jiti/commit/73b29bb))
- Update docs ([a1049a1](https://github.com/unjs/jiti/commit/a1049a1))
- Update docs ([0e0c70e](https://github.com/unjs/jiti/commit/0e0c70e))
- Update release script  prepare for v2 ([cdd61d9](https://github.com/unjs/jiti/commit/cdd61d9))
- Update package.json ([420f1fb](https://github.com/unjs/jiti/commit/420f1fb))
- Add webpack bundle analyzer ([a05dcdc](https://github.com/unjs/jiti/commit/a05dcdc))
- Fix type issue ([9a36d0e](https://github.com/unjs/jiti/commit/9a36d0e))

### 🤖 CI

- Enable nightly channel ([bfd4f46](https://github.com/unjs/jiti/commit/bfd4f46))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Lehoczky Zoltán ([@Lehoczky](http://github.com/Lehoczky))

## v1.21.3

[compare changes](https://github.com/unjs/jiti/compare/v1.21.2...v1.21.3)

### 🩹 Fixes

- Update mlly to ^1.7.1 ([9adbcb3](https://github.com/unjs/jiti/commit/9adbcb3))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v1.21.2

[compare changes](https://github.com/unjs/jiti/compare/v1.21.1...v1.21.2)

### 🩹 Fixes

- Pin mlly to 1.4.2 ([#237](https://github.com/unjs/jiti/pull/237))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v1.21.1

[compare changes](https://github.com/unjs/jiti/compare/v1.21.0...v1.21.1)

### 🏡 Chore

- Update dependencies ([0bd991b](https://github.com/unjs/jiti/commit/0bd991b))
- Update dependencies ([cfb106c](https://github.com/unjs/jiti/commit/cfb106c))
- Update to eslint v9 ([c11d953](https://github.com/unjs/jiti/commit/c11d953))
- Update deps and lockfile ([95aa249](https://github.com/unjs/jiti/commit/95aa249))
- Run ci against 18 and 22 ([65b4067](https://github.com/unjs/jiti/commit/65b4067))
- Lint ([6f3bd76](https://github.com/unjs/jiti/commit/6f3bd76))

### 🤖 CI

- Skip extra checks ([8fe6417](https://github.com/unjs/jiti/commit/8fe6417))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v1.21.0

[compare changes](https://github.com/unjs/jiti/compare/v1.20.0...v1.21.0)

### 🚀 Enhancements

- Add `jiti.import` function for async import ([#170](https://github.com/unjs/jiti/pull/170))
- Add forward compatible (stub) types for `jiti.import` ([#175](https://github.com/unjs/jiti/pull/175))

### 🏡 Chore

- Enable ci for `v1` branch ([0200f63](https://github.com/unjs/jiti/commit/0200f63))
- Add banner about v1 ([cc742cb](https://github.com/unjs/jiti/commit/cc742cb))
- Add `v1` to renovate branches ([2358645](https://github.com/unjs/jiti/commit/2358645))
- Update dependencies ([fe8b267](https://github.com/unjs/jiti/commit/fe8b267))
- Fix eslint warning ([c5c7220](https://github.com/unjs/jiti/commit/c5c7220))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Anthony Fu <anthonyfu117@hotmail.com>

## v1.20.0

[compare changes](https://github.com/unjs/jiti/compare/v1.19.3...v1.20.0)

### 🚀 Enhancements

- Experimental native bun support ([#156](https://github.com/unjs/jiti/pull/156))

### 💅 Refactors

- Replace proposal babel plugins with ecmascript transforms ([1fb4d8c](https://github.com/unjs/jiti/commit/1fb4d8c))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v1.19.3

[compare changes](https://github.com/unjs/jiti/compare/v1.19.2...v1.19.3)

### 🩹 Fixes

- Only replace `import.meta.env` ([c6895d6](https://github.com/unjs/jiti/commit/c6895d6))

### ❤️  Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v1.19.2

[compare changes](https://github.com/unjs/jiti/compare/v1.19.1...v1.19.2)

### 🩹 Fixes

- Pass custom extensions to esm resolver ([#152](https://github.com/unjs/jiti/pull/152))
- Support `import.meta.env` and `import.meta.env?.prop` ([#159](https://github.com/unjs/jiti/pull/159))

### 🏡 Chore

- Update dependencies ([09c1e7d](https://github.com/unjs/jiti/commit/09c1e7d))
- Add autofix ci ([670c1f2](https://github.com/unjs/jiti/commit/670c1f2))
- Update dependencies ([2325b70](https://github.com/unjs/jiti/commit/2325b70))
- Upgrade dependencies ([f18508c](https://github.com/unjs/jiti/commit/f18508c))

### ✅ Tests

- **typescript:** Remove type-only namespace access ([de73bd9](https://github.com/unjs/jiti/commit/de73bd9))

### 🎨 Styles

- Format with prettier v3 ([fe61c6e](https://github.com/unjs/jiti/commit/fe61c6e))
- Format report with prettier ([6098284](https://github.com/unjs/jiti/commit/6098284))

### ❤️  Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Anhao

## v1.19.1

[compare changes](https://github.com/unjs/jiti/compare/v1.19.0...v1.19.1)

### 🩹 Fixes

- Read cache from `evalOptions` ([2c1765e](https://github.com/unjs/jiti/commit/2c1765e))

### ❤️  Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

## v1.19.0

[compare changes](https://github.com/unjs/jiti/compare/v1.18.2...v1.19.0)

### 🚀 Enhancements

- Expose `jiti.evalModule` ([#146](https://github.com/unjs/jiti/pull/146))

### 🩹 Fixes

- Handle nested circular dependencies ([#142](https://github.com/unjs/jiti/pull/142))
- **types:** Export `JITIOptions` and `TreansformOptions` ([#132](https://github.com/unjs/jiti/pull/132))

### 📖 Documentation

- Update badges ([6124894](https://github.com/unjs/jiti/commit/6124894))

### 🏡 Chore

- Lint code ([fbd46e4](https://github.com/unjs/jiti/commit/fbd46e4))
- Update snapshots for node 18 ([c51f049](https://github.com/unjs/jiti/commit/c51f049))
- Update dependencies ([9aedf07](https://github.com/unjs/jiti/commit/9aedf07))
- Update destr import ([5b1c1ca](https://github.com/unjs/jiti/commit/5b1c1ca))
- Fix vitest ([c6798c6](https://github.com/unjs/jiti/commit/c6798c6))
- Speficy env types ([37e0692](https://github.com/unjs/jiti/commit/37e0692))
- Lint ([37b6b7a](https://github.com/unjs/jiti/commit/37b6b7a))
- Fix development in windows ([#135](https://github.com/unjs/jiti/pull/135))

### ✅ Tests

- Mask node version in snapshots ([64cf136](https://github.com/unjs/jiti/commit/64cf136))

### ❤️  Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Joaquín Sánchez ([@userquin](http://github.com/userquin))
- Sébastien Chopin <seb@nuxtjs.com>

## v1.18.2

[compare changes](https://github.com/unjs/jiti/compare/v1.17.2...v1.18.1)


### 🚀 Enhancements

  - Allow resolving `.ts` files with `.js` extension ([#128](https://github.com/unjs/jiti/pull/128))
  - Support `import.meta.env` ([#129](https://github.com/unjs/jiti/pull/129))

### 🔥 Performance

  - Use extension resolutions only for parent typescript files ([27a9888](https://github.com/unjs/jiti/commit/27a9888))

### 🩹 Fixes

  - Handle parretns with `c ([mts` extension too](https://github.com/unjs/jiti/commit/mts` extension too))

### 🏡 Chore

  - Update lockfile ([e91d3a1](https://github.com/unjs/jiti/commit/e91d3a1))

### ❤️  Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Db3f994 <Pooya Parsa>
- Guillaume Chau ([@Akryum](http://github.com/Akryum))

## v1.17.2

[compare changes](https://github.com/unjs/jiti/compare/v1.17.1...v1.17.2)


### 🩹 Fixes

  - Add support to emit decorator metadata ([#119](https://github.com/unjs/jiti/pull/119))
  - Use inline require cache to avoid circular dependencies ([#125](https://github.com/unjs/jiti/pull/125))
  - Workaround for pnpm and `TMPDIR` ([#123](https://github.com/unjs/jiti/pull/123))

### 🏡 Chore

  - Update lockfile ([6f8610f](https://github.com/unjs/jiti/commit/6f8610f))
  - Update release script ([26b7003](https://github.com/unjs/jiti/commit/26b7003))

### ✅ Tests

  - Add typescript satisfies fixture ([#107](https://github.com/unjs/jiti/pull/107))

### 🎨 Styles

  - Format with prettier ([42669e5](https://github.com/unjs/jiti/commit/42669e5))

### ❤️  Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))
- Jonas Thelemann ([@dargmuesli](http://github.com/dargmuesli))
- Sabin Marcu ([@sabinmarcu](http://github.com/sabinmarcu))
- Peter <peter.placzek1996@gmail.com>

## v1.17.1

[compare changes](https://github.com/unjs/jiti/compare/v1.17.0...v1.17.1)


### 🩹 Fixes

  - Prefer `require` condition first in esm resolve mode ([#117](https://github.com/unjs/jiti/pull/117))

### 💅 Refactors

  - Use `mkdirSync` from `node:fs` instead of `mkdirp` ([413d3c3](https://github.com/unjs/jiti/commit/413d3c3))

### 🏡 Chore

  - Update dependencies ([f532c57](https://github.com/unjs/jiti/commit/f532c57))
  - Add missing semi ([a9c2876](https://github.com/unjs/jiti/commit/a9c2876))
  - Switch to changelogen for releases ([bd4bd8c](https://github.com/unjs/jiti/commit/bd4bd8c))

### ❤️  Contributors

- Pooya Parsa <pooya@pi0.io>

## [1.17.0](https://github.com/unjs/jiti/compare/v1.16.2...v1.17.0) (2023-02-08)


### Features

* add support for `.mts` ([#112](https://github.com/unjs/jiti/issues/112)) ([94ab3f2](https://github.com/unjs/jiti/commit/94ab3f2bb03e5805ff97927579a1729e6eeaa8e5))
* support import assertions and `.json` imports with `.default` property ([#114](https://github.com/unjs/jiti/issues/114)) ([08a9a47](https://github.com/unjs/jiti/commit/08a9a47daa6ba0fb0f2ced285703dcc446ef8375))

### [1.16.2](https://github.com/unjs/jiti/compare/v1.16.1...v1.16.2) (2023-01-10)

### [1.16.1](https://github.com/unjs/jiti/compare/v1.16.0...v1.16.1) (2023-01-03)

## [1.16.0](https://github.com/unjs/jiti/compare/v1.15.0...v1.16.0) (2022-09-19)


### Features

* support export namespace from syntax (resolves [#84](https://github.com/unjs/jiti/issues/84)) ([ebb59cf](https://github.com/unjs/jiti/commit/ebb59cf96c9d9809fc7e81f708028d0861fd329e))


### Bug Fixes

* **deps:** update pathe ([6231320](https://github.com/unjs/jiti/commit/623132069d90520af2227e9fd851e8d728281ef4))

## [1.15.0](https://github.com/unjs/jiti/compare/v1.14.0...v1.15.0) (2022-09-06)


### Features

* basic alias support (resolves [#37](https://github.com/unjs/jiti/issues/37)) ([cab50cc](https://github.com/unjs/jiti/commit/cab50cc0ebba4934c010857241d7cc72e151fd86))
* options for `nativeModules` and `transformModules` ([64151af](https://github.com/unjs/jiti/commit/64151afdda6543173615574ba8c44c893fb411e5))


### Bug Fixes

* manually exclude `typescript` from transpilation ([dbd3f22](https://github.com/unjs/jiti/commit/dbd3f220feabe148d64088fd2d0106672bca96f2))
* use pathe for path resolution ([000c6ad](https://github.com/unjs/jiti/commit/000c6ade6b8071d4144a702ea026b56800ef6b08)), closes [#74](https://github.com/unjs/jiti/issues/74)

## [1.14.0](https://github.com/unjs/jiti/compare/v1.13.0...v1.14.0) (2022-06-20)


### Features

* detect native esm using `type: module` ([#67](https://github.com/unjs/jiti/issues/67)) ([986f146](https://github.com/unjs/jiti/commit/986f146eed92ef1f7e469b35be012223ffcd62a3))


### Bug Fixes

* use inlined import meta plugin to inject url ([#68](https://github.com/unjs/jiti/issues/68)) ([b52bb17](https://github.com/unjs/jiti/commit/b52bb173be67bda83c3723ef46ebce64559e2797))

## [1.13.0](https://github.com/unjs/jiti/compare/v1.12.15...v1.13.0) (2022-02-18)


### Features

* support inline sourceMaps for easier debugging ([#46](https://github.com/unjs/jiti/issues/46)) ([888db00](https://github.com/unjs/jiti/commit/888db0075f0c71b643f7d63a6a0f31cae66e6ff9))


### Bug Fixes

* use backslash to make import maps working in windows ([e8696c7](https://github.com/unjs/jiti/commit/e8696c7edd2f8f58d3bf7835bd2eb04498880833))

### [1.12.15](https://github.com/unjs/jiti/compare/v1.12.14...v1.12.15) (2022-01-28)


### Bug Fixes

* force transpile `config` package ([2ddcb8a](https://github.com/unjs/jiti/commit/2ddcb8a7be24d051cc0edf8d00ac3568858b54b2)), closes [#56](https://github.com/unjs/jiti/issues/56)

### [1.12.14](https://github.com/unjs/jiti/compare/v1.12.13...v1.12.14) (2022-01-26)


### Bug Fixes

* move esm resolve behind a flag ([60e094c](https://github.com/unjs/jiti/commit/60e094c63ceadc3c63313f14b1d60bcd719faab6))

### [1.12.13](https://github.com/unjs/jiti/compare/v1.12.12...v1.12.13) (2022-01-25)

### [1.12.12](https://github.com/unjs/jiti/compare/v1.12.11...v1.12.12) (2022-01-25)


### Bug Fixes

* ensure resolve esm id exists ([2d44274](https://github.com/unjs/jiti/commit/2d4427488625acc42dfc517eacf14e70f1aaaf30))

### [1.12.11](https://github.com/unjs/jiti/compare/v1.12.10...v1.12.11) (2022-01-25)


### Bug Fixes

* default _filename if null or falsy value passed ([1a24f2a](https://github.com/unjs/jiti/commit/1a24f2ac686f5ebc3802711a4dc83e52f7b3d963))
* **pkg:** do not mangle dist build ([3b456e1](https://github.com/unjs/jiti/commit/3b456e1be6a672c29ee47ebed594da14d42cb73d))

### [1.12.10](https://github.com/unjs/jiti/compare/v1.12.9...v1.12.10) (2022-01-25)


### Bug Fixes

* support resolving with import condition ([#52](https://github.com/unjs/jiti/issues/52)) ([1e1bb0c](https://github.com/unjs/jiti/commit/1e1bb0c99236841d8318d5c24de99d90ffd030be))

### [1.12.9](https://github.com/unjs/jiti/compare/v1.12.8...v1.12.9) (2021-10-18)


### Bug Fixes

* inline `mlly.interopDefault` (resolves [#48](https://github.com/unjs/jiti/issues/48)) ([32e606f](https://github.com/unjs/jiti/commit/32e606fef722f06f428058ad34ed40d1081bd3e4))

### [1.12.8](https://github.com/unjs/jiti/compare/v1.12.7...v1.12.8) (2021-10-18)


### Bug Fixes

* update mlly to latest ([cf178ce](https://github.com/unjs/jiti/commit/cf178ce40615a7bf1438f22bf396809c3d181d3c))

### [1.12.7](https://github.com/unjs/jiti/compare/v1.12.6...v1.12.7) (2021-10-12)

### [1.12.6](https://github.com/unjs/jiti/compare/v1.12.5...v1.12.6) (2021-10-02)


### Bug Fixes

* avoid detecting dynamic import as esm syntax ([0b904a9](https://github.com/unjs/jiti/commit/0b904a9a756533e2ca77f17847c4e8cbf794f668))

### [1.12.5](https://github.com/unjs/jiti/compare/v1.12.4...v1.12.5) (2021-09-29)


### Bug Fixes

* remove dynamicImport from options ([ad42dd1](https://github.com/unjs/jiti/commit/ad42dd125617a48bea77866cd23fc8eee789ffc4))

### [1.12.4](https://github.com/unjs/jiti/compare/v1.12.3...v1.12.4) (2021-09-29)


### Bug Fixes

* remove v8-compile-cache integration ([a9fe3a0](https://github.com/unjs/jiti/commit/a9fe3a0368594fa1b4827e981f2347ebc82b4700))

### [1.12.3](https://github.com/unjs/jiti/compare/v1.12.2...v1.12.3) (2021-09-21)


### Bug Fixes

* **interopDefault:** allow recursive default ([55e0f62](https://github.com/unjs/jiti/commit/55e0f62ae16d2c4d1c05659692bf67211d9cd64d))

### [1.12.2](https://github.com/unjs/jiti/compare/v1.12.1...v1.12.2) (2021-09-21)


### Bug Fixes

* **interopDefault:** handle cjs cache ([1f3e4c3](https://github.com/unjs/jiti/commit/1f3e4c3ac4c8184941f618e698b68f009983ef0e))

### [1.12.1](https://github.com/unjs/jiti/compare/v1.12.0...v1.12.1) (2021-09-21)


### Bug Fixes

* **interopDefault:** support mixed CJS + default ([4392c6a](https://github.com/unjs/jiti/commit/4392c6ac5c6571f1981934456b3635970f7c22a4))

## [1.12.0](https://github.com/unjs/jiti/compare/v1.11.0...v1.12.0) (2021-09-13)


### Features

* add v8cache option ([#39](https://github.com/unjs/jiti/issues/39)) ([ffdd372](https://github.com/unjs/jiti/commit/ffdd3729526b8688ff4a5ed2a4ea3ab9e23493cc))

## [1.11.0](https://github.com/unjs/jiti/compare/v1.10.1...v1.11.0) (2021-07-26)


### Features

* support `node:` and `file:` protocols ([bbb1cb3](https://github.com/unjs/jiti/commit/bbb1cb3249ee78ea200537969675d96ad4ef34a6)), closes [#30](https://github.com/unjs/jiti/issues/30)
* support mjs and cjs extensions ([369c3ff](https://github.com/unjs/jiti/commit/369c3ffba4ce595516f6bc3541a3c5d7cf340ccc))

### [1.10.1](https://github.com/unjs/jiti/compare/v1.10.0...v1.10.1) (2021-05-28)


### Bug Fixes

* **babel:** properly pass plugin-transform-typescript options ([7a1ae3b](https://github.com/unjs/jiti/commit/7a1ae3be90589516840dbfeb27a64903ae121033))

## [1.10.0](https://github.com/unjs/jiti/compare/v1.9.2...v1.10.0) (2021-05-28)


### Features

* enable `allowDeclareFields` for babel transform ([#33](https://github.com/unjs/jiti/issues/33)) ([914499c](https://github.com/unjs/jiti/commit/914499cd58a21ea88eae44f7e1dc830b33e33644))

### [1.9.2](https://github.com/unjs/jiti/compare/v1.9.1...v1.9.2) (2021-05-11)


### Bug Fixes

* spread when pushing babel plugins from transformOptions ([#31](https://github.com/unjs/jiti/issues/31)) ([f25960a](https://github.com/unjs/jiti/commit/f25960af1111401fd1ce2a094bb42e0e868341e9))

### [1.9.1](https://github.com/unjs/jiti/compare/v1.9.0...v1.9.1) (2021-04-09)

## [1.9.0](https://github.com/unjs/jiti/compare/v1.8.0...v1.9.0) (2021-04-09)


### Features

* interopDefault option (opt-in) ([5203145](https://github.com/unjs/jiti/commit/5203145b0f6638f141510770301de1c00a69198a))

## [1.8.0](https://github.com/unjs/jiti/compare/v1.7.0...v1.8.0) (2021-04-09)


### Features

* requireCache ([490e1d0](https://github.com/unjs/jiti/commit/490e1d069d9d5146eb32820a8982b8e72b7de71e))
* transformOptions ([0066a8d](https://github.com/unjs/jiti/commit/0066a8d13993eba39c543772151feae4117f89e4))

## [1.7.0](https://github.com/unjs/jiti/compare/v1.6.4...v1.7.0) (2021-04-09)


### Features

* support legacy decorators for typescript ([#28](https://github.com/unjs/jiti/issues/28)) ([801b798](https://github.com/unjs/jiti/commit/801b79835978876b604a4a53b6abbe9054564e15)), closes [#27](https://github.com/unjs/jiti/issues/27)
* support legacy parameter decorators for typescript ([#29](https://github.com/unjs/jiti/issues/29)) ([6586a1c](https://github.com/unjs/jiti/commit/6586a1c1852719176be2619f642caaf1821059d9))

### [1.6.4](https://github.com/unjs/jiti/compare/v1.6.3...v1.6.4) (2021-03-11)


### Bug Fixes

* exclude `.pnp.js` from transpiling (resolves [#24](https://github.com/unjs/jiti/issues/24)) ([0280b58](https://github.com/unjs/jiti/commit/0280b588018cc0933733bee842f538b851f5689c))
* skip unknown guard if input has not ext (resolves [#17](https://github.com/unjs/jiti/issues/17)) ([afe6706](https://github.com/unjs/jiti/commit/afe67069b1681be8768aff07ff294f3bdbf095b4))
* **babel:** always add class syntax plugin ([c0098fe](https://github.com/unjs/jiti/commit/c0098fec5e6bcc991e0203a456f88a23803737f0)), closes [#23](https://github.com/unjs/jiti/issues/23)
* update require cache children ([ce3b084](https://github.com/unjs/jiti/commit/ce3b0845d7aa1dabf9e6caf7e285ddc5fbd01e31)), closes [nuxt/nuxt.js#8976](https://github.com/nuxt/nuxt.js/issues/8976)

### [1.6.3](https://github.com/unjs/jiti/compare/v1.6.2...v1.6.3) (2021-03-06)


### Bug Fixes

* disable transform cache if no filename provided ([69113bc](https://github.com/unjs/jiti/commit/69113bcf6482c601aedaed63f66a7cdc91ec353c)), closes [unjsio/mkdist#3](https://github.com/unjsio/mkdist/issues/3)

### [1.6.2](https://github.com/unjs/jiti/compare/v1.6.1...v1.6.2) (2021-03-05)


### Bug Fixes

* support class property syntax for esm ([64b1636](https://github.com/unjs/jiti/commit/64b16368833fbb10f92343b1a057830a4b545281))

### [1.6.1](https://github.com/unjs/jiti/compare/v1.6.0...v1.6.1) (2021-03-05)


### Bug Fixes

* stub @babel/helper-compilation-targets to ignore browserslist in package.json ([af8fedc](https://github.com/unjs/jiti/commit/af8fedc57fbe742c219d41c42a84e5df91e97f13)), closes [nuxt/nuxt.js#8916](https://github.com/nuxt/nuxt.js/issues/8916)

## [1.6.0](https://github.com/unjs/jiti/compare/v1.5.0...v1.6.0) (2021-03-03)


### Features

* transpile import.meta.url (resolves [#21](https://github.com/unjs/jiti/issues/21)) ([d071704](https://github.com/unjs/jiti/commit/d07170452837cd28a93d205786b1e28de4bd8d04))


### Bug Fixes

* support hashbang (closes [#18](https://github.com/unjs/jiti/issues/18)) ([6a1f816](https://github.com/unjs/jiti/commit/6a1f81626d9428ce3aa0c46f94f3d10c79c7dd08))

## [1.5.0](https://github.com/unjs/jiti/compare/v1.4.0...v1.5.0) (2021-03-03)


### Features

* `extensions` option (fixes mjs handling) ([3804b3c](https://github.com/unjs/jiti/commit/3804b3c2e5086dad0bc1feb0518579d4d5b10c6a))


### Bug Fixes

* don't cache errors ([8a7f881](https://github.com/unjs/jiti/commit/8a7f8813e21586160530b99a43c36e3dcfc76e64)), closes [nuxt/nuxt.js#8916](https://github.com/nuxt/nuxt.js/issues/8916)
* fix issues with dynamic import ([e318cf5](https://github.com/unjs/jiti/commit/e318cf511bb787ad4ad3fd4e64301cc1be1d701a))

## [1.4.0](https://github.com/unjs/jiti/compare/v1.3.0...v1.4.0) (2021-03-01)


### Features

* transpile nullish-coalescing-operator and optional-chaining for node<14 ([6011ef5](https://github.com/unjs/jiti/commit/6011ef5e83653a30730bc33e5c628f6cafe5b411))

## [1.3.0](https://github.com/unjs/jiti/compare/v1.2.1...v1.3.0) (2021-01-21)


### Features

* support node register hook ([#15](https://github.com/unjs/jiti/issues/15)) ([f5127cb](https://github.com/unjs/jiti/commit/f5127cb2726bb8957323d413fef45aa5a2e275ae))

### [1.2.1](https://github.com/unjs/jiti/compare/v1.2.0...v1.2.1) (2021-01-20)


### Bug Fixes

* improve extension handling for unknown formats ([a2a797d](https://github.com/unjs/jiti/commit/a2a797db2b86faf76a3b997c31af18d08f8bec71))
* use dynamic import => cjs only if native dynamic import is not possible ([5323175](https://github.com/unjs/jiti/commit/53231756883637e0736d2fce039206d8dd8d0dcb))

## [1.2.0](https://github.com/unjs/jiti/compare/v1.1.0...v1.2.0) (2021-01-14)


### Features

* expose transform ([6b1ab5e](https://github.com/unjs/jiti/commit/6b1ab5eae6d396e12579f0d84da0cbca41a08c0f))

## [1.1.0](https://github.com/unjs/jiti/compare/v1.0.0...v1.1.0) (2021-01-13)


### Features

* support mixed sytax via esm fallback ([1e642e4](https://github.com/unjs/jiti/commit/1e642e42ddf12669896f4ac9049d5a4d5bd9bf8c))


### Bug Fixes

* consistantly use tmpdir as cache dir ([e49a791](https://github.com/unjs/jiti/commit/e49a791dc83a0b02ccc4e24842633eb395f55643))

## [1.0.0](https://github.com/unjs/jiti/compare/v0.1.20...v1.0.0) (2021-01-12)

### [0.1.20](https://github.com/unjs/jiti/compare/v0.1.19...v0.1.20) (2021-01-12)


### Bug Fixes

* resolve with index.{ts,mjs} ([2fe1846](https://github.com/unjs/jiti/commit/2fe184690897c7f5e02456fecaf6a94099fd75e2))

### [0.1.19](https://github.com/unjs/jiti/compare/v0.1.18...v0.1.19) (2020-12-30)


### Features

* improved parse and runtime error stack trace ([9d94ca1](https://github.com/unjs/jiti/commit/9d94ca1c5b5e1f2aa6d5dafcf5361dfcdd6f38c5))


### Bug Fixes

* remove duplicate v8-compile-cache ([#13](https://github.com/unjs/jiti/issues/13)) ([3f81fc9](https://github.com/unjs/jiti/commit/3f81fc9cf4e560a624a6d8bd3a98f0fc5de0f4cc))

### [0.1.18](https://github.com/unjs/jiti/compare/v0.1.17...v0.1.18) (2020-12-22)


### Features

* use native require for resolving ([f7e1a56](https://github.com/unjs/jiti/commit/f7e1a5685c14b979cb1a6dd5fbe724ee3a0b2c13))


### Bug Fixes

* support circular dependency (closes [#12](https://github.com/unjs/jiti/issues/12)) ([06c687f](https://github.com/unjs/jiti/commit/06c687f180b1fe43e4e58b15e06389a589b8a2bc))

### [0.1.17](https://github.com/unjs/jiti/compare/v0.1.16...v0.1.17) (2020-11-27)


### Features

* use native import for mjs files ([#10](https://github.com/unjs/jiti/issues/10)) ([da34753](https://github.com/unjs/jiti/commit/da34753d54e4bc726bb354dcbd77b4f3d7f7e0a0))


### Bug Fixes

* **cli:** resolve relative to cwd ([52a4c12](https://github.com/unjs/jiti/commit/52a4c124bc649b366d481cbe6463537b245ad4d1))

### [0.1.16](https://github.com/unjs/jiti/compare/v0.1.15...v0.1.16) (2020-11-23)


### Features

* fallback to tmpdir and then disable if cache dir is not writable ([398fe08](https://github.com/unjs/jiti/commit/398fe08ef06fa873a63ea280d8a408abca8ece04))
* support JITI_DEBUG ands JITI_CACHE environment variables ([eed965d](https://github.com/unjs/jiti/commit/eed965dd05c83adac83c7bb2d84eb91098381c52))

### [0.1.15](https://github.com/unjs/jiti/compare/v0.1.14...v0.1.15) (2020-11-22)


### Features

* basic support for dynamic imports ([9494452](https://github.com/unjs/jiti/commit/94944520734b5d7f3bc2cf38c4a3454835201e2f))

### [0.1.14](https://github.com/unjs/jiti/compare/v0.1.13...v0.1.14) (2020-11-21)


### Bug Fixes

* **cli:** import main wrapper ([25bceb1](https://github.com/unjs/jiti/commit/25bceb173a966beaf315df58400ee59a61441f84))

### [0.1.13](https://github.com/unjs/jiti/compare/v0.1.12...v0.1.13) (2020-11-21)


### Features

* basic cli ([b028046](https://github.com/unjs/jiti/commit/b0280469e7002b28ea159fb6f1f3b744a198e141))

### [0.1.12](https://github.com/unjs/jiti/compare/v0.1.11...v0.1.12) (2020-11-01)


### Bug Fixes

* directly call wrapper to fix require.resolve issue ([63c0a5c](https://github.com/unjs/jiti/commit/63c0a5c9d1cf6d9bd5efae63798323ef602af978))

### [0.1.11](https://github.com/unjs/jiti/compare/v0.1.10...v0.1.11) (2020-06-19)


### Features

* interopDefault ([44117ef](https://github.com/unjs/jiti/commit/44117ef88f712b37bfe0a72181b76fa1a3f374c1))

### [0.1.10](https://github.com/unjs/jiti/compare/v0.1.9...v0.1.10) (2020-06-19)


### Bug Fixes

* always ensure isDir for filename ([6b343a4](https://github.com/unjs/jiti/commit/6b343a4fb9d7fe63628f53647d443d98b92217b6))

### [0.1.9](https://github.com/unjs/jiti/compare/v0.1.8...v0.1.9) (2020-06-12)


### Bug Fixes

* typo in main field  ([#4](https://github.com/unjs/jiti/issues/4)) ([c57ea02](https://github.com/unjs/jiti/commit/c57ea023635825cc929b3581b5d60c58d35a6e7a))

### [0.1.8](https://github.com/unjs/jiti/compare/v0.1.7...v0.1.8) (2020-06-12)


### Bug Fixes

* use fake file for default _filename ([05d721f](https://github.com/unjs/jiti/commit/05d721faa6426cb0b2d0e1262059de4c9eb4015c))
* **types:** allow passing undefined filename ([#2](https://github.com/unjs/jiti/issues/2)) ([9136f15](https://github.com/unjs/jiti/commit/9136f15dd3f9e56e192945e849a9db6c4df6bccd))

### [0.1.7](https://github.com/unjs/jiti/compare/v0.1.6...v0.1.7) (2020-06-11)


### Bug Fixes

* **pkg:** add repository field ([639c02f](https://github.com/unjs/jiti/commit/639c02fb4e7f0a117b25e968e44e3b664c4eb7d9))

### [0.1.6](https://github.com/unjs/jiti/compare/v0.1.5...v0.1.6) (2020-06-11)


### Features

* cache support ([65c2de2](https://github.com/unjs/jiti/commit/65c2de207147793d984d871f495af55e75b58768))

### [0.1.5](https://github.com/unjs/jiti/compare/v0.1.4...v0.1.5) (2020-06-11)


### Features

* allow passign debug as jiti options ([8da2310](https://github.com/unjs/jiti/commit/8da2310c6b27a2b0fac2276d462c65b0c6f2b0a8))
* build and stack-trace improvements ([71780ab](https://github.com/unjs/jiti/commit/71780ab15d8cb843323c3edcc3e55a2a5928e72e))
* improve babel transpile and debug ([f3042dc](https://github.com/unjs/jiti/commit/f3042dcf116b309090de552d27cd8103bc7f1001))

### [0.1.4](https://github.com/unjs/jiti/compare/v0.1.3...v0.1.4) (2020-06-11)


### Features

* improve babel options ([ae4dc58](https://github.com/unjs/jiti/commit/ae4dc58ab994419489c4599c04c3444a34ba6215))


### Bug Fixes

* multiline syntax detection ([46f830b](https://github.com/unjs/jiti/commit/46f830b7333b4ed9d5377cae9afe967c96dac071))

### [0.1.3](https://github.com/unjs/jiti/compare/v0.1.2...v0.1.3) (2020-06-07)

### [0.1.2](https://github.com/unjs/jiti/compare/v0.1.1...v0.1.2) (2020-06-07)


### Features

* improve build system and stability ([5c3ee63](https://github.com/unjs/jiti/commit/5c3ee63bc32c0609f32605cfb2b472afdff97648))
