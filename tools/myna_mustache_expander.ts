import { Myna } from "../src";
import { createMustacheGrammar } from "../grammars/grammar_mustache";
import { escapeHtmlChars } from "./myna_escape_html_chars";

// Create the template grammar and give it Myna
createMustacheGrammar(Myna);

// Creates a new object containing the properties of the first object and the second object.
// If any value has the same key in both values, the second object overrides the first.
function mergeObjects<T extends object>(a: T, b: T): T {
  const r = { ...a };
  for (const k in b) {
    r[k] = b[k];
  }
  return r;
}

// Given an AST node, a data object, and an optional string, expands the nodes and returns the result as a string.
function expandAst(ast: any, data: any): string {
  const keyNode = ast.child("key");
  const key = keyNode ? keyNode.allText : "";
  let val = data ? (key in data ? data[key] : "") : "";

  if (typeof val === "function") throw new Error("Functions are not supported");

  switch (ast.rule.name) {
    case "document":
    case "sectionContent":
      return ast.children.map((c: any) => expandAst(c, data)).join("");
    case "comment":
      return "";
    case "plainText":
      // Preserve all whitespace, including leading spaces
      return ast.allText;
    case "section":
      const content = ast.child("sectionContent");
      if (
        typeof val === "boolean" ||
        typeof val === "number" ||
        typeof val === "string"
      ) {
        if (val) return expandAst(content, data);
        else return "";
      } else if (Array.isArray(val)) {
        return val
          .map((x) => expandAst(content, mergeObjects(data, x)))
          .join("");
      } else {
        return expandAst(content, mergeObjects(data, val));
      }
    case "invertedSection":
      if (!val || (Array.isArray(val) && val.length === 0))
        return expandAst(ast.child("sectionContent"), data);
      return "";
    case "escapedVar":
      if (val) {
        let strVal = String(val);
        // Recursively expand if value contains mustache tags
        if (strVal.indexOf("{{") >= 0) {
          strVal = expand(strVal, data);
        }
        return escapeHtmlChars(strVal);
      }
      return "";
    case "unescapedVar":
      if (val) {
        let strVal = String(val);
        // Recursively expand if value contains mustache tags
        if (strVal.indexOf("{{") >= 0) {
          strVal = expand(strVal, data);
        }
        return strVal;
      }
      return "";
  }
  throw new Error(`Unrecognized AST node ${ast.rule.name}`);
}

// Expands text containing CTemplate delimiters "{{" using the data object
export function expand(template: string, data: any): string {
  if (template.indexOf("{{") >= 0) {
    const ast = Myna.parsers.mustache(template);
    let result = expandAst(ast, data);
    if (result.endsWith("\n")) {
      result = result.slice(0, -1);
    }
    if (result.startsWith("\n")) {
      result = result.slice(1);
    }
    return result;
  } else {
    return template;
  }
}
