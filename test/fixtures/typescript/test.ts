import type { Test } from './types'

export default function test () {
  return <Test> {
    file: __filename,
    dir: __dirname,
    resolve: require.resolve('./test')
  }
}
