// https://github.com/burg/glsl-simulator/blob/master/src/glsl.pegjs
// https://www.khronos.org/registry/gles/specs/2.0/GLSL_ES_Specification_1.0.17.pdf

"use strict";

import { Myna } from "../src";

export interface GlslGrammar {
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
  typeExpr: Myna.Rule;
  precisionQualifier: Myna.Rule;
  storageQualifier: Myna.Rule;
  parameterQualifier: Myna.Rule;
  invariantQualifier: Myna.Rule;
  qualifiers: Myna.Rule;
  ppType: Myna.Rule;
  ppDefineName: Myna.Rule;
  ppDefineArg: Myna.Rule;
  ppDefineArgs: Myna.Rule;
  ppStart: Myna.Rule;
  ppDefineExpr: Myna.Rule;
  ppDefine: Myna.Rule;
  ppOther: Myna.Rule;
  ppDirective: Myna.Rule;
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
  emptyStatement: Myna.Rule;
  statement: Myna.Rule;
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
  precisionDirective: Myna.Rule;
  topLevelDecl: Myna.Rule;
  program: Myna.Rule;
  digit: Myna.Rule;
  letter: Myna.Rule;
  letterLower: Myna.Rule;
  letterUpper: Myna.Rule;
  digitNonZero: Myna.Rule;
  digits: Myna.Rule;
  hexDigit: Myna.Rule;
  binaryDigit: Myna.Rule;
  octalDigit: Myna.Rule;
  alphaNumeric: Myna.Rule;
  underscore: Myna.Rule;
  identifierFirst: Myna.Rule;
  identifierNext: Myna.Rule;
  hyphen: Myna.Rule;
  crlf: Myna.Rule;
  newLine: Myna.Rule;
  space: Myna.Rule;
  tab: Myna.Rule;
  exprList: Myna.Rule;
  argumentExpr: Myna.Rule;
  postfixSuffix: Myna.Rule;
}

export function createGlslGrammar(myna: typeof Myna): GlslGrammar {
  const m = myna;

  const g: GlslGrammar = {
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
    typeExpr: null as any,
    precisionQualifier: null as any,
    storageQualifier: null as any,
    parameterQualifier: null as any,
    invariantQualifier: null as any,
    qualifiers: null as any,
    ppType: null as any,
    ppDefineName: null as any,
    ppDefineArg: null as any,
    ppDefineArgs: null as any,
    ppStart: null as any,
    ppDefineExpr: null as any,
    ppDefine: null as any,
    ppOther: null as any,
    ppDirective: null as any,
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
    emptyStatement: null as any,
    statement: null as any,
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
    precisionDirective: null as any,
    topLevelDecl: null as any,
    program: null as any,
    digit: null as any,
    letter: null as any,
    letterLower: null as any,
    letterUpper: null as any,
    digitNonZero: null as any,
    digits: null as any,
    hexDigit: null as any,
    binaryDigit: null as any,
    octalDigit: null as any,
    alphaNumeric: null as any,
    underscore: null as any,
    identifierFirst: null as any,
    identifierNext: null as any,
    hyphen: null as any,
    crlf: null as any,
    newLine: null as any,
    space: null as any,
    tab: null as any,
    exprList: null as any,
    argumentExpr: null as any,
    postfixSuffix: null as any,
  };

  // Helper functions
  function guardedWsDelimSeq(...args: any[]) {
    const wsArgs = args.slice(1).map((r) => m.seq(m.assert(r), g.ws));
    return m.seq(args[0], g.ws, m.seq(...wsArgs));
  }

  function commaDelimited(rule: Myna.Rule) {
    return m.delimited(rule, m.seq(g.comma, g.ws.opt));
  }

  // 1. Basic lexical rules (no dependencies)
  g.untilEol = m.advanceWhileNot(m.newLine).then(m.newLine.opt);
  g.fullComment = m.seq("/*", m.advanceUntilPast("*/"));
  g.lineComment = m.seq("//", g.untilEol);
  g.comment = g.fullComment.or(g.lineComment);
  g.ws = g.comment.or(m.atWs.then(m.advance)).zeroOrMore.ast;
  g.eos = m.text(";").then(g.ws).ast;
  g.comma = m.char(",").then(g.ws);

  // 2. Basic literals and identifiers
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
  g.digit = m.digit.ast;
  g.letter = m.letter.ast;
  g.letterLower = m.letterLower.ast;
  g.letterUpper = m.letterUpper.ast;
  g.digitNonZero = m.digitNonZero.ast;
  g.digits = m.digits.ast;
  g.hexDigit = m.hexDigit.ast;
  g.binaryDigit = m.binaryDigit.ast;
  g.octalDigit = m.octalDigit.ast;
  g.alphaNumeric = m.alphaNumeric.ast;
  g.underscore = m.underscore.ast;
  g.identifierFirst = m.identifierFirst.ast;
  g.identifierNext = m.identifierNext.ast;
  g.hyphen = m.hyphen.ast;
  g.crlf = m.crlf.ast;
  g.newLine = m.newLine.ast;
  g.space = m.space.ast;
  g.tab = m.tab.ast;
  g.ws = g.comment.or(m.atWs.then(m.advance)).zeroOrMore.ast;

  // 3. Basic operators
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
  g.postfixOp = m.choice("++", "--").ast;

  // 4. Basic type and qualifier rules
  g.typeExpr = g.identifier;
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

  // 5. Basic expression components
  g.fieldName = g.identifier;
  g.fieldSelect = m.seq(
    g.identifier,
    m.seq(m.text("."), g.ws, g.fieldName).oneOrMore
  ).ast;
  g.leafExpr = m.choice(g.literal, g.identifier).ast;
  g.parenExpr = guardedWsDelimSeq(
    "(",
    m.delay(() => g.expr),
    ")"
  ).ast;

  // 6. Postfix expressions: allow chaining of calls, field access, array index, and postfix ops
  g.postfixSuffix = m.choice(
    m.seq(
      m.text("("),
      g.ws,
      m.delay(() => g.exprList),
      g.ws,
      m.text(")")
    ).ast, // func call
    m.seq(
      m.text("["),
      g.ws,
      m.delay(() => g.expr),
      g.ws,
      m.text("]")
    ).ast, // array index
    m.seq(m.text("."), g.ws, g.identifier).ast, // field select
    g.postfixOp
  );
  g.expr12 = g.parenExpr.or(g.leafExpr).ast;
  g.expr11 = g.expr12.then(g.ws).then(g.postfixSuffix.zeroOrMore).ast;
  g.expr10 = m.choice(m.seq(g.prefixOp, g.ws, g.expr11), g.expr11).ast;
  g.multiplicativeExpr = guardedWsDelimSeq(g.multiplicativeOp, g.expr10).ast;
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
    m.delay(() => g.expr),
    g.conditionalElseOp,
    m.delay(() => g.expr)
  ).ast;
  g.expr2 = g.expr3.then(g.conditionalExpr.opt).ast;
  g.assignmentExpr = guardedWsDelimSeq(g.assignmentOp, g.expr2).ast;
  g.expr1 = g.expr2.then(g.assignmentExpr.zeroOrMore).ast;
  g.expr = m.delay(() => g.expr1).ast;

  // 8. Preprocessor directives
  g.ppStart = m.choice(m.space, m.tab).zeroOrMore.then("#");
  g.ppType = g.identifier;
  g.ppDefineName = g.identifier;
  g.ppDefineArg = g.identifier;
  g.ppDefineExpr = g.untilEol.ast;
  g.ppDefineArgs = guardedWsDelimSeq(
    "(",
    commaDelimited(g.ppDefineArg),
    ")"
  ).ast;
  g.ppDefine = m.seq(
    "define",
    g.ws,
    g.ppDefineName.then(g.ppDefineArgs.opt),
    g.ppDefineExpr
  ).ast;
  g.ppOther = g.ppType.then(g.untilEol.then(g.ws)).ast;
  g.ppDirective = m.seq(g.ppStart, g.ws, m.choice(g.ppDefine, g.ppOther)).ast;

  // 9. Variable declarations
  g.varName = g.identifier;
  g.varArraySizeDecl = guardedWsDelimSeq("[", g.leafExpr, "]").ast;
  g.varInit = m.seq("=", g.ws, g.expr).ast;
  g.varNameAndInit = m.seq(
    g.varName,
    g.varArraySizeDecl.opt,
    g.ws.opt,
    g.varInit.opt
  ).ast;
  g.varDecl = m.seq(
    g.qualifiers.opt,
    g.typeExpr,
    g.ws.opt,
    commaDelimited(g.varNameAndInit),
    g.eos
  ).ast;

  // 10. Statements
  g.exprStatement = g.expr.then(g.ws).then(g.eos).ast;
  g.emptyStatement = g.eos.ast;
  g.breakStatement = guardedWsDelimSeq(m.keyword("break"), g.eos).ast;
  g.continueStatement = guardedWsDelimSeq(m.keyword("continue"), g.eos).ast;
  g.returnStatement = guardedWsDelimSeq(
    m.keyword("return"),
    g.expr.opt,
    g.eos
  ).ast;

  // 11. Control flow statements
  g.loopCond = guardedWsDelimSeq("(", g.expr, ")").ast;
  g.forLoopInit = m.choice(g.varDecl, g.exprStatement).ast;
  g.forLoopInvariant = guardedWsDelimSeq(g.expr.opt, g.eos).ast;
  g.forLoopVariant = g.expr.then(g.ws).opt.ast;
  g.forLoop = guardedWsDelimSeq(
    m.keyword("for"),
    "(",
    g.forLoopInit,
    g.forLoopInvariant,
    g.forLoopVariant,
    ")",
    m.delay(() => g.statement)
  ).ast;
  g.whileLoop = guardedWsDelimSeq(
    m.keyword("while"),
    g.loopCond,
    m.delay(() => g.statement)
  ).ast;
  g.doLoop = guardedWsDelimSeq(
    m.keyword("do"),
    m.delay(() => g.statement),
    m.keyword("while"),
    g.loopCond
  ).ast;
  g.elseStatement = guardedWsDelimSeq(
    m.keyword("else"),
    m.delay(() => g.statement)
  ).ast;
  g.ifStatement = guardedWsDelimSeq(
    m.keyword("if"),
    "(",
    g.expr,
    ")",
    m.delay(() => g.statement),
    g.elseStatement.opt
  ).ast;
  g.compoundStatement = guardedWsDelimSeq(
    "{",
    m.delay(() => g.statement).zeroOrMore,
    "}"
  ).ast;

  // 12. Statement definition (depends on all statement types)
  g.statement = m.choice(
    g.ppDirective,
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
  g.recStatement = m.delay(() => g.statement).ast;

  // 13. Function definitions
  g.funcParamName = g.identifier;
  g.funcParam = m.choice(
    m.keyword("void"),
    m.seq(g.qualifiers, g.typeExpr, g.ws, g.funcParamName)
  ).ast;
  g.funcName = g.identifier;
  g.funcParams = guardedWsDelimSeq(
    "(",
    m.keyword("void").or(commaDelimited(g.funcParam)),
    ")"
  ).ast;
  g.funcDef = m.seq(
    g.qualifiers.opt,
    g.typeExpr,
    g.ws,
    g.funcName,
    g.ws,
    g.funcParams,
    g.ws,
    g.compoundStatement
  ).ast;

  // 14. Struct definitions
  g.structMember = g.varDecl.ast;
  g.structVarName = g.identifier;
  g.structTypeName = g.identifier;
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

  // 15. Top-level declarations and program
  g.precisionDirective = guardedWsDelimSeq(
    "precision",
    g.precisionQualifier,
    g.typeExpr,
    g.eos
  );
  g.topLevelDecl = m.choice(
    g.ppDirective,
    g.structDef,
    g.precisionDirective,
    g.funcDef,
    g.varDecl
  ).ast;
  g.program = m.seq(
    g.ws,
    g.topLevelDecl.then(g.ws).zeroOrMore,
    m.assert(m.end)
  ).ast;

  // Restore funcCall for test compatibility: identifier followed by a function call suffix
  g.exprList = commaDelimited(m.delay(() => g.expr)).opt.ast;
  g.funcCall = m.seq(
    g.identifier,
    m.text("("),
    g.ws,
    m.delay(() => g.exprList),
    g.ws,
    m.text(")")
  ).ast;

  // Register the grammar, providing a name and the default parse rule
  myna.registerGrammar("glsl", g, g.program);

  return g;
}
