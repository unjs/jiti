const getStack = () => new Error('Boo').stack

export default function test () {
  return {
    file: __filename,
    dir: __dirname,
    stack: getStack().split('\n').splice(1).map(s => s.trim())
  }
}
