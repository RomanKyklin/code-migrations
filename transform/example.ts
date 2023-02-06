import { TransformFunction, Types } from "../types/types";

export const exampleTransform: TransformFunction = (
  path: any,
  types: Types
): void => {
  const node = path.node;
  if (!types.isFunctionDeclaration(node)) return;
  path.replaceWith(types.stringTypeAnnotation());
};
