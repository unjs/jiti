// Cycle between modules imported concurrently by the same parent
const [a, b] = await Promise.all([import("./a"), import("./b")]);
console.log(a.a, a.getB(), b.b, b.getA());

// Cycle between a module and the module it imports
const c = await import("./c");
console.log(c.c, c.getD());

// Mark file as module for typescript
export default {};
