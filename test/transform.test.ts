import proposalDecoratorsPlugin from "@babel/plugin-proposal-decorators";
import { describe, expect, it } from "vitest";
import transform from "../src/babel";

const decoratorPluginForms = [
  proposalDecoratorsPlugin,
  "@babel/plugin-proposal-decorators",
] as const;

function evaluate(code: string): Record<string, unknown> {
  const module = { exports: {} as Record<string, unknown> };
  new Function("exports", "module", code)(module.exports, module);
  return module.exports;
}

describe("transform", () => {
  it.each(decoratorPluginForms)(
    "allows configuring stage 3 decorators with %s",
    (plugin) => {
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
      expect(evaluate(result.code).kind).toBe("class");
    },
  );

  it.each(decoratorPluginForms)(
    "runs stage 3 decorators before the TypeScript transform with %s",
    (plugin) => {
      const result = transform({
        filename: "decorators.ts",
        source: `
          let kind;
          function decorator(value, context) {
            kind = context.kind;
          }
          class Example {
            declare id: string;
            @decorator
            value: number = 1;
          }
          export { kind };
          export const example = new Example();
        `,
        ts: true,
        babel: {
          plugins: [[plugin, { version: "2023-11" }]],
        },
      });

      expect(result.error).toBeUndefined();

      const exported = evaluate(result.code);
      expect(exported.kind).toBe("field");
      expect((exported.example as { value: number }).value).toBe(1);
    },
  );
});
