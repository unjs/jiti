console.log("process.env", Object.keys(process.env).includes("TEST"));
console.log("process.env.TEST", process.env.TEST);
console.log("process.env?.TEST", process.env?.TEST);

console.log("import.meta", Object.keys(import.meta.env).includes("TEST"));
console.log("import.meta.env.TEST", import.meta.env.TEST);
console.log("import.meta.env?.TEST", import.meta.env?.TEST);
