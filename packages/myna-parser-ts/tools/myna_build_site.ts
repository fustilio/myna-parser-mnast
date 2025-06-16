import * as fs from "fs";

import { mdToHtml } from "./myna_markdown_to_html";
import { expand } from "./myna_mustache_expander";

// File paths
const templateFilePath: string = "website/index.template.html";
const markdownFilePath: string = "website/index.md";
const indexFilePath: string = "docs/index.html";

// logic
const template: string = fs.readFileSync(templateFilePath, "utf-8");
const markdown: string = fs.readFileSync(markdownFilePath, "utf-8");
const content: string = mdToHtml(markdown);
const index: string = expand(template, { content });

fs.writeFileSync(indexFilePath, index, "utf-8");

// Complete
process.exit();
