import { existsSync, readFileSync, writeFileSync } from 'fs'
import { Module, builtinModules } from 'module'
import { dirname, join, basename, extname } from 'path'
import { tmpdir } from 'os'
import { createHash } from 'crypto'
import vm from 'vm'
import mkdirp from 'mkdirp'
import destr from 'destr'
import createRequire from 'create-require'
import { addHook } from 'pirates'
import { isDir, isWritable } from './utils'
import { TransformOptions } from './types'

export type JITIOptions = {
  transform?: (opts: TransformOptions) => string,
  debug?: boolean,
  cache?: boolean | string
  dynamicImport?: (id: string) => Promise<any>
  onError?: (error: Error) => void
}

const _EnvDebug = destr(process.env.JITI_DEBUG)
const _EnvCache = destr(process.env.JITI_CACHE)

const defaults = {
  debug: _EnvDebug,
  cache: _EnvCache !== undefined ? _EnvCache : true
}

const TRANSPILE_VERSION = 3

function md5 (content: string, len = 8) {
  return createHash('md5').update(content).digest('hex').substr(0, len)
}

type Require = typeof require
export interface JITI extends Require {
  transform: (opts: TransformOptions) => string
}

export default function createJITI (_filename: string = process.cwd(), opts: JITIOptions = {}): JITI {
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
    opts.cache = join(tmpdir(), 'node-jiti')
  }
  if (opts.cache) {
    try {
      mkdirp.sync(opts.cache as string)
      if (!isWritable(opts.cache)) {
        throw new Error('directory is not writable')
      }
    } catch (err) {
      debug('Error creating cache directory at ', opts.cache, err)
      opts.cache = false
    }
  }

  const nativeRequire = createRequire(_filename)

  const tryResolve = (id: string, options?: { paths?: string[] }) => {
    try { return nativeRequire.resolve(id, options) } catch (e) {}
  }

  const _resolve = (id: string, options?: { paths?: string[] }) => {
    if (['.js', '.ts', '.mjs'].includes(extname(id))) {
      return nativeRequire.resolve(id, options)
    }
    return tryResolve(id, options) ||
      tryResolve(id + '.ts', options) ||
      tryResolve(id + '/index.ts', options) ||
      tryResolve(id + '.mjs', options) ||
      tryResolve(id + '/index.mjs', options) ||
      nativeRequire.resolve(id, options)
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
    const ext = extname(filename)

    // Unknown format
    if (!['.js', '.ts'].includes(ext)) {
      debug('[unknown]', filename)
      return nativeRequire(id)
    }

    // MJS
    if (ext === '.mjs' && opts.dynamicImport) {
      debug('[mjs]', filename)
      return opts.dynamicImport(filename)
    }

    // Check for CJS cache
    if (nativeRequire.cache[filename]) {
      return nativeRequire.cache[filename]?.exports
    }

    // Read source
    let source = readFileSync(filename, 'utf-8')

    // Typescript
    if (ext === '.ts') {
      debug('[ts]', filename)
      source = getCache(filename, source, () => opts.transform!({ source, filename, ts: true }))
    } else {
      // ESM ~> CJS
      const esmSyntaxDetected = source.match(/^\s*import .* from/m) ||
        (!opts.dynamicImport && source.match(/import\s*\(/)) ||
        source.match(/^\s*export /m)
      if (esmSyntaxDetected) {
        debug('[esm]', filename)
        source = getCache(filename, source, () => opts.transform!({ source, filename }))
      } else {
        try {
          debug('[cjs]', filename)
          return nativeRequire(id)
        } catch (err) {
          debug('Native require error:', err)
          debug('[esm fallback]', filename)
          source = getCache(filename, source, () => opts.transform!({ source, filename }))
        }
      }
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

    // Compile wrapped script
    let compiled
    try {
      // @ts-ignore
      // mod._compile wraps require and require.resolve to global function
      compiled = vm.runInThisContext(Module.wrap(source), {
        filename,
        lineOffset: 0,
        displayErrors: false
      })
    } catch (err) {
      delete nativeRequire.cache[filename]
      opts.onError!(err)
    }

    // Evaluate module
    try {
      compiled(mod.exports, mod.require, mod, mod.filename, dirname(mod.filename))
    } catch (err) {
      delete nativeRequire.cache[filename]
      opts.onError!(err)
    }

    // Check for parse errors
    if (mod.exports && mod.exports.__JITI_ERROR__) {
      const { filename, line, column, code, message } = mod.exports.__JITI_ERROR__
      const loc = `${filename}:${line}:${column}`
      const err = new Error(`${code}: ${message} \n ${loc}`)
      Error.captureStackTrace(err, jiti)
      opts.onError!(err)
    }

    // Set as loaded
    mod.loaded = true

    // Return exports
    return mod.exports
  }

  function register () {
    addHook(
      (source, filename) =>
        jiti.transform({ source, filename, ts: !!filename.match(/.ts$/) })
      ,
      { exts: ['.js', '.ts'] }
    )
  }

  jiti.resolve = _resolve
  jiti.cache = nativeRequire.cache
  jiti.extensions = nativeRequire.extensions
  jiti.main = nativeRequire.main
  jiti.transform = opts.transform!
  jiti.register = register

  return jiti
}
