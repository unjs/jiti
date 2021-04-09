import { existsSync, readFileSync, writeFileSync } from 'fs'
import { Module, builtinModules } from 'module'
import { dirname, join, basename, extname } from 'path'
import { tmpdir } from 'os'
import vm from 'vm'
import mkdirp from 'mkdirp'
import destr from 'destr'
import createRequire from 'create-require'
import semver from 'semver'
import { addHook } from 'pirates'
import objectHash from 'object-hash'
import { isDir, isWritable, md5 } from './utils'
import { TransformOptions, JITIOptions } from './types'

const _EnvDebug = destr(process.env.JITI_DEBUG)
const _EnvCache = destr(process.env.JITI_CACHE)

const defaults = {
  debug: _EnvDebug,
  cache: _EnvCache !== undefined ? _EnvCache : true,
  cacheVersion: '5',
  legacy: semver.lt(process.version || '0.0.0', '14.0.0'),
  extensions: ['.js', '.mjs', '.ts']
}

type Require = typeof require
export interface JITI extends Require {
  transform: (opts: TransformOptions) => string
  register: () => (() => void)
}

export default function createJITI (_filename: string = process.cwd(), opts: JITIOptions = {}, parentModule?: typeof module): JITI {
  opts = { ...defaults, ...opts }

  // Cache dependencies
  if (opts.legacy) {
    opts.cacheVersion += '-legacy'
  }
  if (opts.transformOptions) {
    opts.cacheVersion += '-' + objectHash(opts.transformOptions)
  }

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

  const _additionalExts = [...opts.extensions!].filter(ext => ext !== '.js')
  const _resolve = (id: string, options?: { paths?: string[] }) => {
    if (opts.extensions!.includes(extname(id))) {
      return nativeRequire.resolve(id, options)
    }
    let resolved, err
    try {
      return nativeRequire.resolve(id, options)
    } catch (_err) {
      err = _err
    }
    for (const ext of _additionalExts) {
      resolved = tryResolve(id + ext, options) ||
        tryResolve(id + '/index' + ext, options)
      if (resolved) {
        return resolved
      }
    }
    throw err
  }
  _resolve.paths = nativeRequire.resolve.paths

  function getCache (filename: string | undefined, source: string, get: () => string): string {
    if (!opts.cache || !filename) {
      return get()
    }

    // Calculate source hash
    const sourceHash = ` /* v${opts.cacheVersion}-${md5(source, 16)} */`

    // Check cache file
    const filebase = basename(dirname(filename)) + '-' + basename(filename)
    const cacheFile = join(opts.cache as string, filebase + '.' + md5(filename) + '.js')

    if (existsSync(cacheFile)) {
      const cacheSource = readFileSync(cacheFile, 'utf-8')
      if (cacheSource.endsWith(sourceHash)) {
        debug('[cache hit]', filename, '~>', cacheFile)
        return cacheSource
      }
    }

    debug('[cache miss]', filename)
    const result = get()

    if (!result.includes('__JITI_ERROR__')) {
      writeFileSync(cacheFile, result + sourceHash, 'utf-8')
    }

    return result
  }

  function transform (topts: any): string {
    let code = getCache(topts.filename, topts.source, () => {
      const res = opts.transform!({
        legacy: opts.legacy,
        ...opts.transformOptions,
        ...topts
      })
      if (res.error && opts.debug) {
        debug(res.error)
      }
      return res.code
    })
    if (code.startsWith('#!')) {
      code = '// ' + code
    }
    return code
  }

  function jiti (id: string) {
    // Check for builtin node module like fs
    if (builtinModules.includes(id) || id === '.pnp.js' /* #24 */) {
      return nativeRequire(id)
    }

    // Resolve path
    const filename = _resolve(id)
    const ext = extname(filename)

    // Unknown format
    if (ext && !opts.extensions!.includes(ext)) {
      debug('[unknown]', filename)
      return nativeRequire(id)
    }

    // Check for CJS cache
    if (nativeRequire.cache[filename]) {
      return nativeRequire.cache[filename]?.exports
    }

    // Read source
    let source = readFileSync(filename, 'utf-8')

    // Transpile
    const isTypescript = ext === '.ts'
    const needsTranspile = isTypescript ||
      (source.match(/^\s*import .* from|\s*export |import\s*\(/m)) ||
      (opts.legacy && (source.match(/\?\.|\?\?/)))

    if (needsTranspile) {
      debug('[transpile]', filename)
      source = transform({ filename, source, ts: isTypescript })
    } else {
      try {
        debug('[native]', filename)
        return nativeRequire(id)
      } catch (err) {
        debug('Native require error:', err)
        debug('[fallback]', filename)
        source = transform({ filename, source, ts: isTypescript })
      }
    }

    // Compile module
    const mod = new Module(filename)
    mod.filename = filename
    if (parentModule) {
      mod.parent = parentModule
      if (Array.isArray(parentModule.children) &&
        !parentModule.children.includes(mod)
      ) {
        parentModule.children.push(mod)
      }
    }
    mod.require = createJITI(filename, opts, mod)

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
    return addHook(
      (source: string, filename: string) =>
        jiti.transform({ source, filename, ts: !!filename.match(/.ts$/) })
      ,
      { exts: opts.extensions }
    )
  }

  jiti.resolve = _resolve
  jiti.cache = nativeRequire.cache
  jiti.extensions = nativeRequire.extensions
  jiti.main = nativeRequire.main
  jiti.transform = transform
  jiti.register = register

  return jiti
}
