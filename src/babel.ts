import { transformSync, TransformOptions as BabelTransformOptions } from '@babel/core'
import { TransformOptions } from './types'

export default function transform (opts: TransformOptions): string {
  const _opts: BabelTransformOptions = {
    babelrc: false,
    configFile: false,
    compact: false,
    retainLines: true,
    filename: '',
    cwd: '/',
    plugins: [
      [require('@babel/plugin-transform-modules-commonjs'), { allowTopLevelThis: true }],
      [require('babel-plugin-dynamic-import-node'), { noInterop: true }]
    ]
  }

  if (opts.ts) {
    _opts.plugins!.push(require('@babel/plugin-transform-typescript'))
  }

  try {
    return transformSync(opts.source, _opts)?.code || ''
  } catch (err) {
    return 'exports.__JITI_ERROR__ = ' + JSON.stringify({
      filename: opts.filename,
      line: err.loc?.line || 0,
      column: err.loc?.column || 0,
      code: err.code.replace('BABEL_', '').replace('PARSE_ERROR', 'ParseError'),
      message: err.message.replace('/: ', '').replace(/\(.+\)\s*$/, '')
    })
  }
}
