declare global {
  interface ImportMeta {
    custom: any;
  }
}

import.meta.custom = { hello: "world" };
console.log("hello!", import.meta.custom);

export {};
