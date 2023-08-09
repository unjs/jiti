import jiti from "../../lib/index";

const _jiti = jiti(import.meta.url, {});

// Jiti should bypass it's logic and prefer bun
_jiti("./fixtures.mjs");

// Use bun directly
// require("./fixtures.mjs");
