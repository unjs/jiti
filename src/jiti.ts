import { readFileSync } from 'fs'
import { Module, builtinModules } from 'module'
import { dirname } from 'path'
import { Script } from 'vm'
import _createRequire from 'create-require'
// @ts-ignore
import resolve from 'resolve'
import { transform } from './babel'

export default function jiti (_filename: string): NodeRequire {
  const _require = _createRequire(_filename)

  // https://www.npmjs.com/package/resolve
  const resolveOpts = {
    extensions: ['.js', '.mjs', '.ts'],
    basedir: dirname(_filename)
  }
  const _resolve = (id: string) => resolve.sync(id, resolveOpts)
  _resolve.paths = (_: string) => []

  function requireJIT (id: string) {
    // Check for builtin node module like fs
    if (builtinModules.includes(id)) {
      return _require(id)
    }

    // Resolve path
    const filename = _resolve(id)

    // Check for CJS cache
    if (_require.cache[filename]) {
      return _require.cache[filename]?.exports
    }

    // Read source
    let source = readFileSync(filename, 'utf-8')
    if (filename.includes('.ts') ||
      source.match(/^\s*import .* from/m) ||
      source.match(/^\s*export /m)
    ) {
      // Apply transform
      // console.log('>', filename)
      source = transform(source, filename)
    } else {
      // Bail
      // console.log('!', filename)
      return _require(id)
    }

    // Compile module
    const mod = new Module(filename)
    mod.filename = filename
    mod.parent = module
    mod.require = jiti(filename)

    // @ts-ignore
    mod.path = dirname(filename)

    // @ts-ignore
    mod.paths = Module._nodeModulePaths(mod.path)

    const wrapped = Module.wrap(source)
    const script = new Script(wrapped, { filename })
    const compiled = script.runInThisContext({ filename })

    // @ts-ignore
    compiled.call(mod, mod.exports, mod.require, mod, mod.filename, mod.path)

    // Set as loaded
    mod.loaded = true

    // Set CJS cache
    _require.cache[filename] = mod

    // Return exports
    return mod.exports
  }

  requireJIT.resolve = _resolve
  requireJIT.cache = _require.cache
  requireJIT.extensions = _require.extensions
  requireJIT.main = _require.main

  return requireJIT
}
