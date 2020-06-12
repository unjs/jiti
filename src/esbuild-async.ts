import { extname } from 'path'

import {
  Loader,
  startService as _startService,
  Service,
  TransformFailure
} from 'esbuild'

import { TransformOptions } from './types'

let service: Service

async function startService () {
  if (!service) {
    service = await _startService()
  }
  return service
}

process.on('exit', () => {
  if (service) {
    service.stop()
  }
})

export default function transform (opts: TransformOptions): string {
  const loader = opts.filename
    ? (extname(opts.filename).slice(1) as Loader)
    : 'ts'

  let js = ''
  let done = false

  startService().then((service) => {
    service
      .transform(opts.source, {
        loader,
        target: 'es2020'
      })
      .then((result) => {
        js = result.js
      })
      .catch((err: TransformFailure) => {
        return `throw Error(${JSON.stringify(err.message + '\n' + err.stack)})`
      })
      .finally(() => {
        done = true
      })
  })

  require('deasync').loopWhile(() => !done)

  return js || "throw Error('Problem compiling source')"
}
