import.meta.custom = "custom";
console.log("hello!", import.meta.custom);
console.log(import.meta.resolve!("./resolve+custom.ts"));
