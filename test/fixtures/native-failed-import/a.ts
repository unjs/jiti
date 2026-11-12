import cjs from "./cjs/index.js";
import { esm } from "./esm.mjs";
import pkg from "./package.json";

export const value: string = [cjs, esm, pkg.name].join(" ");
