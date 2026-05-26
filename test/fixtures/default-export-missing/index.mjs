import { createJiti } from "../../../lib/jiti.cjs";

const jiti = createJiti(import.meta.url);

try {
  await jiti.import("./named-only.ts", { default: true });
  console.log("missing default export test failed");
} catch (error) {
  console.log(String(error.message));
}
