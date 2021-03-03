
async function main () {
  await import('./async').then(console.log)
}

main().catch(console.error)
