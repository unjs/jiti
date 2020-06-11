import 'v8-compile-cache'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { Module, builtinModules } from 'module'
import { dirname, join, basename } from 'path'
import { tmpdir } from 'os'
import { createHash } from 'crypto'
import mkdirp from 'mkdirp'
import createRequire from 'create-require'
import resolve from 'resolve'
import { TransformOptions } from './types'

export type JITIOptions = {
  transform?: (opts: TransformOptions) => string,
  debug?: boolean,
  cache?: boolean,
  cacheDir?: string
}

const defaults = {
  debug: false,
  cache: true
}

function md5 (content: string, len = 8) {
  return createHash('md5').update(content).digest('hex').substr(0, len)
}

export default function createJITI (_filename: string = process.cwd(), opts: JITIOptions): NodeRequire {
  opts = { ...defaults, ...opts }

  if (opts.cache && !opts.cacheDir) {
    const nodeModulesDir = join(process.cwd(), 'node_modules')
    if (existsSync(nodeModulesDir)) {
      opts.cacheDir = join(nodeModulesDir, '.cache/jiti')
    } else {
      opts.cacheDir = join(tmpdir(), 'node-jiti')
    }
  }

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

  function getCache (filename: string, source: string, get: () => string): string {
    if (!opts.cache) {
      return get()
    }

    // Calculate source hash
    const sourceHash = ` /* ${md5(source, 16)} */`

    // Check cache file
    let filebase = basename(filename)
    if (filename.startsWith('index')) {
      filebase = dirname(filename) + '.' + filebase
    }
    const cacheFile = join(opts.cacheDir!, filebase + '.' + md5(filename) + '.js')

    if (existsSync(cacheFile)) {
      const cacheSource = readFileSync(cacheFile, 'utf-8')
      if (cacheSource.endsWith(sourceHash)) {
        return cacheSource
      }
    }

    const result = get()

    mkdirp.sync(opts.cacheDir!)
    writeFileSync(cacheFile, result + sourceHash, 'utf-8')

    return result
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

    // Transpile if needed
    if (filename.match(/\.ts$/)) {
      debug('[ts]', filename)
      source = getCache(filename, source, () => opts.transform!({ source, filename, ts: true }))
    } else if (source.match(/^\s*import .* from/m) || source.match(/^\s*export /m)) {
      debug('[esm]', filename)
      source = getCache(filename, source, () => opts.transform!({ source, filename }))
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
