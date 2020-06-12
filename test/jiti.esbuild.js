const jiti = require('..')(__filename, {
  debug: true,
  cache: false,
  transform: 'esbuild'
})

console.log(jiti('./fixtures/esm').test())
console.log(jiti('./fixtures/typescript').test())
