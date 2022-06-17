import { pathToFileURL } from 'url'
import { smart } from '@babel/template'
import type { NodePath, PluginObj } from '@babel/core'
import type { Statement, MemberExpression } from '@babel/types'
import { transformSync, TransformOptions as BabelTransformOptions } from '@babel/core'
import { TransformOptions, TRANSFORM_RESULT } from './types'

export default function transform (opts: TransformOptions): TRANSFORM_RESULT {
  const _opts: BabelTransformOptions = {
    babelrc: false,
    configFile: false,
    compact: false,
    retainLines: typeof opts.retainLines === 'boolean' ? opts.retainLines : true,
    filename: '',
    cwd: '/',
    ...opts.babel,
    plugins: [
      [require('@babel/plugin-transform-modules-commonjs'), { allowTopLevelThis: true }],
      [require('babel-plugin-dynamic-import-node'), { noInterop: true }],
      [TransformImportMetaPlugin, { filename: opts.filename }],
      [require('@babel/plugin-syntax-class-properties')]
    ]
  }

  if (opts.ts) {
    _opts.plugins!.push([require('@babel/plugin-transform-typescript'), { allowDeclareFields: true }])
    // `unshift` because this plugin must come before `@babel/plugin-syntax-class-properties`
    _opts.plugins!.unshift([require('@babel/plugin-proposal-decorators'), { legacy: true }])
    _opts.plugins!.push(require('babel-plugin-parameter-decorator'))
  }

  if (opts.legacy) {
    _opts.plugins!.push(require('@babel/plugin-proposal-nullish-coalescing-operator'))
    _opts.plugins!.push(require('@babel/plugin-proposal-optional-chaining'))
  }

  if (opts.babel && Array.isArray(opts.babel.plugins)) {
    _opts.plugins?.push(...opts.babel.plugins)
  }

  try {
    return {
      code: transformSync(opts.source, _opts)?.code || ''
    }
  } catch (err: any) {
    return {
      error: err,
      code: 'exports.__JITI_ERROR__ = ' + JSON.stringify({
        filename: opts.filename,
        line: err.loc?.line || 0,
        column: err.loc?.column || 0,
        code: err.code?.replace('BABEL_', '').replace('PARSE_ERROR', 'ParseError'),
        message: err.message?.replace('/: ', '').replace(/\(.+\)\s*$/, '')
      })
    }
  }
}

// https://github.com/javiertury/babel-plugin-transform-import-meta/blob/master/src/index.ts
const TransformImportMetaPlugin = (opts: { filename?: string }): PluginObj => {
  return {
    name: 'transform-import-meta',
    visitor: {
      Program (path) {
        const metas: Array<NodePath<MemberExpression>> = []

        path.traverse({
          MemberExpression (memberExpPath) {
            const { node } = memberExpPath

            if (
              node.object.type === 'MetaProperty' &&
              node.object.meta.name === 'import' &&
              node.object.property.name === 'meta' &&
              node.property.type === 'Identifier' &&
              node.property.name === 'url'
            ) {
              metas.push(memberExpPath)
            }
          }
        })

        if (metas.length === 0) {
          return
        }

        for (const meta of metas) {
          meta.replaceWith(smart.ast`${
            opts.filename
              ? JSON.stringify(pathToFileURL(opts.filename))
              : "require('url').pathToFileURL(__filename).toString()"
          }` as Statement)
        }
      }
    }
  }
}
