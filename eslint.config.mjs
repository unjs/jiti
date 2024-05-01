import unjs from "eslint-config-unjs";

export default unjs({
  ignores: [
    "test/fixtures/error-*"
  ],
  rules: {
    "unicorn/no-null": 0
  },
});
