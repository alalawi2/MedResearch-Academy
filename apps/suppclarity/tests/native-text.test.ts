import { test } from "node:test";
import { strict as assert } from "node:assert";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

function bareText(source: string, filename: string) {
  const ast = ts.createSourceFile(
    filename,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const problems: number[] = [];
  const textWrappers = new Set(["Text", "Copy", "Notice"]);
  function visit(node: ts.Node) {
    const isText = ts.isJsxText(node) && node.getText(ast).trim().length > 0;
    const expr = ts.isJsxExpression(node) ? node.expression : undefined;
    const isLiteral =
      expr &&
      (ts.isStringLiteralLike(expr) || ts.isNumericLiteral(expr)) &&
      expr.text !== "";
    if ((isText || isLiteral) && !ts.isJsxAttribute(node.parent)) {
      let container: ts.Node | undefined = node.parent;
      while (container && ts.isJsxFragment(container))
        container = container.parent;
      const tag =
        container && ts.isJsxElement(container)
          ? container.openingElement.tagName.getText(ast)
          : "";
      if (!textWrappers.has(tag))
        problems.push(
          ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1,
        );
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return problems;
}
async function files(directory: string): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await files(path)));
    else if (path.endsWith(".tsx")) result.push(path);
  }
  return result;
}
test("native screens never render literal text or explicit spaces outside text components", async () => {
  assert.equal(bareText('<Card>{" "}</Card>', "fixture.tsx").length, 1);
  assert.equal(
    bareText("<View>Unwrapped text</View>", "fixture.tsx").length,
    1,
  );
  assert.equal(
    bareText('<Card><Copy>{" "}Wrapped text</Copy></Card>', "fixture.tsx")
      .length,
    0,
  );
  const root = fileURLToPath(new URL("../src/", import.meta.url));
  const problems: string[] = [];
  for (const file of await files(root)) {
    for (const line of bareText(await readFile(file, "utf8"), file))
      problems.push(`${relative(root, file)}:${line}`);
  }
  assert.deepEqual(
    problems,
    [],
    "Bare text causes an iPhone runtime error: " + problems.join(", "),
  );
});
