# Sample Tools 

This folder contains a number of JavaScript tools built using Myna parsers. 
These tools have been refactored to use **mnast** (Myna Abstract Syntax Tree), a **Unist** compatible syntax tree format, demonstrating how Myna can integrate with the wider Unist ecosystem.

- `myna_arithmetic_evaluator` - Demonstrates how to write an evaluator for arithmetic expressions by converting the Myna AST to a mnast tree and recursively evaluating it.
- `myna_blog_generator` - This is a work in progress for a static markdown to HTML static blog generator.
- `myna_escape_html_chars` - A sample tool that converts reserved characters to HTML entities, using `unist-util-visit` to process the mnast nodes.
- `myna_markdown_to_html` - Converts Git-flavored markdown documents to HTML by transforming the parse tree to mnast and recursively generating HTML.
- `myna_mustache_expander` - A simple [mustache](http://mustache.github.io/) clone that expands templates, refactored to operate on a mnast tree.

To see examples of how to use these tools, see the [tests](https://github.com/cdiggins/myna-parser/tree/master/tests).
