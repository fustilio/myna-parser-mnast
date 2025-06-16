import { Myna } from "../src";
import { createMarkdownGrammar } from "../grammars/grammar_markdown.js";

// Create the markdown grammar
createMarkdownGrammar(Myna);

// Returns the HTML for a start tag
function startTag(tag: string, attr?: Record<string, string>): string {
  let attrStr = "";
  if (attr) {
    attrStr =
      " " +
      Object.keys(attr)
        .map((k) => `${k} = "${attr[k]}"`)
        .join(" ");
  }
  return `<${tag}${attrStr}>`;
}

// Returns the HTML for an end tag
function endTag(tag: string): string {
  return `</${tag}>`;
}

// Returns HTML from a MarkDown AST
function mdAstToHtml(ast: any, lines: string[] = []): string[] {
  // Adds each element of the array as markdown
  function addArray(ast: any[]): string[] {
    for (const child of ast) mdAstToHtml(child, lines);
    return lines;
  }

  // Adds tagged content
  function addTag(tag: string, ast: any, newLine?: boolean): string[] {
    lines.push(startTag(tag));
    if (Array.isArray(ast)) addArray(ast);
    else mdAstToHtml(ast, lines);
    lines.push(endTag(tag));
    if (newLine) lines.push("\r\n");
    return lines;
  }

  function addLink(url: string, astOrText: any): string[] {
    lines.push(startTag("a", { href: url }));
    if (astOrText) {
      if (astOrText.children) addArray(astOrText.children);
      else lines.push(astOrText);
    }

    lines.push(endTag("a"));
    return lines;
  }

  function addImg(url: string): string[] {
    lines.push(startTag("img", { src: url }));
    lines.push(endTag("img"));
    return lines;
  }

  switch (ast.name) {
    case "heading": {
      const headingLevel = ast.children[0];
      const restOfLine = ast.children[1];
      const h = headingLevel.allText.length;
      switch (h) {
        case 1:
          return addTag("h1", restOfLine, true);
        case 2:
          return addTag("h2", restOfLine, true);
        case 3:
          return addTag("h3", restOfLine, true);
        case 4:
          return addTag("h4", restOfLine, true);
        case 5:
          return addTag("h5", restOfLine, true);
        case 6:
          return addTag("h6", restOfLine, true);
        default:
          throw new Error("Heading level must be from 1 to 6");
      }
    }
    case "paragraph":
      return addTag("p", ast.children, true);
    case "unorderedList":
      return addTag("ul", ast.children, true);
    case "orderedList":
      return addTag("ol", ast.children, true);
    case "unorderedListItem":
      return addTag("li", ast.children, true);
    case "orderedListItem":
      return addTag("li", ast.children, true);
    case "inlineUrl":
      return addLink(ast.allText, ast.allText);
    case "bold":
      return addTag("b", ast.children);
    case "italic":
      return addTag("i", ast.children);
    case "code":
      return addTag("code", ast.children);
    case "codeBlock":
      return addTag("pre", ast.children);
    case "quote":
      return addTag("blockquote", ast.children, true);
    case "link":
      return addLink(ast.children[1].allText, ast.children[0]);
    case "image":
      return addImg(ast.children[0]);
    default:
      if (ast.isLeaf) lines.push(ast.allText);
      else ast.children.forEach((c: any) => mdAstToHtml(c, lines));
  }
  return lines;
}

// Converts Markdown text to HTML
export function mdToHtml(input: string): string {
  const rule = Myna.allRules["markdown.document"];
  const ast = Myna.parse(rule, input);
  return mdAstToHtml(ast, []).join("");
}
