import * as fs from "fs";
import * as path from "path";
import yargs from "yargs";
import * as babel from "@babel/parser";
import generate from "@babel/generator";
import * as prettier from "prettier";
import * as eslint from "eslint";
import * as babelCore from "@babel/core";
import * as types from "@babel/types";
import { config } from "./config/config";
import {
  Content,
  Options,
  ProcessArgs,
  type TransformFunction,
} from "./types/types";

function parseArgumentsIntoOptions(rawArgs: ProcessArgs): Options {
  const args = yargs(rawArgs)
    .option("path", {
      alias: "path",
      type: "string",
      demandOption: true,
    })
    .parseSync();

  return {
    path: args.path,
  };
}

function traverseAST(
  ast: babel.ParseResult<any>,
  transformFunc: TransformFunction
): void {
  const visitor = {
    enter(path) {
      transformFunc(path, types);
    },
  };

  babelCore.traverse(ast, visitor);
}

async function readDirectoryFiles(dir: string): Promise<Array<Content>> {
  try {
    const files = await fs.promises.readdir(dir);
    const pattern = config.filesRegex;
    const filteredByPattern = files.filter((file) => pattern.test(file));

    const contents = await Promise.all(
      filteredByPattern.map(async (file) => {
        const filePath = path.join(dir, file);
        const content = await fs.promises.readFile(filePath, "utf-8");
        return { file, content: content.toString() };
      })
    );
    return contents;
  } catch (error) {
    throw error;
  }
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

function generateCodeFromAST(ast: babel.ParseResult<any>): string {
  return generate(ast).code;
}

function handle(
  contents: Array<Content>,
  transformFunc: TransformFunction
): void {
  for (const file of contents) {
    const ast = getAST(file.content);
    traverseAST(ast, transformFunc);
    const code = generateCodeFromAST(ast);

    const formattedCode = prettier.format(code, { parser: "babel" });
    fs.writeFileSync("testGeneratedCode.ts", formattedCode, "utf-8");

    lint(formattedCode);
  }
}

async function main(): Promise<void> {
  const { path } = parseArgumentsIntoOptions(process.argv.slice(2));

  const [contents] = await Promise.all([
    readDirectoryFiles(__dirname + "/" + path),
  ]);
  handle(contents, config.transformFunction);
}

main();
