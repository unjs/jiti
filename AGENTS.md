## Overview

**jiti** (`unjs/jiti`) — Runtime TypeScript and ESM support for Node.js.

Zero-dependency, slim runtime that provides seamless TypeScript/ESM/CJS interop.
All dependencies (including Babel) are bundled into the dist output — the published package has zero runtime dependencies.
Used by Nuxt, Tailwind, ESLint, Docusaurus, and 300M+ monthly npm downloads.

> [!IMPORTANT]
> Keep `AGENTS.md` updated with project status.

## Architecture

### Source (`src/`) ~1300 LoC total

| File | Purpose |
|------|---------|
| `jiti.ts` | Main entry — `createJiti()` factory, configures options and returns jiti instance |
| `eval.ts` | Evaluates transformed code (both sync `require` and async `import`) |
| `require.ts` | Sync `require()` replacement with CJS/ESM interop |
| `resolve.ts` | Module resolution with alias support |
| `transform.ts` | Orchestrates Babel transformation |
| `babel.ts` | Babel config and plugin setup (TypeScript, JSX, decorators, etc.) |
| `cache.ts` | Filesystem transpile cache with etag-based invalidation |
| `options.ts` | Options normalization and defaults |
| `utils.ts` | Helpers (debug logging, readFile, interopDefault proxy, etc.) |
| `types.ts` | Core type definitions |
| `plugins/` | Babel plugins for `import.meta.env`, `import.meta.url/dirname/filename`, `import.meta.resolve` |

### Build

- **Bundler**: rspack (`rspack.config.mjs`) — bundles `src/` → `dist/jiti.cjs` + `dist/babel.cjs`
- Babel is lazy-loaded from `dist/babel.cjs` only when transformation is needed
- `lib/` contains thin ESM/CJS wrappers, CLI, register hook, and type declarations (not bundled, shipped as-is)

### Exports

- `jiti` (main) — CJS + ESM dual export
- `jiti/register` — Node.js ESM loader hook (`--import jiti/register`)
- `jiti/native` — Uses Node.js native `--experimental-strip-types` when available
- `jiti` CLI binary — `lib/jiti-cli.mjs`

## Testing

- **Framework**: vitest (`vitest.config.ts`)
- **Main test**: `test/fixtures.test.ts` — runs each fixture in `test/fixtures/` via jiti
- **Other tests**: `test/utils.test.ts`, `test/node-register.test.mjs`, `test/bun.test.ts`
- **Native runtime tests**: `test/native/` (node, bun, deno)
- **Snapshots**: `test/__snapshots__/`

### Running tests

```bash
# Single test file (preferred)
pnpm vitest run test/fixtures.test.ts

# Node register test
pnpm test:node-register

# Native runtime tests
pnpm test:native:node
pnpm test:native:bun
pnpm test:native:deno

# Full suite
pnpm test
```

## Key Commands

```bash
pnpm build          # Clean + rspack bundle
pnpm dev            # Watch mode
pnpm lint           # ESLint + Prettier
pnpm lint:fix       # Auto-fix
pnpm test           # Full test suite (lint + types + vitest + register + bun + native)
pnpm test:types     # tsgo --noEmit
```

## Fixtures

Test fixtures in `test/fixtures/<name>/` each have an `index.ts` (or similar entry).
The fixture test runner executes them via jiti and snapshots stdout.

## Notes

- Package manager: pnpm
- Node version: see `.nvmrc`
- Type checking uses `tsgo` (TypeScript native preview)
- Babel plugins are bundled into `dist/babel.cjs` and lazy-loaded
- `stubs/` provides lightweight shims for heavy Babel packages to reduce bundle size
