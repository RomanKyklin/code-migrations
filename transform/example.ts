import { Visitor } from "@babel/core";
import { Types, TransformFunction } from "../types/types";

const transform: TransformFunction = (t: Types): Visitor => ({
  enter(path: any) {
    const node = path.node;

    if (t.isImportDeclaration(node)) {
      path.node.source.value = "new-module";
    }

    if (t.isFunctionDeclaration(node)) {
      path.replaceWith(t.stringTypeAnnotation());
    }
  },
});

export default transform;
