import * as fs from "fs";
import * as path from "path";
import yargs from "yargs";
import * as babel from "@babel/parser";
import generate from "@babel/generator";
import * as prettier from "prettier";
import * as eslint from "eslint";
import * as babelCore from "@babel/core";
import * as t from "@babel/types";


function functionToStringTransformer(path) {
  const node = path.node;
  if (!t.isFunctionDeclaration(node)) return;
  path.replaceWith(t.stringTypeAnnotation());
};


function parseArgumentsIntoOptions(rawArgs): string {
  const args = yargs(rawArgs)
    .option("path", {
      alias: "path",
      type: "string",
      demandOption: true,
    })
    .parseSync();

  return args.path;
}

function traverseAST(ast: babel.ParseResult<any>): void {
  const visitor = {
    enter(path) {
      functionToStringTransformer(path);
    },
  };

  babelCore.traverse(ast, visitor);
}

async function readDirectoryFiles(
  dir: string
): Promise<Array<{ file: string; content: string }>> {
  try {
    const files = await fs.promises.readdir(dir);
    // TODO for testing purposes only
    const filteredForTesting = files.filter((file) => file.endsWith(".ts"));

    const contents = await Promise.all(
      filteredForTesting.map(async (file) => {
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

readDirectoryFiles(__dirname)
  .then((contents) => {
    for (const file of contents) {
      const ast = getAST(file.content);
      traverseAST(ast);
      const code = generateCodeFromAST(ast);

      const formattedCode = prettier.format(code, { parser: "babel" });
      fs.writeFileSync("testGeneratedCode.ts", formattedCode, "utf-8");

      lint(formattedCode);
    }
  })
  .catch((error) => {
    console.error(error);
  });
