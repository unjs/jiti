// eslint-disable-next-line import/no-duplicates
import imported from "./file.json";
// eslint-disable-next-line import/no-duplicates
import importedWithAssertion from "./file.json" assert { type: "json" };

const required = require("./file.json");

const debug = (label: string, value) =>
  console.log(label, ":", value, ".default:", value.default);

debug("Imported", imported);
debug("Imported with assertion", importedWithAssertion);
debug("Required", required);
// eslint-disable-next-line unicorn/prefer-top-level-await
import("./file.json").then((r) => debug("Dynamic Imported", r));
