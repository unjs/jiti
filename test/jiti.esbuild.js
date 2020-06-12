const jiti = require('..')(__filename, {
  debug: true,
  esbuild: true
})

console.log(jiti('./fixtures/esm').test())
console.log(jiti('./fixtures/typescript').test())
