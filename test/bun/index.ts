import jiti from "../../lib/index";

const _jiti = jiti(import.meta.url, {});

// Jiti should bypass it's logic and prefer bun
_jiti("./fixtures.ts");

// Use bun directly
// require("./fixtures.mjs");
