import { describe, test, expect } from "vitest";
import { toMnast, fromMnast, MnastNode } from "../";

describe("Mnast Conversion", () => {
  // Sample Myna AST node
  const mynaNode = {
    rule: { name: "field", type: "field" },
    input: 'a,1,"hello"\nb,2,"goodbye"',
    start: 0,
    end: 1,
    children: null as null | any[],
    allText: "a",
    fullName: "csv.field",
    get isLeaf() {
      return !this.children || this.children.length === 0;
    },
  };

  // Sample mnast node (with indent)
  const mnastNode: MnastNode = {
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

  test("converts Myna node to mnast node", () => {
    const result = toMnast(mynaNode);
    expect(result).toEqual(mnastNode);
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
    const result = fromMnast(mnastNode);
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

    const result = toMnast(mynaParent);
    expect(result.children).toHaveLength(1);
    expect(result.children![0]).toEqual(mnastNode);
    expect(result.type).toBe("parent");
    expect(result).not.toHaveProperty("value");
  });

  test("respects conversion options", () => {
    const result = toMnast(mynaNode, {
      includePosition: false,
      includeMynaData: false,
    });

    expect(result.position).toBeUndefined();
    expect(result.data).toBeUndefined();
    expect(result.type).toBe("field");
    expect(result.value).toBe("a");
  });

  test("handles custom type mapping", () => {
    const result = toMnast(mynaNode, {
      typeMapper: (node) => `custom_${node.rule.name}`,
    });

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

    const result = toMnast(windowsNode);
    expect(result.position?.start.line).toBe(2);
    expect(result.position?.start.column).toBe(1);
  });

  // New tests for CST compatibility
  test("handles CST nodes with original text", () => {
    const cstNode = {
      ...mynaNode,
    };

    const result = toMnast(cstNode, { isCST: true });
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

    const result = toMnast(cstNode, { isCST: true });
    expect(result.data?.isCST).toBe(true);
    expect(result.children?.[0].data?.isCST).toBe(true);
  });

  test("converts CST node back to Myna format", () => {
    const cstMnastNode: MnastNode = {
      ...mnastNode,
      data: {
        ...mnastNode.data,
        isCST: true,
        isAST: false,
        originalText: "a",
      },
    };

    const result = fromMnast(cstMnastNode);
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
    const result = toMnast(mixedNode, { isCST: false }); // Treat as AST
    expect(result.data?.isAST).toBe(true);
    expect(result.data?.isCST).toBe(false);
    expect(result.children?.[0].data?.isAST).toBe(true);
    expect(result.children?.[0].data?.isCST).toBe(false);
  });
});
