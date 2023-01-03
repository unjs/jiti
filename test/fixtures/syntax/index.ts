// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
console.log("Optional chaining:", ({} as any)?.foo?.bar);

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_operator
console.log("Nullish coalescing:", 0 ?? 42);

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR_assignment
const obj1 = { duration: 50, title: "" };
obj1.duration ||= 10;
obj1.title ||= "title is empty.";
console.log("Logical or assignment:", obj1.duration, obj1.title);

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_nullish_assignment
const obj2 = { duration: 50, speed: null } as any;
obj2.duration ??= 10;
obj2.speed ??= 20;
console.log("Logical nullish assignment:", obj2.duration, obj2.speed);
