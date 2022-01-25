
async function main () {
  await import('./async.mjs').then(m => console.log(m.async))
}

main().catch(console.error)
