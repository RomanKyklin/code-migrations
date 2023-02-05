new Function(
  "path",
  "types",
  `const node = path.node;
if (!types.isFunctionDeclaration(node)) return;
path.replaceWith(types.stringTypeAnnotation());`
);
