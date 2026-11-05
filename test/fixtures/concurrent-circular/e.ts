import "node:dns";
import { loadE } from "./helper";

export const e = "e";

// Imports this module again while it is still evaluating
export const loaded = await loadE();
