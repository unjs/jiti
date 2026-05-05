import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/fixtures.test.ts", "test/utils.test.ts", "test/virtual-modules.test.ts", "test/esm-temp-file.test.ts"],
    coverage: {
      reporter: ["text", "clover", "json"],
      include: ["src/**/*.ts"],
    },
  },
});
