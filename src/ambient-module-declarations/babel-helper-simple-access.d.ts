declare module "@babel/helper-simple-access" {
  import type { NodePath } from "@babel/traverse";

  export default function simplifyAccess(
    path: NodePath,
    bindingNames: Set<string>,
    includeUpdateExpression?: boolean,
  ): void;
}
