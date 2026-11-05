const { createJiti } = require("../../../lib/jiti.cjs");

const jiti = createJiti(__filename);

// Separate jiti trees share a module only through require.cache
Promise.all([
  jiti.import("./a.ts", { default: true }),
  jiti.import("./b.ts", { default: true }),
]).then(([a, b]) => {
  console.log(
    "evaluations:",
    globalThis.concurrentRootsEvaluations,
    "same:",
    a === b,
  );
});
