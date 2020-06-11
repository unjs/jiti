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
      [require('@babel/plugin-transform-modules-commonjs'), { allowTopLevelThis: true }]
    ]
  }

  if (opts.ts) {
    _opts.plugins!.push(require('@babel/plugin-transform-typescript'))
  }

  try {
    return transformSync(opts.source, _opts)?.code || ''
  } catch (err) {
    const code = err.code.replace('BABEL_', '').replace('PARSE_ERROR', 'ParseError')
    const message = code + ': ' + err.message.replace('/: ', '').replace(/\(.+\)\s*$/, '')
    const stack = `    at ${opts.filename}:${err.loc.line}:${err.loc.column}`

    return `throw Error(${JSON.stringify(message + '\n' + stack)})`
    // const _err = new Error(message)
    // _err.stack = message + '\n' + stack
    // throw _err
  }
}
