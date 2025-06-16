import { Myna } from "../src";

// Evaluates an arithmetic expression
export function evaluateArithmetic(text: string): number {
  // Parse the input text
  let ast = Myna.parsers.arithmetic(text);
  if (!ast) {
    throw new Error("Failed to parse arithmetic expression: " + text);
  }

  return evaluateArithmeticAst(ast);
}

function evaluateArithmeticAst(exprNode: Myna.AstNode) {
  switch (exprNode.rule.name) {
    case "expr": {
      return evaluateArithmeticAst(exprNode.children[0]);
    }
    case "sum": {
      let v = evaluateArithmeticAst(exprNode.children[0]);
      for (let i = 1; i < exprNode.children.length; ++i) {
        let child = exprNode.children[i];
        switch (child.rule.name) {
          case "addExpr":
            v += evaluateArithmeticAst(child);
            break;
          case "subExpr":
            v -= evaluateArithmeticAst(child);
            break;
          default:
            throw "Unexpected expression " + child.rule.name;
        }
      }
      return v;
    }
    case "product": {
      let v = evaluateArithmeticAst(exprNode.children[0]);
      for (let i = 1; i < exprNode.children.length; ++i) {
        let child = exprNode.children[i];
        switch (child.rule.name) {
          case "mulExpr":
            v *= evaluateArithmeticAst(child);
            break;
          case "divExpr":
            v /= evaluateArithmeticAst(child);
            break;
          default:
            throw "Unexpected expression " + child.rule.name;
        }
      }
      return v;
    }
    case "prefixExpr": {
      let v = evaluateArithmeticAst(
        exprNode.children[exprNode.children.length - 1]
      );
      for (let i = exprNode.children.length - 2; i >= 0; --i)
        if (exprNode.children[i].allText == "-") v = -v;
      return v;
    }
    case "parenExpr":
      return evaluateArithmeticAst(exprNode.children[0]);
    case "number":
      return Number(exprNode.allText);
    case "addExpr":
      return evaluateArithmeticAst(exprNode.children[0]);
    case "subExpr":
      return evaluateArithmeticAst(exprNode.children[0]);
    case "mulExpr":
      return evaluateArithmeticAst(exprNode.children[0]);
    case "divExpr":
      return evaluateArithmeticAst(exprNode.children[0]);
    default:
      throw "Unrecognized expression " + exprNode.rule.name;
  }
}
