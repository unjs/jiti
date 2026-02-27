import { createJiti } from "../../../lib/jiti.mjs";

const jiti = createJiti(import.meta.url, { tsconfigPaths: true });

const mod = jiti("~/src/config.ts");

console.log(mod.appName);
