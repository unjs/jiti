import { readFileSync } from 'fs'
import { Module, builtinModules } from 'module'
import { dirname } from 'path'
import createRequire from 'create-require'
// @ts-ignore
import resolve from 'resolve'
import { TransformOptions } from './types'

export type JITIOptions = {
  transform: (opts: TransformOptions) => string,
  debug: boolean
}

export default function createJITI (_filename: string = process.cwd(), opts: JITIOptions): NodeRequire {
  // https://www.npmjs.com/package/resolve
  const resolveOpts = {
    extensions: ['.js', '.mjs', '.ts'],
    basedir: dirname(_filename)
  }
  const _resolve = (id: string) => resolve.sync(id, resolveOpts)
  _resolve.paths = (_: string) => []

  const _require = createRequire(_filename)

  function debug (...args: string[]) {
    if (opts.debug) {
      // eslint-disable-next-line no-console
      console.log('[jiti]', ...args)
    }
  }

  function jiti (id: string) {
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
    if (filename.match(/\.ts$/)) {
      debug('[ts]', filename)
      source = opts.transform({ source, filename, ts: true })
    } else if (source.match(/^\s*import .* from/m) || source.match(/^\s*export /m)) {
      debug('[esm]', filename)
      source = opts.transform({ source, filename })
    } else {
      debug('[bail]', filename)
      return _require(id)
    }

    // Compile module
    const mod = new Module(filename)
    mod.filename = filename
    mod.parent = module
    mod.require = createJITI(filename, opts)

    // @ts-ignore
    mod.path = dirname(filename)

    // @ts-ignore
    mod.paths = Module._nodeModulePaths(mod.path)

    // @ts-ignore
    mod._compile(source, filename)

    // Set as loaded
    mod.loaded = true

    // Set CJS cache
    _require.cache[filename] = mod

    // Return exports
    return mod.exports
  }

  jiti.resolve = _resolve
  jiti.cache = _require.cache
  jiti.extensions = _require.extensions
  jiti.main = _require.main

  return jiti
}
