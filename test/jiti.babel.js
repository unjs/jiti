const jiti = require('../dist/jiti')(__filename, {
  debug: true
})

console.log(jiti('./fixtures/esm').test())
console.log(jiti('./fixtures/typescript').test())
