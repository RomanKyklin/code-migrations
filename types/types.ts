import { Visitor } from "@babel/core";
import * as babelCore from "@babel/core";
import * as babel from "@babel/parser";

export type Types = typeof babelCore.types;
export type TransformFunction = (types: Types) => Visitor;
export type ProcessArgs = string[];
export type ParseResult = babel.ParseResult<babelCore.types.Node | babelCore.types.Node[] | null | undefined>

export interface Options {
  path: string | RegExp;
  transform: string | RegExp;
}
export interface Content {
  content: string;
}
export interface Config {
  transformFunction: TransformFunction | Array<TransformFunction>;
  filesRegex: RegExp;
}
