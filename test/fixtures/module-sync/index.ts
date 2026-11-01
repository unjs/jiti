import { format } from "#dep";
import { format as nativeFormat } from "./lib/native.mjs";

// jiti should resolve "#dep" to the same file as Node.js does natively
console.log({ jiti: format, native: nativeFormat });
