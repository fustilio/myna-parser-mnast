"use strict";

import { Myna } from "../src";

export interface HeronGrammar {
  untilEol: Myna.Rule;
  fullComment: Myna.Rule;
  lineComment: Myna.Rule;
  comment: Myna.Rule;
  ws: Myna.Rule;
  eos: Myna.Rule;
  comma: Myna.Rule;
  expr: Myna.Rule;
  recStatement: Myna.Rule;
  fraction: Myna.Rule;
  plusOrMinus: Myna.Rule;
  exponent: Myna.Rule;
  bool: Myna.Rule;
  number: Myna.Rule;
  literal: Myna.Rule;
  identifier: Myna.Rule;
  relationalOp: Myna.Rule;
  equalityOp: Myna.Rule;
  prefixOp: Myna.Rule;
  assignmentOp: Myna.Rule;
  additiveOp: Myna.Rule;
  multiplicativeOp: Myna.Rule;
  logicalAndOp: Myna.Rule;
  logicalXOrOp: Myna.Rule;
  logicalOrOp: Myna.Rule;
  conditionalOp: Myna.Rule;
  conditionalElseOp: Myna.Rule;
  funcCall: Myna.Rule;
  arrayIndex: Myna.Rule;
  fieldName: Myna.Rule;
  fieldSelect: Myna.Rule;
  postfixOp: Myna.Rule;
  postfixExpr: Myna.Rule;
  leafExpr: Myna.Rule;
  parenExpr: Myna.Rule;
  expr12: Myna.Rule;
  expr11: Myna.Rule;
  expr10: Myna.Rule;
  multiplicativeExpr: Myna.Rule;
  expr9: Myna.Rule;
  additiveExpr: Myna.Rule;
  expr8: Myna.Rule;
  relationalExpr: Myna.Rule;
  expr7: Myna.Rule;
  equalityExpr: Myna.Rule;
  expr6: Myna.Rule;
  logicalAndExpr: Myna.Rule;
  expr5: Myna.Rule;
  logicalXOrExpr: Myna.Rule;
  expr4: Myna.Rule;
  logicalOrExpr: Myna.Rule;
  expr3: Myna.Rule;
  conditionalExpr: Myna.Rule;
  expr2: Myna.Rule;
  assignmentExpr: Myna.Rule;
  expr1: Myna.Rule;
  recTypeExpr: Myna.Rule;
  funcTypeParam: Myna.Rule;
  funcTypeReturn: Myna.Rule;
  funcTypeExpr: Myna.Rule;
  simpleTypeExpr: Myna.Rule;
  arrayType: Myna.Rule;
  typeExpr: Myna.Rule;
  precisionQualifier: Myna.Rule;
  storageQualifier: Myna.Rule;
  parameterQualifier: Myna.Rule;
  invariantQualifier: Myna.Rule;
  qualifiers: Myna.Rule;
  exprStatement: Myna.Rule;
  varArraySizeDecl: Myna.Rule;
  varName: Myna.Rule;
  varInit: Myna.Rule;
  varNameAndInit: Myna.Rule;
  varDecl: Myna.Rule;
  forLoopInit: Myna.Rule;
  forLoopInvariant: Myna.Rule;
  forLoopVariant: Myna.Rule;
  loopCond: Myna.Rule;
  forLoop: Myna.Rule;
  whileLoop: Myna.Rule;
  doLoop: Myna.Rule;
  elseStatement: Myna.Rule;
  ifStatement: Myna.Rule;
  compoundStatement: Myna.Rule;
  breakStatement: Myna.Rule;
  continueStatement: Myna.Rule;
  returnStatement: Myna.Rule;
  emptyStatement: Myna.Rule; // Corrected typo from emptyStatemnt
  statement: Myna.Rule;
  ppStart: Myna.Rule;
  ppDirective: Myna.Rule;
  funcParamName: Myna.Rule;
  funcParam: Myna.Rule;
  funcName: Myna.Rule;
  funcParams: Myna.Rule;
  funcDef: Myna.Rule;
  structMember: Myna.Rule;
  structVarName: Myna.Rule;
  structTypeName: Myna.Rule;
  structMembers: Myna.Rule;
  structDef: Myna.Rule;
  topLevelDecl: Myna.Rule;
  program: Myna.Rule;
  operatorSymbol: Myna.Rule;
  primitiveName: Myna.Rule;
  primitiveDecl: Myna.Rule;
  primitiveFile: Myna.Rule;
  [key: string]: Myna.Rule; // Index signature
}

export function createHeronGrammar(myna: typeof Myna) {
  // Setup a shorthand for the Myna parsing library object
  const m = myna;

  const g: HeronGrammar = {
    untilEol: null as any,
    fullComment: null as any,
    lineComment: null as any,
    comment: null as any,
    ws: null as any,
    eos: null as any,
    comma: null as any,
    expr: null as any,
    recStatement: null as any,
    fraction: null as any,
    plusOrMinus: null as any,
    exponent: null as any,
    bool: null as any,
    number: null as any,
    literal: null as any,
    identifier: null as any,
    relationalOp: null as any,
    equalityOp: null as any,
    prefixOp: null as any,
    assignmentOp: null as any,
    additiveOp: null as any,
    multiplicativeOp: null as any,
    logicalAndOp: null as any,
    logicalXOrOp: null as any,
    logicalOrOp: null as any,
    conditionalOp: null as any,
    conditionalElseOp: null as any,
    funcCall: null as any,
    arrayIndex: null as any,
    fieldName: null as any,
    fieldSelect: null as any,
    postfixOp: null as any,
    postfixExpr: null as any,
    leafExpr: null as any,
    parenExpr: null as any,
    expr12: null as any,
    expr11: null as any,
    expr10: null as any,
    multiplicativeExpr: null as any,
    expr9: null as any,
    additiveExpr: null as any,
    expr8: null as any,
    relationalExpr: null as any,
    expr7: null as any,
    equalityExpr: null as any,
    expr6: null as any,
    logicalAndExpr: null as any,
    expr5: null as any,
    logicalXOrExpr: null as any,
    expr4: null as any,
    logicalOrExpr: null as any,
    expr3: null as any,
    conditionalExpr: null as any,
    expr2: null as any,
    assignmentExpr: null as any,
    expr1: null as any,
    recTypeExpr: null as any,
    funcTypeParam: null as any,
    funcTypeReturn: null as any,
    funcTypeExpr: null as any,
    simpleTypeExpr: null as any,
    arrayType: null as any,
    typeExpr: null as any,
    precisionQualifier: null as any,
    storageQualifier: null as any,
    parameterQualifier: null as any,
    invariantQualifier: null as any,
    qualifiers: null as any,
    exprStatement: null as any,
    varArraySizeDecl: null as any,
    varName: null as any,
    varInit: null as any,
    varNameAndInit: null as any,
    varDecl: null as any,
    forLoopInit: null as any,
    forLoopInvariant: null as any,
    forLoopVariant: null as any,
    loopCond: null as any,
    forLoop: null as any,
    whileLoop: null as any,
    doLoop: null as any,
    elseStatement: null as any,
    ifStatement: null as any,
    compoundStatement: null as any,
    breakStatement: null as any,
    continueStatement: null as any,
    returnStatement: null as any,
    emptyStatement: null as any, // Corrected typo
    statement: null as any,
    ppStart: null as any,
    ppDirective: null as any,
    funcParamName: null as any,
    funcParam: null as any,
    funcName: null as any,
    funcParams: null as any,
    funcDef: null as any,
    structMember: null as any,
    structVarName: null as any,
    structTypeName: null as any,
    structMembers: null as any,
    structDef: null as any,
    topLevelDecl: null as any,
    program: null as any,
    operatorSymbol: null as any,
    primitiveName: null as any,
    primitiveDecl: null as any,
    primitiveFile: null as any,
  };

  // Comments and whitespace
  g.untilEol = m.advanceWhileNot(m.newLine).then(m.newLine.opt);
  g.fullComment = m.seq("/*", m.advanceUntilPast("*/"));
  g.lineComment = m.seq("//", g.untilEol);
  g.comment = g.fullComment.or(g.lineComment);
  g.ws = g.comment.or(m.atWs.then(m.advance)).zeroOrMore;

  // Helper for whitespace delimited sequences that must start with a specific value
  // This function needs g.ws to be defined, so it's defined after g.ws
  function guardedWsDelimSeq(firstRule: Myna.RuleType, ...rules: Myna.RuleType[]) {
    const mappedRules = rules.map((r) => m.seq(m.assert(r), g.ws));
    return m.seq(firstRule, g.ws, ...mappedRules);
  }

  // Helpers
  g.eos = m.text(";").then(g.ws);
  g.comma = m.char(",").then(g.ws);

  // Recursive definition of an expression
  g.expr = m.delay(() => g.expr1).ast;

  // Recursive definition of a statement
  g.recStatement = m.delay(() => g.statement).ast;

  // Literals
  g.fraction = m.seq(".", m.digit.zeroOrMore);
  g.plusOrMinus = m.char("+-");
  g.exponent = m.seq(m.char("eE"), g.plusOrMinus.opt, m.digits);
  g.bool = m.keywords("true", "false").ast;
  g.number = m.seq(
    g.plusOrMinus.opt,
    m.integer.then(g.fraction.opt).or(g.fraction),
    g.exponent.opt
  ).ast;
  g.literal = m.choice(g.number, g.bool);
  g.identifier = m.identifier.ast;

  // Operators
  g.relationalOp = m.choice("<=", ">=", "<", ">").ast;
  g.equalityOp = m.choice("==", "!=").ast;
  g.prefixOp = m.choice("++", "--", "+", "-", "!").ast;
  g.assignmentOp = m.choice("+=", "-=", "*=", "/=", "=").ast;
  g.additiveOp = m
    .choice("+", "-")
    .unless(m.choice("++", "--", "+=", "-=")).ast;
  g.multiplicativeOp = m.choice("*", "/").unless(m.choice("*=", "/=")).ast;
  g.logicalAndOp = m.text("&&").ast;
  g.logicalXOrOp = m.text("^^").ast;
  g.logicalOrOp = m.text("||").ast;
  g.conditionalOp = m.text("?").ast;
  g.conditionalElseOp = m.text(":").ast;

  // Postfix expressions
  g.funcCall = guardedWsDelimSeq(
    "(",
    m.delimited(g.expr, g.comma),
    ")"
  ).ast;
  g.arrayIndex = guardedWsDelimSeq("[", g.expr, "]").ast;
  g.fieldName = g.identifier.ast;
  g.fieldSelect = guardedWsDelimSeq(".", g.fieldName).ast;
  g.postfixOp = m.choice("++", "--").ast;
  g.postfixExpr = m
    .choice(g.funcCall, g.arrayIndex, g.fieldSelect, g.postfixOp)
    .then(g.ws).ast;

  // Expressions of different precedences
  g.leafExpr = m.choice(g.literal, g.identifier).ast;
  g.parenExpr = guardedWsDelimSeq("(", g.expr, ")").ast;
  g.expr12 = g.parenExpr.or(g.leafExpr).ast;
  g.expr11 = g.expr12
    .then(g.ws)
    .then(g.postfixExpr.zeroOrMore).ast;
  g.expr10 = m.choice(g.prefixOp.then(g.expr11), g.expr11).ast;
  g.multiplicativeExpr = guardedWsDelimSeq(
    g.multiplicativeOp,
    g.expr10
  ).ast;
  g.expr9 = g.expr10.then(g.multiplicativeExpr.zeroOrMore).ast;
  g.additiveExpr = guardedWsDelimSeq(g.additiveOp, g.expr9).ast;
  g.expr8 = g.expr9.then(g.additiveExpr.zeroOrMore).ast;
  g.relationalExpr = guardedWsDelimSeq(g.relationalOp, g.expr8).ast;
  g.expr7 = g.expr8.then(g.relationalExpr.zeroOrMore).ast;
  g.equalityExpr = guardedWsDelimSeq(g.equalityOp, g.expr7).ast;
  g.expr6 = g.expr7.then(g.equalityExpr.zeroOrMore).ast;
  g.logicalAndExpr = guardedWsDelimSeq(g.logicalAndOp, g.expr6).ast;
  g.expr5 = g.expr6.then(g.logicalAndExpr.zeroOrMore).ast;
  g.logicalXOrExpr = guardedWsDelimSeq(g.logicalXOrOp, g.expr5).ast;
  g.expr4 = g.expr5.then(g.logicalXOrExpr.zeroOrMore).ast;
  g.logicalOrExpr = guardedWsDelimSeq(g.logicalOrOp, g.expr4).ast;
  g.expr3 = g.expr4.then(g.logicalOrExpr.zeroOrMore).ast;
  g.conditionalExpr = guardedWsDelimSeq(
    g.conditionalOp,
    g.expr,
    g.conditionalElseOp,
    g.expr
  ).ast;
  g.expr2 = g.expr3.then(g.conditionalExpr.opt).ast;
  g.assignmentExpr = guardedWsDelimSeq(g.assignmentOp, g.expr2).ast;
  g.expr1 = g.expr2.then(g.assignmentExpr.opt).ast;

  // Type expression
  g.recTypeExpr = m.delay(() => g.typeExpr).ast;
  g.funcTypeParam = g.recTypeExpr.ast;
  g.funcTypeReturn = g.recTypeExpr.ast;
  g.funcTypeExpr = guardedWsDelimSeq(
    "(",
    m.delimited(g.funcTypeParam, g.comma),
    ")",
    "->",
    g.funcTypeReturn
  ).ast;
  g.simpleTypeExpr = g.leafExpr.ast;
  g.arrayType = guardedWsDelimSeq("[", g.recTypeExpr, "]").ast;
  g.typeExpr = m
    .choice(g.simpleTypeExpr, g.funcTypeExpr)
    .then(g.arrayType.zeroOrMore).ast;

  // Qualifiers
  g.precisionQualifier = m.keywords("highp", "mediump", "lowp").ast;
  g.storageQualifier = m.keywords(
    "const",
    "attribute",
    "uniform",
    "varying"
  ).ast;
  g.parameterQualifier = m.keywords("in", "out", "inout").ast;
  g.invariantQualifier = m.keyword("invariant").ast;
  g.qualifiers = m.seq(
    g.invariantQualifier.then(g.ws).opt,
    g.storageQualifier.then(g.ws).opt,
    g.parameterQualifier.then(g.ws).opt,
    g.precisionQualifier.then(g.ws).opt,
    g.ws
  ).ast;

  // Statements
  g.exprStatement = g.expr.then(g.ws).then(g.eos).ast;
  g.varArraySizeDecl = guardedWsDelimSeq("[", g.leafExpr, "]").ast;
  g.varName = g.identifier.ast;
  g.varInit = guardedWsDelimSeq("=", g.expr1).ast;
  g.varNameAndInit = guardedWsDelimSeq(
    g.varName,
    g.varArraySizeDecl.opt,
    g.varInit.opt
  ).ast;
  g.varDecl = m.seq(
    g.qualifiers,
    g.typeExpr,
    g.ws,
    m.delimited(g.varNameAndInit, g.comma),
    g.ws,
    g.eos
  ).ast;
  g.forLoopInit = m.seq(g.varDecl).ast;
  g.forLoopInvariant = guardedWsDelimSeq(g.expr.opt, g.eos).ast;
  g.forLoopVariant = g.expr.then(g.ws).opt.ast;
  g.loopCond = guardedWsDelimSeq("(", g.expr, ")").ast;
  g.forLoop = guardedWsDelimSeq(
    m.keyword("for"),
    "(",
    g.forLoopInit,
    g.forLoopInvariant,
    g.forLoopVariant,
    ")",
    g.recStatement
  ).ast;
  g.whileLoop = guardedWsDelimSeq(
    m.keyword("while"),
    g.loopCond,
    g.recStatement
  ).ast;
  g.doLoop = guardedWsDelimSeq(
    m.keyword("do"),
    g.recStatement,
    m.keyword("while"),
    g.loopCond
  ).ast;
  g.elseStatement = guardedWsDelimSeq(
    m.keyword("else"),
    g.recStatement
  ).ast;
  g.ifStatement = guardedWsDelimSeq(
    m.keyword("if"),
    "(",
    g.expr,
    ")",
    g.recStatement,
    g.elseStatement.opt
  ).ast;
  g.compoundStatement = guardedWsDelimSeq(
    "{",
    g.recStatement.zeroOrMore,
    "}"
  ).ast;
  g.breakStatement = guardedWsDelimSeq(m.keyword("break"), g.eos).ast;
  g.continueStatement = guardedWsDelimSeq(
    m.keyword("continue"),
    g.eos
  ).ast;
  g.returnStatement = guardedWsDelimSeq(
    m.keyword("return"),
    g.expr.opt,
    g.eos
  ).ast;
  g.emptyStatement = g.eos.ast; // Corrected typo
  g.statement = m.choice(
    g.emptyStatement,
    g.compoundStatement,
    g.ifStatement,
    g.returnStatement,
    g.continueStatement,
    g.breakStatement,
    g.forLoop,
    g.doLoop,
    g.whileLoop,
    g.varDecl,
    g.exprStatement
  ).ast;

  // Global declarations
  g.ppStart = m.choice(m.space, m.tab).zeroOrMore.then("#");
  g.ppDirective = g.ppStart.then(g.untilEol).ast;

  g.funcParamName = g.identifier.ast;
  g.funcParam = m.choice(
    m.keyword("void"),
    m.seq(g.qualifiers, g.typeExpr, g.ws, g.funcParamName)
  ).ast;
  g.funcName = g.identifier.ast;
  g.funcParams = guardedWsDelimSeq(
    "(",
    m.keyword("void").or(m.delimited(g.funcParam, g.comma)),
    ")"
  ).ast;
  g.funcDef = m.seq(
    g.qualifiers,
    g.typeExpr,
    g.ws,
    g.funcName,
    g.funcParams,
    g.ws,
    g.compoundStatement,
    g.ws
  ).ast;

  g.structMember = g.varDecl.ast;
  g.structVarName = g.identifier.ast;
  g.structTypeName = g.identifier.ast;
  g.structMembers = g.structMember.zeroOrMore.ast;
  g.structDef = guardedWsDelimSeq(
    m.keyword("struct"),
    g.structTypeName,
    "{",
    g.structMembers,
    "}",
    g.structVarName.opt,
    g.varArraySizeDecl.opt,
    g.eos
  ).ast;

  g.topLevelDecl = m.choice(
    g.ppDirective,
    g.structDef,
    g.funcDef,
    g.varDecl
  ).ast;
  g.program = m.seq(
    g.ws,
    g.topLevelDecl.then(g.ws).zeroOrMore
  ).ast;

  // Heron specific stuff

  g.operatorSymbol = m.char("+-*/?<>=^&|!").oneOrMore.ast;
  g.primitiveName = g.identifier.or(g.operatorSymbol).ast;
  g.primitiveDecl = guardedWsDelimSeq(
    g.primitiveName,
    ":",
    g.typeExpr,
    g.eos
  ).ast;
  g.primitiveFile = g.ws
    .then(g.primitiveDecl.zeroOrMore)
    .then(m.assert(m.end)).ast;

  // Register the grammar, providing a name and the default parse rule
  m.registerGrammar("heron", g, g.primitiveFile);
  return g;
}
