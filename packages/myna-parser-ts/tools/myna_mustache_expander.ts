import { toMnast, MnastNode } from "myna-parser-mnast";
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

// Given a mnast node, a data object, and an optional string, expands the nodes and returns the result as a string.
function expandMnast(node: MnastNode, data: any): string {
  if (!node) return "";

  const keyNode = node.children?.find(c => c.type === 'key');
  const key = keyNode ? keyNode.value : '';
  let val = data && key in data ? data[key] : "";

  if (typeof val === "function") throw new Error("Functions are not supported");

  switch (node.type) {
    case "seq":
    case "choice":
    case "document":
    case "sectionContent":
    case "content":
    case "guardedSeq":
    case "advanceOneOrMoreWhileNot":
      return node.children?.map((c: MnastNode) => expandMnast(c, data)).join("") || "";
    case "comment":
      return "";
    case "plainText":
      return node.value || "";
    case "section": {
      const content = node.children?.find(c => c.type === 'sectionContent');
      if (!content) return "";
      if (typeof val === "boolean" || typeof val === "number" || typeof val === "string") {
        return val ? expandMnast(content, data) : "";
      } else if (Array.isArray(val)) {
        return val.map((x) => expandMnast(content, mergeObjects(data, x))).join("");
      } else if (val && typeof val === 'object') {
        return expandMnast(content, mergeObjects(data, val));
      }
      // Handles cases where val is falsy but not an empty array (e.g. null, undefined)
      return "";
    }
    case "invertedSection": {
      const content = node.children?.find(c => c.type === 'sectionContent');
      if (!content) return "";
      if (!val || (Array.isArray(val) && val.length === 0)) {
        return expandMnast(content, data);
      }
      return "";
    }
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
    case "key":
        // Keys are handled by their parents, return empty string
        return "";
  }
  throw new Error(`Unrecognized mnast node ${node.type}`);
}

// Expands text containing CTemplate delimiters "{{" using the data object
export function expand(template: string, data: any): string {
  if (template.indexOf("{{") >= 0) {
    const ast = Myna.parsers.mustache(template);
    if (!ast) return template;
    const mnastTree = toMnast(ast);
    let result = expandMnast(mnastTree, data);
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
