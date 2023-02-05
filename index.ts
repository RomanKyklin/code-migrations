import * as fs from "fs";
import * as path from "path";
import yargs from "yargs";
import * as babel from "@babel/parser";
import generate from "@babel/generator";
import * as prettier from "prettier";
import * as eslint from "eslint";

// interface MyArgv extends yargs.Argv {
//   path: string;
// }

async function readDirectoryFiles(
  dir: string
): Promise<Array<{ file: string; content: string }>> {
  try {
    const files = await fs.promises.readdir(dir);
    const contents = await Promise.all(
      files.map(async (file) => {
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

async function main() {
  //   const argv = await yargs.options({
  //     path: {
  //       alias: "p",
  //       describe: "The directory path",
  //       demandOption: true,
  //       type: "string",
  //     },
  //   }).argv;
  //   const directory = argv.path as MyArgv["path"];
}

readDirectoryFiles(__dirname)
  .then((contents) => {
    for (const content of contents) {
      console.log(content);

      const ast = babel.parse(content.content, {
        sourceType: "module",
        plugins: ["typescript"],
      });

      const code = generate(ast).code;
      const formattedCode = prettier.format(code, { parser: "babel" });
      fs.writeFileSync("testGeneratedCode.ts", formattedCode, "utf-8");

      const linter = new eslint.Linter();
      const lintResult = linter.verify(formattedCode, {
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
  })
  .catch((error) => {
    console.error(error);
  });
