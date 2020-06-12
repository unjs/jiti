const Benchmark = requireUncached('benchmark')
const suite = new Benchmark.Suite()

process.setMaxListeners(10000)

function requireUncached (module) {
  delete require.cache[require.resolve(module)]
  return require(module)
}

const transformers = [
  ['babel', () => requireUncached('../../dist/babel')],
  ['esbuild-async', () => requireUncached('../../dist/esbuild-async')],
  ['esbuild-sync', () => requireUncached('../../dist/esbuild-sync')]
]

const test = process.argv[2]

if (test === 'fixture') {
  suite.add('esm js', () => {
    const esm = requireUncached('esm')(module)
    for (let i = 0; i < 3; i++) {
      esm('../fixtures/esm').test()
    }
  })
} else {
  suite.add('esm init', () => requireUncached('esm')(module))
}

transformers
  .sort(() => Math.random() - 0.5)
  .forEach(([name, fn]) => {
    if (test === 'fixture') {
      suite.add(`${name} js`, () => {
        const jiti = requireUncached('../..')(__filename, { transform: fn(), cache: false })

        for (let i = 0; i < 3; i++) {
          jiti('../fixtures/esm').test()
        }
      })
      suite.add(`${name} ts`, () => {
        const jiti = requireUncached('../..')(__filename, { transform: fn(), cache: false })

        for (let i = 0; i < 3; i++) {
          jiti('../fixtures/typescript').test()
        }
      })
    } else {
      suite.add(`${name} init`, () =>
        requireUncached('../..')(__filename, { transform: fn(), cache: false })
      )
    }
  })

suite
  .on('cycle', (event) => {
    console.log(String(event.target))
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run()
