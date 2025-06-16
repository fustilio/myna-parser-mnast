import { describe, test, expect, beforeAll, afterAll } from "vitest";
import fs from "fs";
import { Myna } from "../src";
import { mdToHtml } from "../tools/myna_markdown_to_html.ts";
import { createMarkdownGrammar } from "../grammars/grammar_markdown";

// Register the grammar
const markdownGrammar = createMarkdownGrammar(Myna);
Myna.registerGrammar("markdown", markdownGrammar, markdownGrammar.document);

const testUrlList = `## Themes

* https://github.com/mixu/markdown-styles
* https://themes.gohugo.io
* https://jekyllthemes.org
* https://en-ca.wordpress.org/themes
* https://colorlib.com/wp/free-wordpress-themes
* https://hexo.io/themes`;

describe("Markdown to HTML", () => {
  test("should convert markdown to HTML", () => {
    const html = mdToHtml(testUrlList);
    expect(typeof html).toBe("string");
    expect(html).toContain("<ul>");
  });

  test("should convert readme.md to HTML and write to file", () => {
    const md = fs.readFileSync("readme.md", "utf-8");
    const content = mdToHtml(md);
    expect(typeof content).toBe("string");
    fs.writeFileSync("tests/output/readme.html", content, {
      encoding: "utf-8",
    });
    const written = fs.readFileSync("tests/output/readme.html", "utf-8");
    expect(written).toBe(content);
  });
});
