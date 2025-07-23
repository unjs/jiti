import assert from "node:assert";

const script = `export default {a: "A"}`;
const uri = "data:text/javascript;charset=utf-8," + encodeURIComponent(script);
try {
  require(uri);
  throw null;
} catch (error) {
  assert.ok(
    error instanceof Error,
    "Expected an error message for sync import of data URL",
  );
}
await import(uri);
