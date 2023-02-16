import * as babel from "@babel/parser";
import * as babelCore from "@babel/core";
import { ParseResult, TransformFunction } from "../types/types";

export function traverseAST(
  ast: ParseResult,
  visitor: babelCore.Visitor
): void {
  if (ast == null) {
    throw new Error("AST is not defined");
  }

  if (visitor == null) {
    throw new Error("Visitor is not defined");
  }

  babelCore.traverse(ast, visitor);
}

export function getAST(code: string): ParseResult {
  return babel.parse(code, {
    sourceType: "module",
    plugins: ["typescript", "decorators-legacy"],
  });
}

export async function getVisitor(path: string): Promise<TransformFunction> {
  if (!path?.trim()) {
    throw new Error("Path is not defined");
  }

  let visitor: TransformFunction | null = null;

  try {
    visitor = (await import(path)).default;
  } catch (error: unknown) {
    throw new Error("Error while importing transform file");
  }

  if (typeof visitor !== "function") {
    throw new Error("Visitor is not defined or is not an function");
  }

  return visitor;
}
