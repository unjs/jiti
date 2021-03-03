import { transformSync, TransformOptions as BabelTransformOptions } from '@babel/core'
import { TransformOptions } from './types'

export default function transform (opts: TransformOptions): string {
  const _opts: BabelTransformOptions = {
    babelrc: false,
    configFile: false,
    compact: false,
    retainLines: typeof opts.retainLines === 'boolean' ? opts.retainLines : true,
    filename: '',
    cwd: '/',
    plugins: [
      [require('@babel/plugin-transform-modules-commonjs'), { allowTopLevelThis: true }],
      [require('babel-plugin-dynamic-import-node'), { noInterop: true }],
      [require('babel-plugin-transform-import-meta')]
    ]
  }

  if (opts.ts) {
    _opts.plugins!.push(require('@babel/plugin-transform-typescript'))
  }

  if (opts.legacy) {
    _opts.plugins!.push(require('@babel/plugin-proposal-nullish-coalescing-operator'))
    _opts.plugins!.push(require('@babel/plugin-proposal-optional-chaining'))
  }

  try {
    return transformSync(opts.source, _opts)?.code || ''
  } catch (err) {
    return 'exports.__JITI_ERROR__ = ' + JSON.stringify({
      filename: opts.filename,
      line: err.loc?.line || 0,
      column: err.loc?.column || 0,
      code: err.code?.replace('BABEL_', '').replace('PARSE_ERROR', 'ParseError'),
      message: err.message?.replace('/: ', '').replace(/\(.+\)\s*$/, '')
    })
  }
}
