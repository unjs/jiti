import proposalDecoratorsPlugin from "@babel/plugin-proposal-decorators";
import { describe, expect, it } from "vitest";
import transform from "../src/babel";

describe("transform", () => {
  it.each([
    proposalDecoratorsPlugin,
    "@babel/plugin-proposal-decorators",
  ] as const)("allows configuring stage 3 decorators with %s", (plugin) => {
    const result = transform({
      filename: "decorators.ts",
      source: `
        let kind;
        function decorator(value, context) {
          kind = context.kind;
        }
        @decorator
        class Example {}
        export { kind };
      `,
      ts: true,
      babel: {
        plugins: [[plugin, { version: "2023-11" }]],
      },
    });

    expect(result.error).toBeUndefined();

    const module = { exports: {} as Record<string, unknown> };
    new Function("exports", "module", result.code)(module.exports, module);

    expect(module.exports.kind).toBe("class");
  });
});
