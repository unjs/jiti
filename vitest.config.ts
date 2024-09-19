import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/fixturtes.test.ts", "test/utils.test.ts"],
  },
});
