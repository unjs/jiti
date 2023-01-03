async function main() {
  await import("./async.mjs").then((m) => console.log(m.async));
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main().catch(console.error);
