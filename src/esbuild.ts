import {
  transformSync as _transformSync,
  startService,
  Service,
  TransformFailure,
  TransformOptions as _TransformOptions
} from 'esbuild'

import { TransformOptions } from './types'

let _service: Service

export default function transform (opts: TransformOptions) {
  const esbuildOptions: _TransformOptions = {
    target: 'es2017',
    loader: opts.ts ? 'ts' : 'js'
  }

  if (opts.sync) {
    return transformSync(opts.source, esbuildOptions)
  } else {
    return transformAsync(opts.source, esbuildOptions)
  }
}

export async function getService () {
  if (!_service) {
    _service = await startService()
    process.on('exit', () => {
      if (_service) {
        _service.stop()
      }
    })
  }
  return _service
}

function transformAsync (source: string, opts: _TransformOptions): string {
  let js: string = ''

  getService().then(service => service.transform(source, opts).then((result) => {
    js = result.js
  }).catch((err: TransformFailure) => {
    js = `throw Error(${JSON.stringify(err.message + '\n' + err.stack)})`
  }))

  require('deasync').loopWhile(() => !js)

  return js || "throw Error('Problem compiling source')"
}

function transformSync (source: string, opts: _TransformOptions): string {
  try {
    const { js } = _transformSync(source, opts)
    return js
  } catch (err) {
    return `throw Error(${JSON.stringify(err.message + '\n' + err.stack)})`
  }
}
