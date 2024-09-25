/**
 * Based on https://github.com/leonardfactory/babel-plugin-transform-typescript-metadata
 * Copyright (c) 2019 Leonardo Ascione [MIT]
 */

import { NodePath, types as t } from "@babel/core";

/**
 * Helper function to create a field/class decorator from a parameter decorator.
 * Field/class decorators get three arguments: the class, the name of the method
 * (or 'undefined' in the case of the constructor) and the position index of the
 * parameter in the argument list.
 * Some of this information, the index, is only available at transform time, and
 * has to be stored. The other arguments are part of the decorator signature and
 * will be passed to the decorator anyway. But the decorator has to be called
 * with all three arguments at runtime, so this creates a function wrapper, which
 * takes the target and the key, and adds the index to it.
 *
 * Inject() becomes function(target, key) { return Inject()(target, key, 0) }
 *
 * @param paramIndex the index of the parameter inside the function call
 * @param decoratorExpression the decorator expression, the return object of SomeParameterDecorator()
 * @param isConstructor indicates if the key should be set to 'undefined'
 */
function createParamDecorator(
  paramIndex: number,
  decoratorExpression: t.Expression,
  isConstructor = false,
) {
  return t.decorator(
    t.functionExpression(
      null, // anonymous function
      [t.identifier("target"), t.identifier("key")],
      t.blockStatement([
        t.returnStatement(
          t.callExpression(decoratorExpression, [
            t.identifier("target"),
            t.identifier(isConstructor ? "undefined" : "key"),
            t.numericLiteral(paramIndex),
          ]),
        ),
      ]),
    ),
  );
}

export function parameterVisitor(
  classPath: NodePath<t.ClassDeclaration>,
  path: NodePath<t.ClassMethod> | NodePath<t.ClassProperty>,
) {
  if (path.type !== "ClassMethod") {
    return;
  }
  if (path.node.type !== "ClassMethod") {
    return;
  }
  if (path.node.key.type !== "Identifier") {
    return;
  }

  const methodPath = path as NodePath<t.ClassMethod>;
  const params = methodPath.get("params") || [];

  for (const param of params) {
    const identifier =
      param.node.type === "Identifier" || param.node.type === "ObjectPattern"
        ? param.node
        : // eslint-disable-next-line unicorn/no-nested-ternary
          param.node.type === "TSParameterProperty" &&
            param.node.parameter.type === "Identifier"
          ? param.node.parameter
          : null;

    if (identifier == null) {
      continue;
    }

    let resultantDecorator: t.Decorator | undefined;

    for (const decorator of (param.node as t.Identifier).decorators || []) {
      if (methodPath.node.kind === "constructor") {
        resultantDecorator = createParamDecorator(
          param.key as number,
          decorator.expression,
          true,
        );
        if (!classPath.node.decorators) {
          classPath.node.decorators = [];
        }
        classPath.node.decorators.push(resultantDecorator);
      } else {
        resultantDecorator = createParamDecorator(
          param.key as number,
          decorator.expression,
          false,
        );
        if (!methodPath.node.decorators) {
          methodPath.node.decorators = [];
        }
        methodPath.node.decorators.push(resultantDecorator);
      }
    }

    if (resultantDecorator) {
      (param.node as t.Identifier).decorators = null;
    }
  }
}
