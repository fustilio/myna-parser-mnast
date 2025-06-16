import { u } from "unist-builder";
import { visit } from "unist-util-visit";
import { is } from "unist-util-is";
import { MnastNode, MnastConversionOptions } from "./types";
import { calculateNodePosition, calculateIndent } from "./position";

function getBaseRule(rule: any): any {
    if (rule) {
        // AstRule is a proxy, we care about what it wraps
        if (rule.className === 'AstRule' && rule.r)
            return getBaseRule(rule.r);
        // Delay is a proxy, we care about what it points to
        if (rule.className === 'Delay' && rule.fn)
            return getBaseRule(rule.fn());
    }
    return rule;
}

/**
 * Convert a Myna AST/CST node to a mnast node
 */
export function toMnast(node: any, options: MnastConversionOptions = {}): MnastNode {
  const {
    includePosition = true,
    includeMynaData = true,
    typeMapper,
    isCST = false,
    preserveOriginalText = true,
  } = options;

  // Determine node type
  let type: string;
  const rule = node.rule;
  if (typeMapper) {
    type = typeMapper(node);
  } else {
    // The AstRule that created the node has the name we want.
    if (rule?.name) {
      type = rule.name;
    } else {
      // If the AstRule is not named (e.g. inline .ast), we get the type from the base rule.
      const baseRule = getBaseRule(rule);
      if (baseRule?.type) {
          type = baseRule.type;
      } else if (node.isLeaf) {
          type = "text";
      } else {
          type = "node";
      }
    }
  }

  // Create base node using unist-builder
  const mnastNode = u(type, {
    ...(includePosition &&
    node.input &&
    typeof node.start === "number" &&
    typeof node.end === "number"
      ? {
          position: {
            ...calculateNodePosition(node.input, node.start, node.end),
            indent: calculateIndent(
              node.input,
              calculateNodePosition(node.input, node.start, node.end)
            ),
          },
        }
      : {}),
    ...(includeMynaData
      ? {
          data: {
            rule: node.rule,
            fullName: node.fullName,
            isCST,
            isAST: !isCST,
            ...(isCST && preserveOriginalText && node.allText
              ? { originalText: node.allText }
              : {}),
          },
        }
      : {}),
  });

  // Add value for leaf nodes
  if (node.isLeaf && node.allText) {
    (mnastNode as any).value = node.allText;
  }

  // Add children if present
  if (node.children && node.children.length > 0) {
    (mnastNode as any).children = node.children.map((child: any) =>
      toMnast(child, options)
    );
  }

  return mnastNode as MnastNode;
}

/**
 * Convert a mnast node back to a Myna AST/CST node
 */
export function fromMnast(node: MnastNode): any {
  const isCST = node.data?.isCST ?? false;
  const mynaNode: any = {
    rule: node.data?.rule || { name: node.type },
    input: node.position ? node.position.start.offset.toString() : "",
    start: node.position?.start.offset || 0,
    end: node.position?.end.offset || 0,
    children: node.children ? node.children.map(fromMnast) : null,
  };

  // Add text content for leaf nodes
  if (node.value) {
    mynaNode.allText = node.value;
  } else if (isCST && node.data?.originalText) {
    mynaNode.allText = node.data.originalText;
  }

  // Add additional Myna-specific properties
  if (node.data) {
    Object.assign(mynaNode, node.data);
  }

  return mynaNode;
}

/**
 * Visit all nodes in a mnast tree and apply a function
 */
export function visitMnast(
  tree: MnastNode,
  visitor: (node: MnastNode) => void
): void {
  visit(tree, visitor);
}

/**
 * Check if a node matches a specific type
 */
export function isMnastNode(node: any, type: string): boolean {
  return is(node, type);
}

/**
 * Get all nodes of a specific type
 */
export function getMnastNodesByType(tree: MnastNode, type: string): MnastNode[] {
  const nodes: MnastNode[] = [];
  visit(tree, (node) => {
    if (is(node, type)) {
      nodes.push(node as MnastNode);
    }
  });
  return nodes;
}
