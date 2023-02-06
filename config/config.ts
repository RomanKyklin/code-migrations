import { exampleTransform } from "../transform/example";
import { Config } from '../types/types';

export const config: Config = {
  transformFunction: exampleTransform,
  filesRegex: /\.ts$/,
};
