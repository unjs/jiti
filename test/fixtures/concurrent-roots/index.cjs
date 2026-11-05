const { createJiti } = require("../../../lib/jiti.cjs");

const jiti = createJiti(__filename);

// Separate jiti trees share a module only through require.cache
const imports = Promise.all([
  jiti.import("./a.ts", { default: true }),
  jiti.import("./b.ts", { default: true }),
]);
// Sync require() of the module still evaluating does not evaluate it again
jiti("./shared.ts");

imports.then(([a, b]) => {
  console.log(
    "evaluations:",
    globalThis.concurrentRootsEvaluations,
    "same:",
    a === b,
  );
});
