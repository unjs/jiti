# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.1.20](https://github.com/nuxt-contrib/jiti/compare/v0.1.19...v0.1.20) (2021-01-12)


### Bug Fixes

* resolve with index.{ts,mjs} ([2fe1846](https://github.com/nuxt-contrib/jiti/commit/2fe184690897c7f5e02456fecaf6a94099fd75e2))

### [0.1.19](https://github.com/nuxt-contrib/jiti/compare/v0.1.18...v0.1.19) (2020-12-30)


### Features

* improved parse and runtime error stack trace ([9d94ca1](https://github.com/nuxt-contrib/jiti/commit/9d94ca1c5b5e1f2aa6d5dafcf5361dfcdd6f38c5))


### Bug Fixes

* remove duplicate v8-compile-cache ([#13](https://github.com/nuxt-contrib/jiti/issues/13)) ([3f81fc9](https://github.com/nuxt-contrib/jiti/commit/3f81fc9cf4e560a624a6d8bd3a98f0fc5de0f4cc))

### [0.1.18](https://github.com/nuxt-contrib/jiti/compare/v0.1.17...v0.1.18) (2020-12-22)


### Features

* use native require for resolving ([f7e1a56](https://github.com/nuxt-contrib/jiti/commit/f7e1a5685c14b979cb1a6dd5fbe724ee3a0b2c13))


### Bug Fixes

* support circular dependency (closes [#12](https://github.com/nuxt-contrib/jiti/issues/12)) ([06c687f](https://github.com/nuxt-contrib/jiti/commit/06c687f180b1fe43e4e58b15e06389a589b8a2bc))

### [0.1.17](https://github.com/nuxt-contrib/jiti/compare/v0.1.16...v0.1.17) (2020-11-27)


### Features

* use native import for mjs files ([#10](https://github.com/nuxt-contrib/jiti/issues/10)) ([da34753](https://github.com/nuxt-contrib/jiti/commit/da34753d54e4bc726bb354dcbd77b4f3d7f7e0a0))


### Bug Fixes

* **cli:** resolve relative to cwd ([52a4c12](https://github.com/nuxt-contrib/jiti/commit/52a4c124bc649b366d481cbe6463537b245ad4d1))

### [0.1.16](https://github.com/nuxt-contrib/jiti/compare/v0.1.15...v0.1.16) (2020-11-23)


### Features

* fallback to tmpdir and then disable if cache dir is not writable ([398fe08](https://github.com/nuxt-contrib/jiti/commit/398fe08ef06fa873a63ea280d8a408abca8ece04))
* support JITI_DEBUG ands JITI_CACHE environment variables ([eed965d](https://github.com/nuxt-contrib/jiti/commit/eed965dd05c83adac83c7bb2d84eb91098381c52))

### [0.1.15](https://github.com/nuxt-contrib/jiti/compare/v0.1.14...v0.1.15) (2020-11-22)


### Features

* basic support for dynamic imports ([9494452](https://github.com/nuxt-contrib/jiti/commit/94944520734b5d7f3bc2cf38c4a3454835201e2f))

### [0.1.14](https://github.com/nuxt-contrib/jiti/compare/v0.1.13...v0.1.14) (2020-11-21)


### Bug Fixes

* **cli:** import main wrapper ([25bceb1](https://github.com/nuxt-contrib/jiti/commit/25bceb173a966beaf315df58400ee59a61441f84))

### [0.1.13](https://github.com/nuxt-contrib/jiti/compare/v0.1.12...v0.1.13) (2020-11-21)


### Features

* basic cli ([b028046](https://github.com/nuxt-contrib/jiti/commit/b0280469e7002b28ea159fb6f1f3b744a198e141))

### [0.1.12](https://github.com/nuxt-contrib/jiti/compare/v0.1.11...v0.1.12) (2020-11-01)


### Bug Fixes

* directly call wrapper to fix require.resolve issue ([63c0a5c](https://github.com/nuxt-contrib/jiti/commit/63c0a5c9d1cf6d9bd5efae63798323ef602af978))

### [0.1.11](https://github.com/nuxt-contrib/jiti/compare/v0.1.10...v0.1.11) (2020-06-19)


### Features

* interopDefault ([44117ef](https://github.com/nuxt-contrib/jiti/commit/44117ef88f712b37bfe0a72181b76fa1a3f374c1))

### [0.1.10](https://github.com/nuxt-contrib/jiti/compare/v0.1.9...v0.1.10) (2020-06-19)


### Bug Fixes

* always ensure isDir for filename ([6b343a4](https://github.com/nuxt-contrib/jiti/commit/6b343a4fb9d7fe63628f53647d443d98b92217b6))

### [0.1.9](https://github.com/nuxt-contrib/jiti/compare/v0.1.8...v0.1.9) (2020-06-12)


### Bug Fixes

* typo in main field  ([#4](https://github.com/nuxt-contrib/jiti/issues/4)) ([c57ea02](https://github.com/nuxt-contrib/jiti/commit/c57ea023635825cc929b3581b5d60c58d35a6e7a))

### [0.1.8](https://github.com/nuxt-contrib/jiti/compare/v0.1.7...v0.1.8) (2020-06-12)


### Bug Fixes

* use fake file for default _filename ([05d721f](https://github.com/nuxt-contrib/jiti/commit/05d721faa6426cb0b2d0e1262059de4c9eb4015c))
* **types:** allow passing undefined filename ([#2](https://github.com/nuxt-contrib/jiti/issues/2)) ([9136f15](https://github.com/nuxt-contrib/jiti/commit/9136f15dd3f9e56e192945e849a9db6c4df6bccd))

### [0.1.7](https://github.com/nuxt-contrib/jiti/compare/v0.1.6...v0.1.7) (2020-06-11)


### Bug Fixes

* **pkg:** add repository field ([639c02f](https://github.com/nuxt-contrib/jiti/commit/639c02fb4e7f0a117b25e968e44e3b664c4eb7d9))

### [0.1.6](https://github.com/nuxt-contrib/jiti/compare/v0.1.5...v0.1.6) (2020-06-11)


### Features

* cache support ([65c2de2](https://github.com/nuxt-contrib/jiti/commit/65c2de207147793d984d871f495af55e75b58768))

### [0.1.5](https://github.com/nuxt-contrib/jiti/compare/v0.1.4...v0.1.5) (2020-06-11)


### Features

* allow passign debug as jiti options ([8da2310](https://github.com/nuxt-contrib/jiti/commit/8da2310c6b27a2b0fac2276d462c65b0c6f2b0a8))
* build and stack-trace improvements ([71780ab](https://github.com/nuxt-contrib/jiti/commit/71780ab15d8cb843323c3edcc3e55a2a5928e72e))
* improve babel transpile and debug ([f3042dc](https://github.com/nuxt-contrib/jiti/commit/f3042dcf116b309090de552d27cd8103bc7f1001))

### [0.1.4](https://github.com/nuxt-contrib/jiti/compare/v0.1.3...v0.1.4) (2020-06-11)


### Features

* improve babel options ([ae4dc58](https://github.com/nuxt-contrib/jiti/commit/ae4dc58ab994419489c4599c04c3444a34ba6215))


### Bug Fixes

* multiline syntax detection ([46f830b](https://github.com/nuxt-contrib/jiti/commit/46f830b7333b4ed9d5377cae9afe967c96dac071))

### [0.1.3](https://github.com/nuxt-contrib/jiti/compare/v0.1.2...v0.1.3) (2020-06-07)

### [0.1.2](https://github.com/nuxt-contrib/jiti/compare/v0.1.1...v0.1.2) (2020-06-07)


### Features

* improve build system and stability ([5c3ee63](https://github.com/nuxt-contrib/jiti/commit/5c3ee63bc32c0609f32605cfb2b472afdff97648))
