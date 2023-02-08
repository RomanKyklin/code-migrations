import { Visitor } from "@babel/core";
import * as babelCore from "@babel/core";

export type Types = typeof babelCore.types;
export type TransformFunction = (types: Types) => Visitor;
export type ProcessArgs = string[];
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
