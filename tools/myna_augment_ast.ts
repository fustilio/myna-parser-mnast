interface AstNode {
  start: number;
  input: string;
  children: AstNode[];
  parent: AstNode | null;
  rowNum?: number;
  colNum?: number;
  index?: number;
}

/**
 * Adds additional information to an AST once it has been constructed.
 * This information is expensive to add at parse time.
 * It adds a parent pointer, a unique index, a row number, and a column number.
 * All of the nodes are then placed in an array.
 */
function augmentAstTree(ast: AstNode): AstNode[] {
  return augmentAstNode(ast, null, 0, 0, 0, []);
}

function augmentAstNode(
  node: AstNode,
  parent: AstNode | null,
  index: number,
  rowNum: number,
  colNum: number,
  nodes: AstNode[]
): AstNode[] {
  let lineCount1 = 0;
  let lineCount2 = 0;

  for (; index < node.start; ++index) {
    if (node.input.charCodeAt(index) === 10) {
      lineCount1++;
      colNum = 0;
    } else if (node.input.charCodeAt(index) === 13) {
      lineCount2++;
      colNum = 0;
    } else {
      colNum++;
    }
  }

  if (lineCount1 >= lineCount2) {
    rowNum += lineCount1;
  } else {
    rowNum += lineCount2;
  }

  node.parent = parent;
  node.rowNum = rowNum;
  node.colNum = colNum;
  node.index = nodes.length;
  nodes.push(node);

  for (const child of node.children) {
    augmentAstNode(child, node, index, rowNum, colNum, nodes);
  }

  return nodes;
}

export default augmentAstTree;
