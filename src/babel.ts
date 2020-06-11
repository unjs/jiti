import { transformSync, TransformOptions as BabelTransformOptions } from '@babel/core'

type TransformOptions = {
  source: string,
  filename?: string,
  ts?: Boolean
}

export function transform (opts: TransformOptions): string {
  const _opts: BabelTransformOptions = {
    babelrc: false,
    configFile: false,
    compact: false,
    retainLines: true,
    filename: opts.filename,
    plugins: [
      [require('@babel/plugin-transform-modules-commonjs'), { allowTopLevelThis: true }]
    ]
  }

  if (opts.ts) {
    _opts.plugins!.push(require('@babel/plugin-transform-typescript'))
  }

  const result = transformSync(opts.source, _opts)?.code || ''

  return result
}
