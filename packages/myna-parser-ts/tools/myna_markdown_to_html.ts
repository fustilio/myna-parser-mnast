import { Myna, toMnast, MnastNode } from "../src/index.js";
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
        .map((k) => `${k}="${attr[k]}"`)
        .join(" ");
  }
  return `<${tag}${attrStr}>`;
}

// Returns the HTML for an end tag
function endTag(tag: string): string {
  return `</${tag}>`;
}

// Returns HTML from a MarkDown mnast AST
function mdMnastToHtml(node: MnastNode): string {
    if (!node) return "";

    // Different logic for leaf vs. parent nodes
    let content: string;
    if (node.children && node.children.length > 0) {
        content = node.children.map(mdMnastToHtml).join('');
    } else {
        content = node.value || '';
    }

    switch (node.type) {
        case "seq":
        case "choice":
        case "document":
            return content;
        case "heading": {
            const headingLevelNode = node.children[0];
            const restOfLineNode = node.children[1];
            const h = headingLevelNode.value.length;
            const headingContent = mdMnastToHtml(restOfLineNode);
            return startTag('h' + h) + headingContent + endTag('h' + h) + "\r\n";
        }
        case "paragraph":
            return startTag("p") + content + endTag("p") + "\r\n";
        case "unorderedList":
            return startTag("ul") + content + endTag("ul") + "\r\n";
        case "orderedList":
            return startTag("ol") + content + endTag("ol") + "\r\n";
        case "unorderedListItem":
        case "orderedListItem":
            return startTag("li") + content + endTag("li") + "\r\n";
        case "inlineUrl":
            return startTag("a", { href: content }) + content + endTag("a");
        case "bold":
            return startTag("b") + content + endTag("b");
        case "italic":
            return startTag("i") + content + endTag("i");
        case "code":
            return startTag("code") + content + endTag("code");
        case "codeBlock":
            return startTag("pre") + content + endTag("pre");
        case "quote":
            return startTag("blockquote") + content + endTag("blockquote") + "\r\n";
        case "link": {
            const textNode = node.children[0];
            const urlNode = node.children[1];
            const linkText = mdMnastToHtml(textNode);
            const url = urlNode.value;
            return startTag("a", { href: url }) + linkText + endTag("a");
        }
        case "image": {
            const urlNode = node.children[0];
            const url = urlNode.value;
            return startTag("img", { src: url });
        }
        default:
            // For other nodes (like text fragments), just return their content
            return content;
    }
}

// Converts Markdown text to HTML
export function mdToHtml(input: string): string {
  const rule = Myna.allRules["markdown.document"];
  const ast = Myna.parse(rule, input);
  if (!ast) return "";
  return mdMnastToHtml(toMnast(ast));
}
