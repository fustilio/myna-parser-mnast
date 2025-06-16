import { describe, test, expect } from "vitest";
import { toMnast, fromMnast } from "../";
import { isMnastNode } from "../convert";

// Grammar-specific node map and type

type CsvMnastNodeMap = {
  field: { value: string; children?: never };
  record: { children: CsvMnastNode[]; value?: never };
  file: { children: CsvMnastNode[]; value?: never };
};
type CsvMnastNode = import("../types").MnastNode<CsvMnastNodeMap>;
type CsvFieldNode = Extract<CsvMnastNode, { type: "field" }>;
type CsvRecordNode = Extract<CsvMnastNode, { type: "record" }>;

describe("Mnast Conversion", () => {
  // Sample Myna AST node
  const mynaNode = {
    rule: { name: "field", type: "field" },
    input: 'a,1,"hello"\nb,2,"goodbye"',
    start: 0,
    end: 1,
    children: null as any[] | null,
    allText: "a",
    fullName: "csv.field",
    get isLeaf() {
      return !this.children || this.children.length === 0;
    },
  };

  // Sample mnast node (with indent)
  /*
  const mnastNode: CsvMnastNode = {
    type: "field",
    value: "a",
    position: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 2, offset: 1 },
      indent: [],
    },
    data: {
      rule: { name: "field", type: "field" },
      fullName: "csv.field",
      isAST: true,
      isCST: false,
    },
  };
  */

  test("converts Myna node to mnast node", () => {
    const result = toMnast<CsvMnastNodeMap>(mynaNode);
    expect(result.type).toBe("field");
    expect(result.value).toBe("a");
    expect(result.data?.rule?.name).toBe("field");
  });

  test("converts mnast node back to Myna node", () => {
    const expectedMynaNode = {
      rule: { name: "field", type: "field" },
      input: "0", // matches the fromMnast logic
      start: 0,
      end: 1,
      children: null,
      allText: "a",
      fullName: "csv.field",
      isAST: true,
      isCST: false,
    };
    const mnastNode = toMnast<CsvMnastNodeMap>(mynaNode);
    const result = fromMnast<CsvMnastNodeMap>(mnastNode);
    expect(result).toEqual(expectedMynaNode);
  });

  test("handles nodes with children", () => {
    const mynaParent = {
      rule: { name: "parent", type: "parent" },
      input: 'a,1,"hello"\nb,2,"goodbye"',
      start: 0,
      end: 1,
      children: [mynaNode],
      allText: "a",
      fullName: "csv.parent",
      get isLeaf() {
        return !this.children || this.children.length === 0;
      },
    };

    // 'parent' is not in CsvMnastNodeMap, so use 'any' for the result
    const result: any = toMnast(mynaParent);
    expect(result.children).toHaveLength(1);
    expect(result.children![0].type).toBe("field");
    expect(result.type).toBe("parent");
    expect(result).not.toHaveProperty("value");
  });

  test("respects conversion options", () => {
    const result = toMnast(mynaNode, {
      includePosition: false,
      includeMynaData: false,
    }) as CsvMnastNode;

    expect(result.position).toBeUndefined();
    expect(result.data).toBeUndefined();
    expect(result.type).toBe("field");
    expect(result.value).toBe("a");
  });

  test("handles custom type mapping", () => {
    const result = toMnast(mynaNode, {
      typeMapper: (node) => `custom_${node.rule.name}`,
    }) as CsvMnastNode;

    expect(result.type).toBe("custom_field");
  });

  test("handles Windows line endings", () => {
    const windowsNode = {
      ...mynaNode,
      input: 'a,1,"hello"\r\nb,2,"goodbye"',
      start: 13, // start of the second line, at 'b'
      end: 14, // end of 'b'
      allText: "b",
    };

    const result = toMnast(windowsNode) as CsvMnastNode;
    expect(result.position?.start.line).toBe(2);
    expect(result.position?.start.column).toBe(1);
  });

  // New tests for CST compatibility
  test("handles CST nodes with original text", () => {
    const cstNode = {
      ...mynaNode,
    };

    const result = toMnast(cstNode, { isCST: true }) as CsvMnastNode;
    expect(result.data?.isCST).toBe(true);
    expect(result.data?.isAST).toBe(false);
    expect(result.data?.originalText).toBe("a");
  });

  test("preserves CST node structure", () => {
    const cstNode = {
      ...mynaNode,
      children: [
        {
          ...mynaNode,
        },
      ],
    };

    const result = toMnast(cstNode, { isCST: true }) as any;
    expect(result.data?.isCST).toBe(true);
    expect(result.children?.[0].data?.isCST).toBe(true);
  });

  test("converts CST node back to Myna format", () => {
    const cstMnastNode = toMnast<CsvMnastNodeMap>(mynaNode, { isCST: true });
    const result = fromMnast<CsvMnastNodeMap>(cstMnastNode);
    expect(result.isCST).toBe(true);
    expect(result.allText).toBe("a");
  });

  test("The isCST option applies to the whole tree", () => {
    const mixedNode = {
      ...mynaNode,
      children: [
        {
          ...mynaNode,
        },
      ],
    };

    // The `isCST` option applies to the whole tree conversion.
    const result = toMnast(mixedNode, { isCST: false }) as any; // Treat as AST
    expect(result.data?.isAST).toBe(true);
    expect(result.data?.isCST).toBe(false);
    expect(result.children?.[0].data?.isAST).toBe(true);
    expect(result.children?.[0].data?.isCST).toBe(false);
  });

  test("isMnastNode type guard returns true for correct type and false for others", () => {
    const fieldNode = toMnast<CsvMnastNodeMap>(mynaNode);
    function isFieldNode(node: any): node is CsvFieldNode {
      return isMnastNode<CsvMnastNodeMap>(node, "field");
    }

    function isRecordNode(node: any): node is CsvRecordNode {
      return isMnastNode<CsvMnastNodeMap>(node, "record");
    }

    if (isFieldNode(fieldNode)) {
      // @ts-ignore type inference should be field node
      const a = fieldNode;

      if (isRecordNode(fieldNode)) {
        // @ts-ignore type inference should be never I guess
        const b = fieldNode;
      }
    }

    expect(isMnastNode<CsvMnastNodeMap>(fieldNode, "field")).toBe(true);
    expect(isMnastNode<CsvMnastNodeMap>(fieldNode, "record")).toBe(false);

    const recordMyna = {
      rule: { name: "record", type: "record" },
      input: 'a,1,"hello"\nb,2,"goodbye"',
      start: 0,
      end: 10,
      children: [mynaNode],
      allText: 'a,1,"hello"',
      fullName: "csv.record",
      get isLeaf() {
        return !this.children || this.children.length === 0;
      },
    };
    const recordNode = toMnast<CsvMnastNodeMap>(recordMyna);
    expect(isMnastNode<CsvMnastNodeMap>(recordNode, "record")).toBe(true);
    expect(isMnastNode<CsvMnastNodeMap>(recordNode, "field")).toBe(false);
  });
});

// Example: Extending MnastNode for a specific grammar

// (CsvMnastNodeMap and CsvMnastNode already defined above)

// Type-level test: TypeScript should infer the correct type
const fieldNode: CsvMnastNode = {
  type: "field",
  value: "abc",
  data: { rule: { name: "field" } },
};

const recordNode: CsvMnastNode = {
  type: "record",
  children: [fieldNode],
  data: { rule: { name: "record" } },
};

//@ts-ignore
const fileNode: CsvMnastNode = {
  type: "file",
  children: [recordNode],
  data: { rule: { name: "file" } },
};
// TypeScript will infer 'value' is string for 'field', and 'children' is CsvMnastNode[] for 'record' and 'file'.
// Uncommenting the following line should cause a type error:
// const badNode: CsvMnastNode = { type: 'field', children: [fieldNode] }; // Error: 'field' should not have 'children'

describe("CsvMnastNode runtime usage", () => {
  // Use the CsvMnastNode type from above
  const fieldNode: CsvMnastNode = {
    type: "field",
    value: "abc",
    data: { rule: { name: "field" } },
  };

  const recordNode: CsvMnastNode = {
    type: "record",
    children: [fieldNode],
    data: { rule: { name: "record" } },
  };

  const fileNode: CsvMnastNode = {
    type: "file",
    children: [recordNode],
    data: { rule: { name: "file" } },
  };

  test("CsvMnastNode field node has value and no children", () => {
    expect(fieldNode.type).toBe("field");
    expect(fieldNode.value).toBe("abc");
    expect(fieldNode.children).toBeUndefined();
  });

  test("CsvMnastNode record node has children and no value", () => {
    expect(recordNode.type).toBe("record");
    expect(recordNode.children).toHaveLength(1);
    expect(recordNode.value).toBeUndefined();
    expect(recordNode.children?.[0].type).toBe("field");
  });

  test("CsvMnastNode file node has children and no value", () => {
    expect(fileNode.type).toBe("file");
    expect(fileNode.children).toHaveLength(1);
    expect(fileNode.value).toBeUndefined();
    expect(fileNode.children?.[0].type).toBe("record");
  });

  test("toMnast and fromMnast roundtrip for CsvMnastNode", () => {
    // Simulate a Myna AST node for a field
    const mynaField = {
      rule: { name: "field", type: "field" },
      input: "abc",
      start: 0,
      end: 3,
      children: null as any[] | null,
      allText: "abc",
      fullName: "csv.field",
      get isLeaf() {
        return !this.children || this.children.length === 0;
      },
    };
    const mnastField = toMnast<CsvMnastNodeMap>(mynaField);
    expect(mnastField.type).toBe("field");
    expect(mnastField.value).toBe("abc");
    // Convert back
    const roundtrip = fromMnast<CsvMnastNodeMap>(mnastField);
    expect(roundtrip.allText).toBe("abc");
    expect(roundtrip.rule.name).toBe("field");
  });
});
