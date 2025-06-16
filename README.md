# myna-parser-unist Monorepo

A modern, TypeScript-first monorepo for the [Myna parsing library](https://github.com/cdiggins/myna-parser), with Unist compatibility and improved testing. This repository brings together the original Myna parser, new Unist/AST utilities, and a suite of tools and tests for robust parsing workflows in JavaScript/TypeScript.

## Packages

### [`mnast` (myna-parser-mnast)](./packages/mnast)
- **Description:** Utilities to convert Myna AST/CST nodes to [Unist](https://github.com/syntax-tree/unist)-compatible nodes (mnast) and back. Enables integration with the wider Unist ecosystem (e.g., mdast, hast, xast, nlcst).
- **Status:** Published as `myna-parser-mnast` on npm.
- **Docs:** [README](./packages/mnast/README.md)

### [`myna-parser-ts`](./packages/myna-parser-ts)
- **Description:** TypeScript port of the original Myna parser by Christopher Diggins, with a modernized test suite and improved maintainability.
- **Status:** Not published to npm (for local/testing use only).
- **Docs:** [README](./packages/myna-parser-ts/README.md)

## Getting Started

### Install (for mnast)
```bash
npm install myna-parser-mnast
```

### Example Usage
```typescript
import { toMnast, fromMnast } from 'myna-parser-mnast';
// Convert a Myna AST node to a mnast (Unist) node
const mnastNode = toMnast(mynaNode);
// Convert back
const mynaNode = fromMnast(mnastNode);
```

### Unist Operations Example
You can use standard [unist](https://github.com/syntax-tree/unist) utilities like `unist-util-visit` and `unist-util-is` with mnast nodes:

```typescript
import { visit } from 'unist-util-visit';
import { is } from 'unist-util-is';

// Visit all heading nodes in a mnast tree
visit(mnastNode, 'heading', (node) => {
  console.log('Found heading:', node.value);
});

// Check if a node is a paragraph
if (is('paragraph', someNode)) {
  // Do something with the paragraph node
}
```

For more, see the [mnast README](./packages/mnast/README.md) and [myna-parser-ts README](./packages/myna-parser-ts/README.md).

## Documentation
- For the Unist specification, utilities, and ecosystem, see the official [unist repository](https://github.com/syntax-tree/unist).

## Contributing
Contributions are welcome! Please open issues or pull requests.

## Authors
- **Christopher Diggins** – Original Myna parser
- **Francis Lee** – Unist compatibility, mnast, refactoring, and monorepo maintenance

## License
MIT. See [LICENSE](./packages/mnast/README.md#license) in each package for details.
