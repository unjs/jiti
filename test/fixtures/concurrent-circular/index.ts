// Cycle between modules imported concurrently by the same parent
const [a, b] = await Promise.all([import("./a"), import("./b")]);
console.log(a.a, a.getB(), b.b, b.getA());

// Cycle between a module and the module it imports
const c = await import("./c");
console.log(c.c, c.getD());

// Module awaiting a function from an evaluated module that imports it back
await import("./helper");
let timer: ReturnType<typeof setTimeout> | undefined;
const e = await Promise.race([
  import("./e"),
  new Promise<{ e: string; loaded: string }>((resolve) => {
    timer = setTimeout(() => resolve({ e: "timed out", loaded: "" }), 2000);
  }),
]).finally(() => clearTimeout(timer));
console.log(e.e, e.loaded);

// Mark file as module for typescript
export default {};
