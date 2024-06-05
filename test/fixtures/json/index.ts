import imported from "./file.json";

import importedWithAssertion from "./file.json" assert { type: "json" };

const required = require("./file.json");

const debug = (label: string, value) =>
  console.log(label, ":", value, ".default:", value.default);

debug("Imported", imported);
debug("Imported with assertion", importedWithAssertion);
debug("Required", required);

import("./file.json").then((r) => debug("Dynamic Imported", r));
