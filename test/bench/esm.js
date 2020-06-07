console.time('esm_init')
const esm = require('esm')(module, { cache: false })
console.timeEnd('esm_init')

for (let i = 0; i < 3; i++) {
  console.time('esm_require')
  esm('../fixtures/esm').test()
  console.timeEnd('esm_require')
}
