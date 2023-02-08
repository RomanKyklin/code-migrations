import * as fs from "fs";
import * as path from "path";
import yargs from "yargs";
import * as babel from "@babel/parser";
import generate from "@babel/generator";
import * as prettier from "prettier";
import * as eslint from "eslint";
import * as babelCore from "@babel/core";

import { Options, ProcessArgs, TransformFunction } from "./types/types";
import glob from "glob";

function parseArgumentsIntoOptions(rawArgs: ProcessArgs): Options {
  const args = yargs(rawArgs)
    .option("path", {
      alias: "path",
      type: "string",
      demandOption: true,
    })
    .option("transform", {
      alias: "transform",
      type: "string",
      demandOption: true,
    })
    .parseSync();

  return {
    path: args.path,
    transform: args.transform,
  };
}

function traverseAST(
  ast: babel.ParseResult<any>,
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

function lint(code: string): void {
  const linter = new eslint.Linter();
  const lintResult = linter.verify(code, {
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "double"],
    },
  });

  if (lintResult.length > 0) {
    console.error("Lint errors found:");
    lintResult.forEach((error) => {
      console.error(
        `- ${error.message} at line ${error.line} column ${error.column}`
      );
    });
  } else {
    console.log("No lint errors found.");
  }
}

function getAST(code: string): babel.ParseResult<any> {
  return babel.parse(code, {
    sourceType: "module",
    plugins: ["typescript"],
  });
}

function globPromise(
  pattern: string,
  options: glob.IOptions
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    glob(pattern, options, (err, files) => {
      if (err) {
        reject(err as Error | null);
      } else {
        resolve(files as string[]);
      }
    });
  });
}

async function handlePaths(
  paths: Array<string>,
  visitor: babelCore.Visitor
): Promise<void> {
  if (paths == null || paths.length === 0) {
    throw new Error("Paths is not defined or is empty");
  }

  if (visitor == null) {
    throw new Error("Visitor is not defined");
  }

  for (const path of paths) {
    try {
      const content = await fs.promises.readFile(path, "utf-8");
      handleFile(content, path, visitor);
    } catch (error: any) {
      throw new Error("Error reading file: " + error.message);
    }
  }
}

function handleFile(
  content: string,
  path: string,
  visitor: babelCore.Visitor
): void {
  if (path == null) {
    throw new Error("Path is not defined");
  }

  if (content == null) {
    throw new Error("Content is not defined");
  }

  if (visitor == null) {
    throw new Error("Visitor is not defined");
  }

  try {
    const ast = getAST(content);
    traverseAST(ast, visitor);

    const code = generate(ast).code;

    const formattedCode = prettier.format(code, { parser: "babel" });
    fs.writeFileSync(path, formattedCode, "utf-8");

    lint(formattedCode);
  } catch (error: any) {
    throw new Error("Error parsing file: " + error.message);
  }
}

async function getVisitor(path: string): Promise<TransformFunction> {
  if (path == null) {
    throw new Error("Path is not defined");
  }

  let visitor: TransformFunction | null = null;

  try {
    visitor = (await import(path)).default;
  } catch (error: any) {
    throw new Error("Error importing transform file: " + error.message);
  }

  if (visitor == null || typeof visitor !== "function") {
    throw new Error("Visitor is not defined or is not an function");
  }

  return visitor;
}

async function getPaths(
  path: string | RegExp,
  transform: string | RegExp
): Promise<{
  paths: string[];
  transformPaths: string[];
}> {
  const ignore = ["**/node_modules/**", "**/dist/**", "**/build/**"];
  const [paths, transformPaths] = await Promise.all([
    globPromise(__dirname + "/" + path, { ignore }),
    globPromise(__dirname + "/" + transform, { ignore }),
  ]);

  if (paths.length === 0) {
    throw new Error("No path files found");
  }

  if (transformPaths.length === 0) {
    throw new Error("No transform files found");
  }

  return { paths, transformPaths };
}

async function main(): Promise<void> {
  const { path, transform } = parseArgumentsIntoOptions(process.argv.slice(2));

  if (path == null || transform == null) {
    throw new Error("Path or transform is not defined");
  }

  try {
    const { paths, transformPaths } = await getPaths(path, transform);
    const getVisitorFunction = await getVisitor(transformPaths[0]);
    const visitor = getVisitorFunction(babelCore.types);

    handlePaths(paths, visitor);
  } catch (error: any) {
    throw new Error("Error: " + error.message);
  }
}

main();
