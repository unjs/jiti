import { transformSync } from '@babel/core'
// @ts-ignore
import commonjs from '@babel/plugin-transform-modules-commonjs'
// @ts-ignore
import typescript from '@babel/plugin-transform-typescript'

export function transform (source: string): string {
  const result = transformSync(source, {
    plugins: [
      [commonjs, { allowTopLevelThis: true }],
      typescript
    ]
  })?.code || ''

  return result
}
