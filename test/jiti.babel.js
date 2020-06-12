const jiti = require('../dist/jiti')(__filename, {
  cache: false,
  debug: true
})

console.log(jiti('./fixtures/esm').test())
console.log(jiti('./fixtures/typescript').test())
