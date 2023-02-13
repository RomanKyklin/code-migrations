import generate from "@babel/generator";
import * as fs from "fs";
import glob from "glob";
import * as babelCore from "@babel/core";
import yargs from "yargs";
import { getAST, traverseAST } from "../ast/ast";
import { format, lint } from "../lint/lint";
import { ProcessArgs, Options } from "../types/types";
import { Node } from "@babel/types";

export function globPromise(
  pattern: string,
  options: glob.IOptions
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    glob(pattern, options, (err: Error | null, files: string[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

function writeContents(contents: string[]): void {
  try {
    contents.forEach((content) =>
      fs.writeFileSync("./test.ts", content, "utf-8")
    );
  } catch (e: unknown) {
    console.error(e);
    throw new Error("Error writing file");
  }
}

export async function handlePaths(
  paths: Array<string>,
  visitor: babelCore.Visitor
): Promise<void> {
  if (paths == null || paths.length === 0) {
    throw new Error("Paths is not defined or is empty");
  }

  if (visitor == null) {
    throw new Error("Visitor is not defined");
  }

  const contents: string[] = [];

  for (const path of paths) {
    try {
      const content = await fs.promises.readFile(path, "utf-8");
      contents.push(handleFile(content, path, visitor));
    } catch (error: unknown) {
      throw new Error("Error while reading file");
    }
  }

  writeContents(contents);
}

export function handleFile(
  content: string,
  path: string,
  visitor: babelCore.Visitor
): string {
  if (path?.trim()) {
    throw new Error("Path is not defined");
  }

  if (content?.trim()) {
    throw new Error("Content is not defined");
  }

  if (visitor == null) {
    throw new Error("Visitor is not defined");
  }

  try {
    const ast = getAST(content);
    traverseAST(ast, visitor);
    const formattedCode = format(generate(ast as Node).code);
    lint(formattedCode);
    return formattedCode;
  } catch (error: unknown) {
    throw new Error("Error parsing file");
  }
}

export async function getPaths(
  path: string | RegExp,
  transform: string | RegExp
): Promise<{
  paths: string[];
  transformPaths: string[];
}> {
  const ignore = ["**/node_modules/**", "**/dist/**", "**/build/**"];
  console.log(__dirname + "/" + path);
  
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

export function parseArgumentsIntoOptions(rawArgs: ProcessArgs): Options {
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
