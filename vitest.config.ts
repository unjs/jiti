import { defineConfig } from "vitest/config";

const exclude = ["node_modules", "dist", ".idea", ".git", ".cache"];
if (process.platform !== "win32") {
  exclude.push("test/windows.test.ts");
}

export default defineConfig({
  test: {
    coverage: {
      reporter: ["text", "clover", "json"],
    },
    exclude,
  },
});
