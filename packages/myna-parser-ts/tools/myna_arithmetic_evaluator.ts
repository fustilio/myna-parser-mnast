import { Myna, toMnast, MnastNode } from "../src";
import { createArithmeticGrammar } from "../grammars/grammar_arithmetic";

// Ensure the grammar is registered
createArithmeticGrammar(Myna);

// Evaluates a mnast node from an arithmetic expression
function evaluateMnast(node: MnastNode): number {
  if (!node) {
    throw new Error("Cannot evaluate null node");
  }

  // For leaf nodes with a value (e.g. numbers)
  if (typeof node.value !== "undefined") {
    switch (node.type) {
      case "number":
        return Number(node.value);
    }
  }

  // For parent nodes, recurse on children
  if (node.children) {
    switch (node.type) {
      case "expr":
      case "parenExpr":
        return evaluateMnast(node.children[0]);
      case "prefixExpr": {
        let v = evaluateMnast(node.children[node.children.length - 1]);
        // Iterate backwards over prefix operators
        for (let i = node.children.length - 2; i >= 0; --i) {
          if (node.children[i].value === "-") {
            v = -v;
          }
        }
        return v;
      }
      case "sum": {
        let v = evaluateMnast(node.children[0]);
        for (let i = 1; i < node.children.length; ++i) {
          const child = node.children[i];
          switch (child.type) {
            case "addExpr":
              v += evaluateMnast(child);
              break;
            case "subExpr":
              v -= evaluateMnast(child);
              break;
            default:
              throw new Error("Unexpected expression in sum: " + child.type);
          }
        }
        return v;
      }
      case "product": {
        let v = evaluateMnast(node.children[0]);
        for (let i = 1; i < node.children.length; ++i) {
          const child = node.children[i];
          switch (child.type) {
            case "mulExpr":
              v *= evaluateMnast(child);
              break;
            case "divExpr":
              v /= evaluateMnast(child);
              break;
            default:
              throw new Error(
                "Unexpected expression in product: " + child.type
              );
          }
        }
        return v;
      }
      case "addExpr":
      case "subExpr":
      case "mulExpr":
      case "divExpr":
        return evaluateMnast(node.children[0]);
    }
  }

  throw new Error("Unrecognized mnast node type for evaluation: " + node.type);
}

// Evaluates an arithmetic expression
export function evaluateArithmetic(text: string): number {
  // Parse the input text to a Myna AST
  const ast = Myna.parsers.arithmetic(text);
  if (!ast) {
    throw new Error("Failed to parse arithmetic expression: " + text);
  }

  // Convert Myna AST to mnast tree
  const mnastTree = toMnast(ast);

  // Evaluate the mnast tree
  return evaluateMnast(mnastTree);
}
