import { transformSync } from '@babel/core'
// @ts-ignore
import env from '@babel/preset-env'
// @ts-ignore
import typescript from '@babel/plugin-transform-typescript'

export function transform (source: string): string {
  const result = transformSync(source, {
    presets: [
      [env, { targets: { node: 'current' } }]
    ],
    plugins: [
      typescript
    ]
  })?.code || ''

  return result
}
