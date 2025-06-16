import { Myna, toMnast, MnastNode } from "../src";
import { createHtmlReservedCharsGrammar } from "../grammars/grammar_html_reserved_chars";
import { visit } from "unist-util-visit";

// Create the HTML reserved chars grammar
createHtmlReservedCharsGrammar(Myna);

// Given a character that belongs to one of the reserved HTML characters
// returns the entity representation. For all other text, returns the text
function charToEntity(text: string): string {
  if (!text) return "";
  if (text.length != 1) return text;
  switch (text) {
    case "&":
      return "&amp;";
    case "<":
      return "&lt;";
    case ">":
      return "&gt;";
    case '"':
      return "&quot;";
    case "'":
      return "&#039;";
  }
  return text;
}

// Returns a string, replacing all of the reserved characters with entities
export function escapeHtmlChars(text: string): string {
  const ast = Myna.parsers.html_reserved_chars(text);
  if (!ast) {
    return "";
  }

  const mnastTree = toMnast(ast);
  const parts: string[] = [];

  // Visit each leaf node which represents a token.
  visit(mnastTree, (node: MnastNode) => {
    // We are interested in the children of the root, which are the tokens.
    // These are leaf nodes and will have a `value`. The root node will not.
    if (node.value) {
      parts.push(charToEntity(node.value));
    }
  });

  // The visitor visits the root node first, which has no value, so we skip it.
  // Then it visits the children, which are the tokens we want.
  return parts.join("");
}
