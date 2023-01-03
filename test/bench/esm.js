console.time("esm_init");
const esm = require("esm")(module);
console.timeEnd("esm_init");

for (let i = 0; i < 2; i++) {
  console.time("esm_require");
  esm("../fixtures/esm").test();
  console.timeEnd("esm_require");
}
