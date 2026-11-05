(globalThis as { evaluations?: number }).evaluations = 0;

for (let i = 0; i < 2; i++) {
  try {
    console.log("value:", require("./fail").value);
  } catch (error) {
    console.log("error:", (error as Error).message);
  }
}

for (let i = 0; i < 2; i++) {
  try {
    require("../error-parse");
    console.log("parse: loaded");
  } catch {
    console.log("parse: error");
  }
}

// Native ESM and the register hook have no module.children
if (typeof module !== "undefined" && module.children) {
  console.log("children:", module.children.length);

  require("./parent");
  const parent = module.children.find((child) =>
    child.filename.endsWith("parent.ts"),
  );
  console.log("parent children:", parent?.children.length);
}

// Mark file as module for typescript
export default {};
