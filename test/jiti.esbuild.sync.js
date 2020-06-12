const jiti = require('..')(__filename, {
  debug: true,
  cache: false,
  transform: 'esbuild',
  sync: true
})

console.log(jiti('./fixtures/esm').test())
console.log(jiti('./fixtures/typescript').test())
