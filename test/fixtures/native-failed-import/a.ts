import cjs from "./cjs/index.js";
import { esm } from "./esm.mjs";
import { legacy } from "./cjs/esm-syntax.js";

export const value: string = [cjs, esm, legacy].join(" ");
