import { extname } from 'path'

import { Loader, startService as _startService, Service } from 'esbuild'

import { TransformOptions } from './types'

const loaders: Loader[] = ['js', 'ts', 'json']

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

export default function transform (opts: TransformOptions): string | null {
  const loader = opts.filename
    ? (extname(opts.filename).slice(1) as Loader)
    : 'ts'

  if (!loaders.includes(loader)) {
    return null
  }

  let js = ''

  startService().then((service) => {
    service
      .transform(opts.source, {
        loader,
        target: 'es2020'
      })
      .then((result) => {
        js = result.js
      })
  })

  // eslint-disable-next-line
  do {} while (!js)

  return js
}
