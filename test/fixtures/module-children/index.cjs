const { createJiti } = require("../../../lib/jiti.cjs");
const path = require("node:path");

const jiti = createJiti(__filename);

function children(file) {
  return jiti.cache[jiti.resolve("./" + file)].children
    .map((child) => path.basename(child.filename))
    .join(", ");
}

// Another tree loads x.ts, so b.ts finds it in require.cache
jiti("./x.ts");
console.log("b:", jiti("./b.ts").join(", "));
console.log("b children:", children("b.ts"));
