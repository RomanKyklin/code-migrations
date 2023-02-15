import { Visitor } from "@babel/core";
import { Types, TransformFunction } from "../types/types";
import {
  Identifier,
  identifier,
  importDeclaration,
  importSpecifier,
  stringLiteral,
} from "@babel/types";

const transform: TransformFunction = (t: Types): Visitor => {
  const newImportDeclaration = importDeclaration(
    [
      importSpecifier(
        identifier("SOME_CONSTANT_1"),
        identifier("SOME_CONSTANT_1")
      ),
      importSpecifier(
        identifier("SOME_CONSTANT_2"),
        identifier("SOME_CONSTANT_2")
      ),
      importSpecifier(
        identifier("SOME_CONSTANT_3"),
        identifier("SOME_CONSTANT_3")
      ),
    ],
    stringLiteral("@bimeister/frontend.constants")
  );

  return {
    Program(path) {
      path.unshiftContainer("body", newImportDeclaration);
    },
    // transform type UUID to type NullUuid
    TSTypeReference(path) {
      const typeName = path.node.typeName as Identifier;

      if (typeName.name === "Uuid") {
        typeName.name = "NullUuid";
      }
    },
    ImportDeclaration(path) {
      // remove imports
      const source = path.node.source.value;
      if (
        source === "@app/constants/some-constant-1.const" ||
        source === "@app/constants/some-constant-2.const" ||
        source === "@app/constants/some-constant-3.const"
      ) {
        path.remove();
        return
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
  };
};

export default transform;
