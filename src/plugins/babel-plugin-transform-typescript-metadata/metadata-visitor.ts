/**
 * Based on https://github.com/leonardfactory/babel-plugin-transform-typescript-metadata
 * Copyright (c) 2019 Leonardo Ascione [MIT]
 */

import { NodePath, types as t } from "@babel/core";
import { serializeType } from "./serialize-type";

function createMetadataDesignDecorator(
  design:
    | "design:type"
    | "design:paramtypes"
    | "design:returntype"
    | "design:typeinfo",
  typeArg: t.Expression | t.SpreadElement | t.JSXNamespacedName,
): t.Decorator {
  return t.decorator(
    t.logicalExpression(
      "||",
      t.optionalCallExpression(
        t.memberExpression(t.identifier("Reflect"), t.identifier("metadata")),
        [t.stringLiteral(design), typeArg as unknown as t.Expression],
        true,
      ),
      t.arrowFunctionExpression([t.identifier("t")], t.identifier("t")),
    ),
  );
}

export function metadataVisitor(
  classPath: NodePath<t.ClassDeclaration>,
  path: NodePath<t.ClassProperty | t.ClassMethod>,
) {
  const field = path.node;
  const classNode = classPath.node;

  switch (field.type) {
    case "ClassMethod": {
      const decorators =
        field.kind === "constructor" ? classNode.decorators : field.decorators;

      if (!decorators || decorators.length === 0) {
        return;
      }

      decorators!.push(
        createMetadataDesignDecorator("design:type", t.identifier("Function")),
      );
      decorators!.push(
        createMetadataDesignDecorator(
          "design:paramtypes",
          t.arrayExpression(
            field.params.map((param) => serializeType(classPath, param)),
          ),
        ),
      );
      // Hint: `design:returntype` could also be implemented here, although this seems
      // quite complicated to achieve without the TypeScript compiler.
      // See https://github.com/microsoft/TypeScript/blob/f807b57356a8c7e476fedc11ad98c9b02a9a0e81/src/compiler/transformers/ts.ts#L1315
      break;
    }

    case "ClassProperty": {
      if (!field.decorators || field.decorators.length === 0) {
        return;
      }

      if (
        !field.typeAnnotation ||
        field.typeAnnotation.type !== "TSTypeAnnotation"
      ) {
        return;
      }

      field.decorators!.push(
        createMetadataDesignDecorator(
          "design:type",
          serializeType(classPath, field),
        ),
      );
      break;
    }
  }
}
