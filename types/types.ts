import * as types from "@babel/types";

export type Types = typeof types;
export type TransformFunction = (path: any, types: Types) => void;
export type ProcessArgs = string[];
export interface Options {
  path: string;
}
export interface Content {
  file: string;
  content: string;
}
export interface Config {
  transformFunction: TransformFunction | Array<TransformFunction>;
  filesRegex: RegExp;
}
