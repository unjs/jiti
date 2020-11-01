export default function test () {
  return {
    file: __filename,
    dir: __dirname,
    resolve: require.resolve('./test')
  }
}
