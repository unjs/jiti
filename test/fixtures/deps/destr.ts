import { destr } from "destr";
import destrDefault from "destr";

console.log(
  "npm:destr",
  destr("true") === true && destrDefault("true") === true,
);
