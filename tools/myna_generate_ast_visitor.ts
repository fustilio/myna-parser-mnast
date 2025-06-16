interface AstRule {
  name: string;
  astRuleDefn(): string;
}

interface Myna {
  grammarAstRules(grammarName: string): AstRule[];
}

/**
 * The createAstVisitor function creates a file of code that contains a Visitor object specialized
 * for walking the parse tree created from a grammar.
 *
 * This can be useful when constructing code for parsing special types of grammars
 */
function createAstVisitorFunction(rule: AstRule, lines: string[]): void {
  lines.push(
    `  this.visit_${rule.name} = function(ast: any, stack: any, state: any): void {`
  );
  lines.push(`    // ${rule.astRuleDefn()}`);
  lines.push("    // TODO: add custom implementation");
  lines.push("    this.visitChildren(ast, stack, state);");
  lines.push("  }");
}

function createAstVisitor(myna: Myna, grammarName: string): string {
  const lines: string[] = [
    `var ${grammarName}Visitor = new function()`,
    "{",
    "  this.visitNode = function(ast: any, state: any): void {",
    "    this['visit_' + child.name](child, state);",
    "  }",
    "  this.visitChildren = function(ast: any, state: any): void {",
    "    for (const child of ast.children)",
    "      this.visitNode(child, state);",
    "  }",
  ];

  const rules = myna.grammarAstRules(grammarName);
  for (const r of rules) {
    createAstVisitorFunction(r, lines);
  }

  lines.push("}");

  return lines.join("\n");
}

export default createAstVisitor;
