# Myna Mnast Conversion

This module provides functionality to convert Myna's Abstract Syntax Tree (AST) and Concrete Syntax Tree (CST) to be compatible with the [Unist](https://github.com/syntax-tree/unist) specification. We call this format **mnast** (Myna Abstract Syntax Tree).

## Installation

```bash
npm install myna-parser
```

## Usage

```typescript
import { toMnast, fromMnast } from 'myna-parser';

// Example Myna AST node (you would get this from Myna.parse)
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

// Convert a Myna AST node to a mnast node
const mnastNode = toMnast(mynaNode);

// Convert a mnast node back to a Myna node
const mynaNodeAgain = fromMnast(mnastNode);

// With options
const mnastNodeWithOptions = toMnast(mynaNode, {
    includePosition: true,    // Include position information
    includeMynaData: true,    // Include original Myna data
    typeMapper: (node) => `custom_${node.rule.name}`  // Custom type mapping
});
```

## API

### `toMnast(node: any, options?: MnastConversionOptions): MnastNode`

Converts a Myna AST node to a mnast node.

#### Options

- `includePosition` (boolean, default: true): Whether to include position information
- `includeMynaData` (boolean, default: true): Whether to include original Myna data
- `typeMapper` (function): Custom function to map node types

### `fromMnast(node: MnastNode): any`

Converts a mnast node back to a Myna AST node.

## Types

### `MnastNode`

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
