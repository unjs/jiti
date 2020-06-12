import { extname } from 'path'

import { transformSync, Loader } from 'esbuild'

import { TransformOptions } from './types'

export default function transform (opts: TransformOptions): string {
  const loader = opts.filename
    ? (extname(opts.filename).slice(1) as Loader)
    : 'ts'

  try {
    const { js } = transformSync(opts.source, {
      loader,
      target: 'es2020'
    })
    return js
  } catch (err) {
    return `throw Error(${JSON.stringify(err.message + '\n' + err.stack)})`
  }
}
