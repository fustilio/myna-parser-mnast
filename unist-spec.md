# Myna to Unist Specification

## Overview

This specification defines how to convert Myna's Abstract Syntax Tree (AST) and Concrete Syntax Tree (CST) outputs to be compatible with the [Unist](https://github.com/syntax-tree/unist) specification. The goal is to maintain all existing Myna functionality while providing a standardized tree structure that can be used with the broader Unist ecosystem.

## Current Myna AST Structure

Myna's AST nodes currently have the following structure:

```typescript
class AstNode {
    rule: Rule;           // The rule that created this node
    input: string;        // The input string being parsed
    start: number;        // Start position in input
    end: number;          // End position in input
    children: AstNode[];  // Child nodes (if any)
    
    // Properties
    name: string;         // Rule name
    fullName: string;     // Grammar name + rule name
    allText: string;      // Text content between start and end
    isLeaf: boolean;      // Whether node has children
}
```

## Unist Compatibility Requirements

To be compatible with Unist, nodes must implement the following interface:

```typescript
interface Node {
    type: string;         // Required: Type of the node
    position?: Position;  // Optional: Location information
    children?: Node[];    // Optional: Child nodes
    value?: string;       // Optional: Text content
    data?: object;        // Optional: Additional data
}

interface Position {
    start: Point;         // Start position
    end: Point;           // End position
    indent?: number[];    // Optional: Indentation levels
}

interface Point {
    line: number;         // Line number (1-indexed)
    column: number;       // Column number (1-indexed)
    offset: number;       // Character offset (0-indexed)
}
```

## Conversion Rules

1. **Node Type**
   - The `type` field should be set to the rule's `name` property
   - If the rule has a `type` property, use that instead
   - For leaf nodes, use `'text'` as the type

2. **Position Information**
   - Convert Myna's `start` and `end` offsets to Unist's `Position` format
   - Calculate line and column numbers from the input string
   - Store the original offset in the `offset` field

3. **Children**
   - Preserve the existing parent-child relationships
   - Convert all child nodes recursively using these same rules

4. **Value**
   - For leaf nodes, use the `allText` property as the `value`
   - For non-leaf nodes, omit the `value` field

5. **Data**
   - Store the original Myna-specific properties in the `data` field:
     - `rule`: The original rule reference
     - `fullName`: The full rule name
     - Any other Myna-specific metadata

## Example Conversion

```typescript
// Myna AST Node
{
    rule: { name: "field" },
    input: "a,1,\"hello\"",
    start: 0,
    end: 1,
    children: null,
    allText: "a"
}

// Converted Unist Node
{
    type: "field",
    position: {
        start: { line: 1, column: 1, offset: 0 },
        end: { line: 1, column: 2, offset: 1 }
    },
    value: "a",
    data: {
        rule: { name: "field" },
        fullName: "csv.field"
    }
}
```

## Implementation Notes

1. The conversion should be implemented as a separate module to maintain backward compatibility
2. The original Myna AST structure should be preserved in the `data` field
3. Position calculations should handle both Unix and Windows line endings
4. The conversion should be reversible to maintain compatibility with existing Myna tools

## Migration Path

1. Create a new module `myna-unist.ts` that provides conversion functions
2. Add type definitions for Unist compatibility
3. Implement position calculation utilities
4. Add conversion functions for both directions (Myna → Unist and Unist → Myna)
5. Add tests to verify compatibility with Unist ecosystem tools

## Future Considerations

1. Support for source maps
2. Integration with Unist ecosystem tools
3. Performance optimizations for large trees
4. Support for streaming conversion
5. Custom node type mappings 