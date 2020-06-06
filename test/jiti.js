const jiti = require('..')(__filename)

console.log(jiti('./fixtures/esm').test())
console.log(jiti('./fixtures/typescript').test())
