const getStack = () => new Error("Boo").stack;

export default function test() {
  return {
    file: __filename,
    dir: __dirname,
    "import.meta.url": import.meta.url,
  };
}
