const Benchmark = require('benchmark')
const suite = new Benchmark.Suite()

const transformers = [
  ['babel', () => undefined],
  ['esbuild-async', () => require('../../dist/esbuild-async')],
  ['esbuild-sync', () => require('../../dist/esbuild-sync')]
]

const test = process.argv[2]

if (test === 'fixture') {
  suite.add('esm js', () => {
    const esm = require('esm')(module)
    for (let i = 0; i < 3; i++) {
      esm('../fixtures/esm').test()
    }
  })
} else {
  suite.add('esm init', () => require('esm')(module))
}

transformers
  .sort(() => Math.random() - 0.5)
  .forEach(([name, fn]) => {
    if (test === 'fixture') {
      suite.add(`${name} js`, () => {
        const jiti = require('../..')(__filename, { transform: fn() })

        for (let i = 0; i < 3; i++) {
          jiti('../fixtures/esm').test()
        }
      })
      suite.add(`${name} ts`, () => {
        const jiti = require('../..')(__filename, { transform: fn() })

        for (let i = 0; i < 3; i++) {
          jiti('../fixtures/typescript').test()
        }
      })
    } else {
      suite.add(`${name} init`, () =>
        require('../..')(__filename, { transform: fn() })
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
