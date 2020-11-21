#!/usr/bin/env node

const script = process.argv.splice(2, 1)[0]

if (!script) {
  // eslint-disable-next-line no-console
  console.error('Usage: jiti <path> [...arguments]')
  process.exit(1)
}

const jiti = require('../dist/jiti')(process.cwd())
const resolved = process.argv[1] = jiti.resolve(script)
jiti(resolved)
