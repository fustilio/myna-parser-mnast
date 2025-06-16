// Grammar for parsing and evaluating arithmetic expressions
// This grammar parses expressions like "2 + 3 * 4" and evaluates them according to standard operator precedence

import { Myna } from "../src";

interface ArithmeticGrammar {
  fraction: Myna.Rule;
  plusOrMinus: Myna.Rule;
  comma: Myna.Rule;
  exponent: Myna.Rule;
  expr: Myna.Rule;
  number: Myna.Rule;
  parenExpr: Myna.Rule;
  leafExpr: Myna.Rule;
  prefixOp: Myna.Rule;
  prefixExpr: Myna.Rule;
  divExpr: Myna.Rule;
  mulExpr: Myna.Rule;
  product: Myna.Rule;
  subExpr: Myna.Rule;
  addExpr: Myna.Rule;
  sum: Myna.Rule;
}

// Defines a grammar for basic arithmetic
export function createArithmeticGrammar(myna: typeof Myna): ArithmeticGrammar {
  const m = myna;

  const g: ArithmeticGrammar = {
    fraction: null as any,
    plusOrMinus: null as any,
    comma: null as any,
    exponent: null as any,
    expr: null as any,
    number: null as any,
    parenExpr: null as any,
    leafExpr: null as any,
    prefixOp: null as any,
    prefixExpr: null as any,
    divExpr: null as any,
    mulExpr: null as any,
    product: null as any,
    subExpr: null as any,
    addExpr: null as any,
    sum: null as any
  };

  // These are helper rules, they do not create nodes in the parse tree.  
  g.fraction = m.seq(".", m.digit.zeroOrMore);
  g.plusOrMinus = m.char("+-");
  g.comma = m.text(",").ws;
  g.exponent = m.seq(m.char("eE"), g.plusOrMinus.opt, m.digits);

  // Using a lazy evaluation rule to allow recursive rule definitions
  g.expr = m.delay(() => g.sum).ast;
  g.number = m.seq(m.integer, g.fraction.opt, g.exponent.opt).ast;
  g.parenExpr = m.parenthesized(g.expr.ws).ast;
  g.leafExpr = m.choice(g.parenExpr, g.number.ws);
  g.prefixOp = g.plusOrMinus.ast;
  g.prefixExpr = m.seq(g.prefixOp.ws.zeroOrMore, g.leafExpr).ast;
  g.divExpr = m.seq(m.char("/").ws, g.prefixExpr).ast;
  g.mulExpr = m.seq(m.char("*").ws, g.prefixExpr).ast;
  g.product = m.seq(g.prefixExpr.ws, g.mulExpr.or(g.divExpr).zeroOrMore).ast;
  g.subExpr = m.seq(m.char("-").ws, g.product).ast;
  g.addExpr = m.seq(m.char("+").ws, g.product).ast;
  g.sum = m.seq(g.product, g.addExpr.or(g.subExpr).zeroOrMore).ast;

  // Register the grammar, providing a name and the default parse rule
  myna.registerGrammar("arithmetic", g, g.expr);
  return g;
}
