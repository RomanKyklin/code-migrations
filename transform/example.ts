import { Visitor } from "@babel/core";
import { Types, TransformFunction } from "../types/types";
import { Identifier } from "@babel/types";

const transform: TransformFunction = (t: Types): Visitor => ({
  // transform type UUID to type NullUuid
  TSTypeReference(path) {
    const typeName = path.node.typeName as Identifier;

    if (typeName.name === "Uuid") {
      typeName.name = "NullUuid";
    }
  },
  ImportDeclaration(path) {
    // replace imports
    const source = path.node.source.value;
    if (
      source === "@app/constants/some-constant-1.const" ||
      source === "@app/constants/some-constant-2.const" ||
      source === "@app/constants/some-constant-3.const"
    ) {
      path.replaceWith(
        t.importDeclaration(
          path.node.specifiers,
          t.stringLiteral("@bimeister/frontend.constants")
        )
      );
    }

    if (path.node.source.value === "@app/declarations/types/uuid.type") {
      path.replaceWith(
        t.importDeclaration(
          path.node.specifiers,
          t.stringLiteral("@bimeister/types/uuid.type")
        )
      );

      path.node.specifiers.map((specifier) => {
        if (
          t.isImportSpecifier(specifier) &&
          t.isIdentifier(specifier.imported) &&
          specifier.imported.name === "Uuid"
        ) {
          specifier.imported.name = "NullUuid";
          specifier.local.name = "NullUuid";
        }
      });
    }
  },
});

export default transform;
