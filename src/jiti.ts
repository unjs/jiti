import 'v8-compile-cache'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { Module, builtinModules } from 'module'
import { dirname, join, basename } from 'path'
import { tmpdir } from 'os'
import { createHash } from 'crypto'
import vm from 'vm'
import mkdirp from 'mkdirp'
import destr from 'destr'
import createRequire from 'create-require'
import resolve from 'resolve'
import { isDir, isWritable } from './utils'
import { TransformOptions } from './types'

export type JITIOptions = {
  transform?: (opts: TransformOptions) => string,
  debug?: boolean,
  cache?: boolean | string
  dynamicImport?: (id: string) => Promise<any>
}

const _EnvDebug = destr(process.env.JITI_DEBUG)
const _EnvCache = destr(process.env.JITI_CACHE)

const defaults = {
  debug: _EnvDebug,
  cache: _EnvCache !== undefined ? _EnvCache : true
}

const TRANSPILE_VERSION = 2

function md5 (content: string, len = 8) {
  return createHash('md5').update(content).digest('hex').substr(0, len)
}

export default function createJITI (_filename: string = process.cwd(), opts: JITIOptions = {}): typeof require {
  opts = { ...defaults, ...opts }

  function debug (...args: string[]) {
    if (opts.debug) {
      // eslint-disable-next-line no-console
      console.log('[jiti]', ...args)
    }
  }

  // If filename is dir, createRequire goes with parent directory, so we need fakepath
  if (isDir(_filename)) {
    _filename = join(_filename, 'index.js')
  }

  if (opts.cache === true) {
    // Default to ./node_modules/.cache/jiti only if ./node_modules exists
    const nodeModulesDir = join(process.cwd(), 'node_modules')
    if (isDir(nodeModulesDir)) {
      opts.cache = join(nodeModulesDir, '.cache/jiti')
    }
    // Check if is writable
    if (opts.cache === true || !isWritable(opts.cache)) {
      opts.cache = join(tmpdir(), 'node-jiti')
    } else if (!isWritable(opts.cache)) {
      opts.cache = false
    }
  }
  if (opts.cache) {
    if (!isDir(opts.cache)) {
      mkdirp.sync(opts.cache as string)
    }
    debug('Cache dir:', opts.cache)
  } else {
    debug('Cache is disabled')
  }

  const nativeRequire = createRequire(_filename)

  const tryResolve = (id: string, options?: { paths?: string[] }) => {
    try { return nativeRequire.resolve(id, options) } catch (e) {}
  }

  // https://www.npmjs.com/package/resolve
  const _resolve = (id: string, options?: { paths?: string[] }) => {
    return tryResolve(id + '.ts', options) || tryResolve(id + '.mjs', options) || nativeRequire.resolve(id, options)
  }
  _resolve.paths = nativeRequire.resolve.paths

  function getCache (filename: string, source: string, get: () => string): string {
    if (!opts.cache) {
      return get()
    }

    // Calculate source hash
    const sourceHash = ` /* v${TRANSPILE_VERSION}-${md5(source, 16)} */`

    // Check cache file
    const filebase = basename(dirname(filename)) + '-' + basename(filename)
    const cacheFile = join(opts.cache as string, filebase + '.' + md5(filename) + '.js')

    if (existsSync(cacheFile)) {
      const cacheSource = readFileSync(cacheFile, 'utf-8')
      if (cacheSource.endsWith(sourceHash)) {
        return cacheSource
      }
    }

    const result = get()

    writeFileSync(cacheFile, result + sourceHash, 'utf-8')

    return result
  }

  function jiti (id: string) {
    // Check for builtin node module like fs
    if (builtinModules.includes(id)) {
      return nativeRequire(id)
    }

    // Resolve path
    const filename = _resolve(id)

    // Giveup on mjs extension
    if (filename.match(/\.mjs$/) && opts.dynamicImport) {
      debug('[mjs bail]', filename)
      return opts.dynamicImport(filename)
    }

    // Check for CJS cache
    if (nativeRequire.cache[filename]) {
      return nativeRequire.cache[filename]?.exports
    }

    // Read source
    let source = readFileSync(filename, 'utf-8')

    // Transpile if needed
    if (filename.match(/\.ts$/)) {
      debug('[ts]', filename)
      source = getCache(filename, source, () => opts.transform!({ source, filename, ts: true }))
    } else if (source.match(/^\s*import .* from/m) || source.match(/import\s*\(/) || source.match(/^\s*export /m)) {
      debug('[esm]', filename)
      source = getCache(filename, source, () => opts.transform!({ source, filename }))
    } else {
      debug('[bail]', filename)
      return nativeRequire(id)
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

    // Set CJS cache before eval
    nativeRequire.cache[filename] = mod

    // @ts-ignore
    // mod._compile wraps require and require.resolve to global function
    const compiled = vm.runInThisContext(Module.wrap(source), {
      filename,
      lineOffset: 0,
      displayErrors: true
    })
    compiled(mod.exports, mod.require, mod, mod.filename, dirname(mod.filename))

    // Set as loaded
    mod.loaded = true

    // Return exports
    return mod.exports
  }

  jiti.resolve = _resolve
  jiti.cache = nativeRequire.cache
  jiti.extensions = nativeRequire.extensions
  jiti.main = nativeRequire.main

  return jiti
}
