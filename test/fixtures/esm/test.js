const getStack = () => new Error("Boo").stack;

require("./utils.mjs");

export default async function test() {
  const utils = await import("./utils.mjs");
  console.log({ utils });
  return {
    file: __filename,
    dir: __dirname,
    "import.meta.url": import.meta.url,
  };
}
