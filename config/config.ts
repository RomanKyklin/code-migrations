import { exampleImportsTransform, exampleTransform } from "../transform/example";
import { Config } from '../types/types';

export const config: Config = {
  transformFunction: [exampleImportsTransform, exampleTransform],
  filesRegex: /\.ts$/,
};
