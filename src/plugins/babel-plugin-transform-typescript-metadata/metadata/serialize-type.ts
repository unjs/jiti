import { NodePath, types as t } from '@babel/core';

type InferArray<T> = T extends Array<infer A> ? A : never;

type Parameter = InferArray<t.ClassMethod['params']> | t.ClassProperty;

function createVoidZero() {
  return t.unaryExpression('void', t.numericLiteral(0));
}

/**
 * Given a paramater (or class property) node it returns the first identifier
 * containing the TS Type Annotation.
 *
 * @todo Array and Objects spread are not supported.
 * @todo Rest parameters are not supported.
 */
function getTypedNode(param: Parameter): t.Identifier | t.ClassProperty | t.ObjectPattern | null {
  if (param == null) { return null; }

  if (param.type === 'ClassProperty') { return param; }
  if (param.type === 'Identifier') { return param; }
  if (param.type === 'ObjectPattern') { return param; }

  if (param.type === 'AssignmentPattern' && param.left.type === 'Identifier')
    { return param.left; }

  if (param.type === 'TSParameterProperty')
    { return getTypedNode(param.parameter); }

  return null;
}

export function serializeType(
  classPath: NodePath<t.ClassDeclaration>,
  param: Parameter
) {
  const node = getTypedNode(param);
  if (node == null) { return createVoidZero(); }

  if (!node.typeAnnotation || node.typeAnnotation.type !== 'TSTypeAnnotation')
    { return createVoidZero(); }

  const annotation = node.typeAnnotation.typeAnnotation;
  const className = classPath.node.id ? classPath.node.id.name : '';
  return serializeTypeNode(className, annotation);
}

function serializeTypeReferenceNode(
  className: string,
  node: t.TSTypeReference
) {
  /**
   * We need to save references to this type since it is going
   * to be used as a Value (and not just as a Type) here.
   *
   * This is resolved in main plugin method, calling
   * `path.scope.crawl()` which updates the bindings.
   */
  const reference = serializeReference(node.typeName);

  /**
   * We should omit references to self (class) since it will throw a
   * ReferenceError at runtime due to babel transpile output.
   */
  if (isClassType(className, reference)) {
    return t.identifier('Object');
  }

  /**
   * We don't know if type is just a type (interface, etc.) or a concrete
   * value (class, etc.).
   * `typeof` operator allows us to use the expression even if it is not
   * defined, fallback is just `Object`.
   */
  return t.conditionalExpression(
    t.binaryExpression(
      '===',
      t.unaryExpression('typeof', reference),
      t.stringLiteral('undefined')
    ),
    t.identifier('Object'),
    t.cloneDeep(reference)
  );
}

/**
 * Checks if node (this should be the result of `serializeReference`) member
 * expression or identifier is a reference to self (class name).
 * In this case, we just emit `Object` in order to avoid ReferenceError.
 */
export function isClassType(className: string, node: t.Expression): boolean {
  switch (node.type) {
    case 'Identifier': {
      return node.name === className;
    }
    case 'MemberExpression': {
      return isClassType(className, node.object);
    }
    default: {
      throw new Error(
        `The property expression at ${node.start} is not valid as a Type to be used in Reflect.metadata`
      );
    }
  }
}

function serializeReference(
  typeName: t.Identifier | t.TSQualifiedName
): t.Identifier | t.MemberExpression {
  if (typeName.type === 'Identifier') {
    return t.identifier(typeName.name);
  }
  return t.memberExpression(serializeReference(typeName.left), typeName.right);
}

type SerializedType =
  | t.Identifier
  | t.UnaryExpression
  | t.ConditionalExpression;

/**
 * Actual serialization given the TS Type annotation.
 * Result tries to get the best match given the information available.
 *
 * Implementation is adapted from original TSC compiler source as
 * available here:
 *  https://github.com/Microsoft/TypeScript/blob/2932421370df720f0ccfea63aaf628e32e881429/src/compiler/transformers/ts.ts
 */
function serializeTypeNode(className: string, node: t.TSType): SerializedType {
  if (node === undefined) {
    return t.identifier('Object');
  }

  switch (node.type) {
    case 'TSVoidKeyword':
    case 'TSUndefinedKeyword':
    case 'TSNullKeyword':
    case 'TSNeverKeyword': {
      return createVoidZero();
    }

    case 'TSParenthesizedType': {
      return serializeTypeNode(className, node.typeAnnotation);
    }

    case 'TSFunctionType':
    case 'TSConstructorType': {
      return t.identifier('Function');
    }

    case 'TSArrayType':
    case 'TSTupleType': {
      return t.identifier('Array');
    }

    case 'TSTypePredicate':
    case 'TSBooleanKeyword': {
      return t.identifier('Boolean');
    }

    case 'TSStringKeyword': {
      return t.identifier('String');
    }

    case 'TSObjectKeyword': {
      return t.identifier('Object');
    }

    case 'TSLiteralType': {
      switch (node.literal.type) {
        case 'StringLiteral': {
          return t.identifier('String');
        }

        case 'NumericLiteral': {
          return t.identifier('Number');
        }

        case 'BooleanLiteral': {
          return t.identifier('Boolean');
        }

        default: {
          /**
           * @todo Use `path` error building method.
           */
          throw new Error('Bad type for decorator' + node.literal);
        }
      }
    }

    case 'TSNumberKeyword':
    case 'TSBigIntKeyword' as any: { // Still not in ``@babel/core` typings
      return t.identifier('Number');
    }

    case 'TSSymbolKeyword': {
      return t.identifier('Symbol');
    }

    case 'TSTypeReference': {
      return serializeTypeReferenceNode(className, node);
    }

    case 'TSIntersectionType':
    case 'TSUnionType': {
      return serializeTypeList(className, node.types);
    }

    case 'TSConditionalType': {
      return serializeTypeList(className, [node.trueType, node.falseType]);
    }

    case 'TSTypeQuery':
    case 'TSTypeOperator':
    case 'TSIndexedAccessType':
    case 'TSMappedType':
    case 'TSTypeLiteral':
    case 'TSAnyKeyword':
    case 'TSUnknownKeyword':
    case 'TSThisType': {
      // case SyntaxKind.ImportType:
      break;
    }

    default: {
      throw new Error('Bad type for decorator');
    }
  }

  return t.identifier('Object');
}

/**
 * Type lists need some refining. Even here, implementation is slightly
 * adapted from original TSC compiler:
 *
 *  https://github.com/Microsoft/TypeScript/blob/2932421370df720f0ccfea63aaf628e32e881429/src/compiler/transformers/ts.ts
 */
function serializeTypeList(
  className: string,
  types: ReadonlyArray<t.TSType>
): SerializedType {
  let serializedUnion: SerializedType | undefined;

  for (let typeNode of types) {
    while (typeNode.type === 'TSParenthesizedType') {
      typeNode = typeNode.typeAnnotation; // Skip parens if need be
    }
    if (typeNode.type === 'TSNeverKeyword') {
      continue; // Always elide `never` from the union/intersection if possible
    }
    if (
      typeNode.type === 'TSNullKeyword' ||
      typeNode.type === 'TSUndefinedKeyword'
    ) {
      continue; // Elide null and undefined from unions for metadata, just like what we did prior to the implementation of strict null checks
    }
    const serializedIndividual = serializeTypeNode(className, typeNode);

    if (
      t.isIdentifier(serializedIndividual) &&
      serializedIndividual.name === 'Object'
    ) {
      // One of the individual is global object, return immediately
      return serializedIndividual;
    }
    // If there exists union that is not void 0 expression, check if the the common type is identifier.
    // anything more complex and we will just default to Object
    else if (serializedUnion) {
      // Different types
      if (
        !t.isIdentifier(serializedUnion) ||
        !t.isIdentifier(serializedIndividual) ||
        serializedUnion.name !== serializedIndividual.name
      ) {
        return t.identifier('Object');
      }
    } else {
      // Initialize the union type
      serializedUnion = serializedIndividual;
    }
  }

  // If we were able to find common type, use it
  return serializedUnion || createVoidZero(); // Fallback is only hit if all union constituients are null/undefined/never
}
