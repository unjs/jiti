const jiti = require('..')(__filename, { debug: true })
console.log(jiti('./fixtures/esm').test())
console.log(jiti('./fixtures/typescript').test())
