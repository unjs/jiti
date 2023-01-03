// estree-walker is a pure ESM package
import { walk } from "estree-walker";
import { parse } from "acorn";

const ast = parse('const foo = "bar"', { ecmaVersion: "latest" });

walk(ast, {
  enter(node) {
    console.log("Enter", node.type);
  },
});
