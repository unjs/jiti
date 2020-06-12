import { extname } from 'path'

import { transformSync, Loader } from 'esbuild'

import { TransformOptions } from './types'

const loaders: Loader[] = ['js', 'ts', 'json']

export default function transform (opts: TransformOptions): string | null {
  const loader = opts.filename
    ? (extname(opts.filename).slice(1) as Loader)
    : 'ts'

  if (!loaders.includes(loader)) {
    return null
  }

  const { js } = transformSync(opts.source, {
    loader,
    target: 'es2020'
  })

  return js
}
