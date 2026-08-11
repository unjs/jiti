import { createJiti } from "../../../lib/jiti.mjs";

const jiti = createJiti(import.meta.url, { tsconfigPaths: true });

jiti("./main.ts");
