import { transformSync } from '@babel/core'
// @ts-ignore
import babelPresetEnv from '@babel/preset-env'

export function transform (source: string): string {
  const result = transformSync(source, {
    presets: [
      [babelPresetEnv, {
        targets: {
          node: 'current'
        }
      }]
    ]
  })?.code || ''

  return result
}
