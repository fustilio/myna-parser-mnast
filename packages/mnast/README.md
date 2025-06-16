# myna-parser-mnast

**Unist compatibility for Myna parser AST/CST**

This package provides conversion utilities to transform [Myna parser](https://github.com/cdiggins/myna-parser) AST/CST nodes into [Unist](https://github.com/syntax-tree/unist)-compatible nodes (mnast), and back. It is designed for use in the JavaScript/TypeScript ecosystem where Unist is a common interface for syntax trees.

## About

- **myna-parser-mnast** is an extension for Unist compatibility, built on top of the original [Myna parser](https://github.com/cdiggins/myna-parser) by Christopher Diggins.
- This package is maintained by Francis Lee and contributors.
- The original Myna parser is MIT licensed (see License section below).

**Note:** There is also a related package, `myna-parser-ts` (currently unpublished), which includes a rewrite of the tests for the Myna parser. However, the core `myna.ts` remains the same as the original by Christopher Diggins. This is for improved testing and maintainability, but does not alter the core parsing logic.

## New in vNext: Fully Generic, Type-Safe API

- `toMnast` and `fromMnast` are now **fully generic** and type-safe.
- You can define a grammar-specific node map and get type inference and type guards for your nodes.
- TypeScript will help you extend and use mnast nodes for your grammar with full safety and autocompletion.

## Installation

```bash
npm install myna-parser-mnast
```

## Usage

### 1. Define a Grammar-Specific Node Map

```typescript
import { MnastNode, toMnast, fromMnast } from 'myna-parser-mnast';

type CsvMnastNodeMap = {
  field: { value: string; children?: never };
  record: { children: CsvMnastNode[]; value?: never };
  file: { children: CsvMnastNode[]; value?: never };
};
type CsvMnastNode = MnastNode<CsvMnastNodeMap>;
```

### 2. Convert Myna AST to mnast (with type safety)

```typescript
const mynaNode = { /* ...from Myna parser... */ };
const mnastNode = toMnast<CsvMnastNodeMap>(mynaNode);
```

### 3. Convert mnast back to Myna AST

```typescript
const mynaNodeAgain = fromMnast<CsvMnastNodeMap>(mnastNode);
```

### 4. Type Guards and Inference

You can define type guards for your node types:

```typescript
type CsvFieldNode = Extract<CsvMnastNode, { type: 'field' }>;
type CsvRecordNode = Extract<CsvMnastNode, { type: 'record' }>;

function isFieldNode(node: CsvMnastNode): node is CsvFieldNode {
  return node.type === 'field';
}

function isRecordNode(node: CsvMnastNode): node is CsvRecordNode {
  return node.type === 'record';
}

if (isFieldNode(mnastNode)) {
  // TypeScript infers CsvFieldNode
  console.log(mnastNode.value);
}
```

### 5. Runtime Type Guard Example

```typescript
import { isMnastNode } from 'myna-parser-mnast';

if (isMnastNode<CsvMnastNodeMap>(mnastNode, 'field')) {
  // Safe to treat as CsvFieldNode
}
```

## API

### `toMnast<T extends MnastNodeMap>(node: any, options?: MnastConversionOptions): MnastNode<T>`
Converts a Myna AST node to a mnast (Unist-compatible) node, with type safety for your grammar.

### `fromMnast<T extends MnastNodeMap>(node: MnastNode<T>): any`
Converts a mnast node back to a Myna AST node, with type safety for your grammar.

### Types
See [src/types.ts](./src/types.ts) for full type definitions and how to extend mnast for your grammar.

## Extending mnast for Your Grammar

- Define a node map for your grammar.
- Use the generic API for type-safe conversion and manipulation.
- Use type guards and discriminated unions for ergonomic, safe code.

## License

### myna-parser-mnast

MIT License

Copyright (c) 2024 Francis Lee

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

### Original Myna Parser

This package is based on the original [Myna parser](https://github.com/cdiggins/myna-parser) by Christopher Diggins, which is also licensed under the MIT License:

> MIT License
>
> Copyright (c) 2017 Christopher Diggins
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.

## Authors

- **Francis Lee** – Unist compatibility, mnast, and refactoring
- **Christopher Diggins** – Original Myna parser

```typescript
interface MnastNode {
    type: string;
    position?: Position;
    children?: MnastNode[];
    value?: string;
    data?: {
        rule?: any;
        fullName?: string;
        [key: string]: any;
    };
}
```

### `Position`

```typescript
interface Position {
    start: Point;
    end: Point;
    indent?: number[];
}
```

### `Point`

```typescript
interface Point {
    line: number;
    column: number;
    offset: number;
}
```

## Examples

### Basic Conversion

```typescript
const mynaNode = {
    rule: { name: 'field' },
    input: 'a,1,"hello"',
    start: 0,
    end: 1,
    children: null,
    allText: 'a',
    isLeaf: true,
    fullName: 'csv.field'
};

const mnastNode = toMnast(mynaNode);
// {
//     type: 'field',
//     value: 'a',
//     position: {
//         start: { line: 1, column: 1, offset: 0 },
//         end: { line: 1, column: 2, offset: 1 }
//     },
//     data: {
//         rule: { name: 'field' },
//         fullName: 'csv.field',
//         isAST: true,
//         isCST: false
//     }
// }
```

### Custom Type Mapping

```typescript
const mnastNode = toMnast(mynaNode, {
    typeMapper: (node) => `custom_${node.rule.name}`
});
// {
//     type: 'custom_field',
//     ...
// }
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
