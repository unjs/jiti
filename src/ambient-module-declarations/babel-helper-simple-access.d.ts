declare module "@babel/helper-simple-access" {
  export default function simplifyAccess(
    path: NodePath,
    bindingNames: Set<string>,
    includeUpdateExpression: boolean = true,
  ): void;
}
