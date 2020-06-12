const jiti = require('..')(__filename, {
  debug: true,
  cache: false,
  transform: 'esbuild-async'
})

console.log(jiti('./fixtures/esm').test())
console.log(jiti('./fixtures/typescript').test())
