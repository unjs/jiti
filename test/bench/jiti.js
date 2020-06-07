console.time('jiti_init')
const jiti = require('../..')(__filename)
console.timeEnd('jiti_init')

for (let i = 0; i < 3; i++) {
  console.time('jiti_require')
  jiti('../fixtures/esm').test()
  console.timeEnd('jiti_require')
}
