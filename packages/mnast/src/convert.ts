import { u } from "unist-builder";
import { visit } from "unist-util-visit";
import { is } from "unist-util-is";
import { MnastNode, MnastConversionOptions, MnastNodeMap } from "./types";
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
 * Convert a Myna AST/CST node to a mnast node (generic)
 */
export function toMnast<T extends MnastNodeMap>(node: any, options: MnastConversionOptions = {}): MnastNode<T> {
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
      toMnast<T>(child, options)
    );
  }

  return mnastNode as MnastNode<T>;
}

/**
 * Convert a mnast node back to a Myna AST/CST node (generic)
 */
export function fromMnast<T extends MnastNodeMap>(node: MnastNode<T>): any {
  const isCST = (node as any).data?.isCST ?? false;
  const mynaNode: any = {
    rule: (node as any).data?.rule || { name: (node as any).type },
    input: (node as any).position ? (node as any).position.start.offset.toString() : "",
    start: (node as any).position?.start.offset || 0,
    end: (node as any).position?.end.offset || 0,
    children: (node as any).children ? (node as any).children.map(fromMnast) : null,
  };

  // Add text content for leaf nodes
  if ((node as any).value) {
    mynaNode.allText = (node as any).value;
  } else if (isCST && (node as any).data?.originalText) {
    mynaNode.allText = (node as any).data.originalText;
  }

  // Add additional Myna-specific properties
  if ((node as any).data) {
    Object.assign(mynaNode, (node as any).data);
  }

  return mynaNode;
}

/**
 * Visit all nodes in a mnast tree and apply a function
 */
export function visitMnast<T extends MnastNodeMap>(
  tree: MnastNode<T>,
  visitor: (node: MnastNode<T>) => void
): void {
  visit(tree, visitor);
}

/**
 * Check if a node matches a specific type
 */
export function isMnastNode<T extends MnastNodeMap>(node: any, type: Extract<keyof T, string> | string): node is MnastNode<T> {
  return is(node, type);
}

/**
 * Get all nodes of a specific type
 */
export function getMnastNodesByType<T extends MnastNodeMap>(tree: MnastNode<T>, type: Extract<keyof T, string> | string): MnastNode<T>[] {
  const nodes: MnastNode<T>[] = [];
  visit(tree, (node) => {
    if (is(node, type)) {
      nodes.push(node as MnastNode<T>);
    }
  });
  return nodes;
}
