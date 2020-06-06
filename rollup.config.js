import { builtinModules } from 'module'
import typescript from 'rollup-plugin-typescript2'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'

const output = {
  dir: 'dist',
  format: 'cjs',
  preferConst: true
}

const external = [
  ...builtinModules
]

export default {
  input: './src/index.ts',
  external,
  output,
  plugins: [
    json(),
    typescript(),
    resolve(),
    commonjs({ extensions: ['.js', '.ts'] })
  ]
}
