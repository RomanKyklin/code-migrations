import * as babelCore from "@babel/core";
import { getVisitor } from "./ast/ast";
import { parseArgumentsIntoOptions, getPaths, handlePaths } from "./files/files";

(async function main(): Promise<void> {
  const { path, transform } = parseArgumentsIntoOptions(process.argv.slice(2));

  if (path == null || transform == null) {
    throw new Error("Path or transform is not defined");
  }

  try {
    const { paths, transformPaths } = await getPaths(path, transform);
    const getVisitorFunction = await getVisitor(transformPaths[0]);
    const visitor = getVisitorFunction(babelCore.types);

    handlePaths(paths, visitor);
  } catch (error: unknown) {
    let message = 'Error while running the program';

    if (error instanceof Error) {
      message += `: ${error.message}`;
    }
    
    throw new Error(message);
  }
})();
