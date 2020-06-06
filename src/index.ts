import { readFileSync } from 'fs'
import { Module, builtinModules } from 'module'
import { dirname } from 'path'
import _createRequire from 'create-require'
import resolve from 'resolve'

export default function jiti (_filename: string): NodeRequire {
  const { transform } = require('./transform')
  const _require = _createRequire(_filename)

  // https://www.npmjs.com/package/resolve
  const resolveOpts = {
    extensions: ['.js', '.mjs', '.ts'],
    basedir: dirname(_filename)
  }

  function requireJIT (id: string) {
    // Check for builtin node module like fs
    if (builtinModules.includes(id)) {
      return _require(id)
    }

    // Resolve path
    const filename = resolve.sync(id, resolveOpts)

    // Check for CJS cache
    if (_require.cache[filename]) {
      return _require.cache[filename]?.exports
    }

    // Read source
    let source = readFileSync(filename, 'utf-8')

    // Apply transform
    source = transform(source)

    // Compile module
    const mod = new Module(filename)
    mod.filename = filename
    mod.parent = module
    mod.require = jiti(filename)
    // @ts-ignore
    mod.path = dirname(filename)
    // @ts-ignore
    mod.paths = Module._nodeModulePaths(mod.path)

    // Compile module
    // @ts-ignore
    mod._compile(source, filename)

    // Set as loaded
    mod.loaded = true

    // Set cache entry
    _require.cache[filename] = mod

    // Return exports
    return mod.exports
  }

  requireJIT.resolve = _require.resolve
  requireJIT.cache = _require.cache
  requireJIT.extensions = _require.extensions
  requireJIT.main = _require.main

  return requireJIT
}
