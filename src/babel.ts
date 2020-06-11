import { transformSync } from '@babel/core'
// @ts-ignore
import commonjs from '@babel/plugin-transform-modules-commonjs'
// @ts-ignore
import typescript from '@babel/plugin-transform-typescript'

export function transform (source: string, filename?: string): string {
  const result = transformSync(source, {
    babelrc: false,
    compact: false,
    retainLines: true,
    filename,
    plugins: [
      [commonjs, { allowTopLevelThis: true }],
      typescript
    ]
  })?.code || ''
  // console.log(result)
  return result
}
