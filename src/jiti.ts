import { existsSync, readFileSync, writeFileSync } from 'fs'
import { Module, builtinModules } from 'module'
import { dirname, join, basename, extname } from 'path'
import { tmpdir } from 'os'
import vm from 'vm'
import { fileURLToPath, pathToFileURL } from 'url'
import mkdirp from 'mkdirp'
import destr from 'destr'
import createRequire from 'create-require'
import semver from 'semver'
import { addHook } from 'pirates'
import objectHash from 'object-hash'
import { hasESMSyntax, interopDefault, resolvePathSync } from 'mlly'
import { isDir, isWritable, md5, detectLegacySyntax } from './utils'
import { TransformOptions, JITIOptions } from './types'

const _EnvDebug = destr(process.env.JITI_DEBUG)
const _EnvCache = destr(process.env.JITI_CACHE)
const _EnvRequireCache = destr(process.env.JITI_REQUIRE_CACHE)

const defaults: JITIOptions = {
  debug: _EnvDebug,
  cache: _EnvCache !== undefined ? !!_EnvCache : true,
  requireCache: _EnvRequireCache !== undefined ? !!_EnvRequireCache : true,
  interopDefault: false,
  cacheVersion: '6',
  legacy: semver.lt(process.version || '0.0.0', '14.0.0'),
  extensions: ['.js', '.mjs', '.cjs', '.ts']
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
    } catch (err: any) {
      debug('Error creating cache directory at ', opts.cache, err)
      opts.cache = false
    }
  }

  const nativeRequire = createRequire(_filename)

  const tryResolve = (id: string, options?: { paths?: string[] }) => {
    try { return nativeRequire.resolve(id, options) } catch (e) {}
  }

  const _url = pathToFileURL(_filename)
  const _additionalExts = [...opts.extensions!].filter(ext => ext !== '.js')
  const _resolve = (id: string, options?: { paths?: string[] }) => {
    // Try ESM resolve
    let resolved, err
    try {
      resolved = resolvePathSync(id, { url: _url, conditions: ['node', 'require', 'import'] })
    } catch (_err) {
      err = _err
    }
    if (resolved) {
      return resolved
    }

    // Try native require resolve
    if (opts.extensions!.includes(extname(id))) {
      return nativeRequire.resolve(id, options)
    }
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

  function _interopDefault (mod: any) {
    return opts.interopDefault ? interopDefault(mod) : mod
  }

  function jiti (id: string) {
    // Check for node: and file: protocol
    if (id.startsWith('node:')) {
      id = id.substr(5)
    } else if (id.startsWith('file:')) {
      id = fileURLToPath(id)
    }

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
    if (opts.requireCache && nativeRequire.cache[filename]) {
      return _interopDefault(nativeRequire.cache[filename]?.exports)
    }

    // Read source
    let source = readFileSync(filename, 'utf-8')

    // Transpile
    const isTypescript = ext === '.ts'
    const isNativeModule = ext === '.mjs'
    const isCommonJS = ext === '.cjs'
    const needsTranspile = !isCommonJS && (
      isTypescript ||
      isNativeModule ||
      hasESMSyntax(source) ||
      (opts.legacy && detectLegacySyntax(source))
    )

    if (needsTranspile) {
      debug('[transpile]', filename)
      source = transform({ filename, source, ts: isTypescript })
    } else {
      try {
        debug('[native]', filename)
        return _interopDefault(nativeRequire(id))
      } catch (err: any) {
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
    if (opts.requireCache) {
      nativeRequire.cache[filename] = mod
    }

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
    } catch (err: any) {
      if (opts.requireCache) {
        delete nativeRequire.cache[filename]
      }
      opts.onError!(err)
    }

    // Evaluate module
    try {
      compiled(mod.exports, mod.require, mod, mod.filename, dirname(mod.filename))
    } catch (err: any) {
      if (opts.requireCache) {
        delete nativeRequire.cache[filename]
      }
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

    // interopDefault
    const _exports = _interopDefault(mod.exports)

    // Return exports
    return _exports
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
  jiti.cache = opts.requireCache ? nativeRequire.cache : {}
  jiti.extensions = nativeRequire.extensions
  jiti.main = nativeRequire.main
  jiti.transform = transform
  jiti.register = register

  return jiti
}
