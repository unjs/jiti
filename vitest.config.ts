import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/fixtures.test.ts", "test/utils.test.ts"],
    coverage: {
      reporter: ["text", "clover", "json"],
      include: ["src/**/*.ts"],
    },
  },
});
