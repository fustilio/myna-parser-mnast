// Pithy is a tiny embedded programming language whose syntax is a strict subset of Python.
// https://docs.python.org/2/reference/grammar.html

// Executing Pithy code within a Python interpreter is possible and should usually give the same results,
// but this is not guaranteed.     body {

// Some differences
// * No optional ";" only as a delimiter
// * Limited "import" forms
// * No global or exec statements
// * No modules
// * Identation must be 4 spaces

"use strict";

import { Myna } from "../src";

export interface PithyGrammar {
  untilEol: Myna.Rule;
  docString: Myna.Rule;
  commentText: Myna.Rule; // Added for revised comment handling
  comment: Myna.Rule;
  ws: Myna.Rule;
  indent: Myna.Rule;
  dedent: Myna.Rule; // Added for completeness, initially m.empty
  newLine: Myna.Rule; // Explicitly define newLine if used by program structure
  comma: Myna.Rule;
  escapedChar: Myna.Rule;
  doubleQuoteChar: Myna.Rule;
  singleQuoteChar: Myna.Rule;
  string: Myna.Rule;
  recExpr: Myna.Rule;
  recTest: Myna.Rule;
  // recStmt removed, g.stmt will be used directly
  recListIter: Myna.Rule;
  recCompIter: Myna.Rule;
  fraction: Myna.Rule;
  plusOrMinus: Myna.Rule;
  exponent: Myna.Rule;
  bool: Myna.Rule;
  number: Myna.Rule;
  literal: Myna.Rule;
  name: Myna.Rule;
  addOp: Myna.Rule;
  mulOp: Myna.Rule;
  prefixOp: Myna.Rule;
  shiftOp: Myna.Rule;
  xorOp: Myna.Rule;
  orOp: Myna.Rule;
  andOp: Myna.Rule;
  powOp: Myna.Rule;
  exprList: Myna.Rule;
  fpDef: Myna.Rule;
  fpList: Myna.Rule;
  recOldTest: Myna.Rule;
  recOrTest: Myna.Rule;
  oldLambda: Myna.Rule;
  oldTest: Myna.Rule;
  testListSafe: Myna.Rule;
  listFor: Myna.Rule;
  listIf: Myna.Rule;
  listIter: Myna.Rule;
  compIf: Myna.Rule;
  compFor: Myna.Rule;
  compIter: Myna.Rule;
  keyValue: Myna.Rule;
  dictMaker: Myna.Rule;
  setMaker: Myna.Rule;
  dictOrSetMaker: Myna.Rule;
  sliceOp: Myna.Rule;
  subScript: Myna.Rule;
  subScriptList: Myna.Rule;
  argument: Myna.Rule;
  argList: Myna.Rule;
  trailer: Myna.Rule;
  lambda: Myna.Rule;
  testList: Myna.Rule;
  testListComp: Myna.Rule;
  listMaker: Myna.Rule;
  strings: Myna.Rule;
  yieldExpr: Myna.Rule;
  atom: Myna.Rule;
  powExpr: Myna.Rule;
  factor: Myna.Rule;
  mulExpr: Myna.Rule;
  addExpr: Myna.Rule;
  shiftExpr: Myna.Rule;
  andExpr: Myna.Rule;
  xorExpr: Myna.Rule;
  expr: Myna.Rule;
  compOp: Myna.Rule;
  comparison: Myna.Rule;
  notTest: Myna.Rule;
  andTest: Myna.Rule;
  orTest: Myna.Rule;
  test: Myna.Rule;
  suite: Myna.Rule;
  withItem: Myna.Rule;
  withStmt: Myna.Rule;
  parameter: Myna.Rule;
  parameters: Myna.Rule;
  functionDef: Myna.Rule;
  dottedName: Myna.Rule;
  yieldOrTest: Myna.Rule;
  augmentedAssign: Myna.Rule;
  elseStmt: Myna.Rule;
  forStmt: Myna.Rule;
  whileStmt: Myna.Rule;
  elifStmt: Myna.Rule;
  ifStmt: Myna.Rule;
  compoundStmt: Myna.Rule;
  assertStmt: Myna.Rule;
  importStmt: Myna.Rule;
  passStmt: Myna.Rule;
  breakStmt: Myna.Rule;
  continueStmt: Myna.Rule;
  returnStmt: Myna.Rule;
  yieldStmt: Myna.Rule;
  raiseStmt: Myna.Rule;
  flowStmt: Myna.Rule;
  delStmt: Myna.Rule;
  printStmt: Myna.Rule;
  exprStmt: Myna.Rule;
  smallStmt: Myna.Rule;
  simpleStmt: Myna.Rule;
  stmt: Myna.Rule;
  // stmtPlus: Myna.Rule; // Removed
  file_item: Myna.Rule; // Replaces singleInput
  program: Myna.Rule;
  [key: string]: Myna.Rule; // Index signature
}

export function createPithyGrammar(myna: typeof Myna): PithyGrammar {
  const m = myna;

  m.keywords(
    "True",
    "False",
    "lambda",
    "for",
    "in",
    "if",
    "else",
    "elif",
    "while",
    "def",
    "with",
    "as",
    "assert",
    "import",
    "pass",
    "break",
    "continue",
    "return",
    "yield",
    "raise",
    "del",
    "print",
    "not",
    "and",
    "or",
    "is"
  );

  const g: PithyGrammar = {} as PithyGrammar;

  g.stmt = m.delay(() => m.choice(g.simpleStmt, g.compoundStmt)).ast;

  g.suite = m.delay(() => {
    const indented_line = m.choice(m.seq(g.indent, g.stmt), g.blankLine);
    const indented_block = m.seq(m.newLine, indented_line.oneOrMore, g.dedent);
    return m.choice(g.simpleStmt, indented_block);
  }).ast;

  g.commentText = m.advanceWhileNot(m.newLine);
  g.comment = m.seq("#", g.commentText);
  g.sp = m.choice(m.char(" \t"), g.comment).zeroOrMore;
  g.ws = m.choice(m.char(" \t\r\n\f\v"), g.comment).zeroOrMore;
  g.eos = m.text(";").then(g.ws).ast;

  g.spNotNewline = g.sp; // Alias for clarity, they are the same.

  function guardedSeq(...rules: Myna.RuleType[]) {
    if (rules.length === 0) return m.truePredicate;
    let currentSeq = m.RuleTypeToRule(rules[0]);
    for (let i = 1; i < rules.length; ++i) {
      currentSeq = currentSeq.then(g.sp).then(m.RuleTypeToRule(rules[i]));
    }
    return currentSeq;
  }

  function commaList(r: Myna.Rule, trailing = true) {
    const flexible_comma_separator = m.seq(g.sp.opt, g.comma, g.sp.opt);
    const result = r.then(m.seq(flexible_comma_separator, r).zeroOrMore);
    if (trailing) return result.then(flexible_comma_separator.opt);
    return result;
  }

  function keyword(text: string) {
    return m.seq(text, m.not(m.atIdentifierNext));
  }

  g.untilEol = m.advanceWhileNot(m.newLine).then(m.newLine.opt);
  g.docString = m.seq('"""', m.advanceUntilPast('"""'));
  g.indent = m.text("    ");
  g.dedent = m.not(g.indent);
  g.blankLine = m.seq(g.sp, m.newLine);

  g.comma = m.char(",");
  g.escapedChar = m.seq("\\", m.advance);
  g.doubleQuoteChar = m.choice(g.escapedChar, m.notChar('"'));
  g.singleQuoteChar = m.choice(g.escapedChar, m.notChar("'"));
  g.string = m
    .choice(
      m.doubleQuoted(g.doubleQuoteChar.zeroOrMore),
      m.singleQuoted(g.singleQuoteChar.zeroOrMore)
    )
    .unless(g.docString).ast;

  g.recExpr = m.delay(() => g.expr).ast;
  g.recTest = m.delay(() => g.test);
  g.recListIter = m.delay(() => g.listIter);
  g.recCompIter = m.delay(() => g.compIter);

  g.fraction = m.seq(".", m.digit.zeroOrMore);
  g.plusOrMinus = m.char("+-");
  g.exponent = m.seq(m.char("eE"), g.plusOrMinus.opt, m.digits);
  g.bool = m.choice(keyword("True"), keyword("False")).ast;
  g.number = m.seq(
    g.plusOrMinus.opt,
    m.integer.then(g.fraction.opt).or(g.fraction),
    g.exponent.opt
  ).ast;
  g.literal = m.choice(g.number, g.bool);

  const anyPithyKeywordMatcher = m.keywords(
    "True",
    "False",
    "lambda",
    "for",
    "in",
    "if",
    "else",
    "elif",
    "while",
    "def",
    "with",
    "as",
    "assert",
    "import",
    "pass",
    "break",
    "continue",
    "return",
    "yield",
    "raise",
    "del",
    "print",
    "not",
    "and",
    "or",
    "is"
  );
  const keywordAsWholeWord = anyPithyKeywordMatcher.then(
    m.not(m.atIdentifierNext)
  );

  const identifierFirst = m.choice(m.letter, m.char("_"));
  const identifierNext = m.choice(m.letter, m.digit, m.char("_"));
  g.any_identifier = m.seq(identifierFirst, identifierNext.zeroOrMore);

  g.name = g.any_identifier.unless(keywordAsWholeWord).ast;

  g.addOp = m.choice("+", "-").ast;
  g.mulOp = m.choice("*", "//", "%", "/").ast;
  g.prefixOp = m.choice("+", "-", "~").ast;
  g.shiftOp = m.choice("<<", ">>").ast;
  g.xorOp = m.text("^").ast;
  g.orOp = m.text("|").ast;
  g.andOp = m.text("&").ast;
  g.powOp = m.text("**").ast;

  g.exprList = commaList(g.recExpr).ast;

  g.fpDef = g.name.ast;
  g.fpList = commaList(g.fpDef).ast;

  g.recOldTest = m.delay(() => g.oldTest);
  g.recOrTest = m.delay(() => g.orTest);
  g.oldLambda = guardedSeq(
    keyword("lambda"),
    g.fpList.opt,
    ":",
    g.recOldTest
  ).ast;
  g.oldTest = g.recOrTest.or(g.oldLambda).ast;
  g.testListSafe = commaList(g.oldTest).ast;

  g.listFor = guardedSeq(
    keyword("for"),
    g.exprList,
    keyword("in"),
    g.testListSafe,
    g.recListIter.opt
  ).ast;
  g.listIf = guardedSeq(keyword("if"), g.oldTest, g.recListIter).ast;
  g.listIter = g.listFor.or(g.listIf).ast;

  g.compIf = guardedSeq(keyword("if"), g.oldTest, g.recCompIter.opt).ast;
  g.compFor = guardedSeq(
    keyword("for"),
    g.exprList,
    keyword("in"),
    g.recOrTest,
    g.recCompIter.opt
  ).ast;
  g.compIter = g.compFor.or(g.compIf).ast;

  g.keyValue = m.seq(g.recTest, ":", g.recTest).ast;
  g.dictMaker = m.seq(
    g.keyValue,
    m.choice(g.compFor, commaList(g.keyValue))
  ).ast;
  g.setMaker = m.seq(g.recTest, m.choice(g.compFor, commaList(g.recTest))).ast;
  g.dictOrSetMaker = m.choice(g.dictMaker, g.setMaker);

  g.sliceOp = guardedSeq(":", g.recTest.opt).ast;
  g.subScript = m.choice(
    "...",
    m.seq(g.recTest.opt, ":", g.recTest.opt, g.sliceOp.opt),
    g.recTest
  );
  g.subScriptList = commaList(g.subScript);

  g.argument = m.seq(g.recTest, g.compFor.opt).ast;
  g.argList = commaList(g.argument).ast;
  g.trailer = m.choice(
    guardedSeq("(", g.argList.opt, ")"),
    guardedSeq("[", g.subScriptList.opt, "]"),
    m.seq(".", g.name)
  ).ast;

  g.lambda = guardedSeq(keyword("lambda"), g.fpList.opt, ":", g.recExpr).ast;

  g.testList = commaList(g.recTest).ast;
  g.testListComp = g.recTest.then(g.compFor.or(g.testList)).ast;
  g.listMaker = g.recTest.then(g.listFor.or(g.testList)).ast;
  g.strings = m.oneOrMore(m.seq(g.string, g.sp)).ast;
  g.yieldExpr = guardedSeq(keyword("yield"), g.testList.opt).ast;

  g.atom = m.delay(() => {
    return m.choice(
      guardedSeq("(", g.yieldExpr.or(g.testListComp).opt, ")"),
      guardedSeq("[", g.listMaker.opt, "]"),
      guardedSeq("{", g.dictOrSetMaker.opt, "}"),
      g.name,
      g.number,
      g.strings,
      g.bool
    );
  }).ast;

  g.powExpr = m.seq(
    g.atom,
    g.trailer.zeroOrMore,
    m.seq(g.sp, g.powOp, g.sp, m.delay(() => g.factor)).opt
  ).ast;
  g.factor = m.delay(() =>
    m.choice(m.seq(g.prefixOp, g.sp, g.factor), g.powExpr)
  ).ast;
  g.mulExpr = g.factor.then(
    m.seq(g.sp, g.mulOp, g.sp, g.factor).zeroOrMore
  ).ast;
  g.addExpr = g.mulExpr.then(
    m.seq(g.sp, g.addOp, g.sp, g.mulExpr).zeroOrMore
  ).ast;
  g.shiftExpr = g.addExpr.then(
    m.seq(g.sp, g.shiftOp, g.sp, g.addExpr).zeroOrMore
  ).ast;
  g.andExpr = g.shiftExpr.then(
    m.seq(g.sp, g.andOp, g.sp, g.shiftExpr).zeroOrMore
  ).ast;
  g.xorExpr = g.andExpr.then(
    m.seq(g.sp, g.xorOp, g.sp, g.andExpr).zeroOrMore
  ).ast;
  g.expr = g.xorExpr.then(
    m.seq(g.sp, g.orOp, g.sp, g.xorExpr).zeroOrMore
  ).ast;

  g.compOp = m.choice(
    m.text("=="),
    m.text(">="),
    m.text("<="),
    m.text("<>"),
    m.text("!="),
    m.text("<"),
    m.text(">"),
    keyword("in"),
    m.seq(keyword("not"), g.sp, keyword("in")),
    m.seq(keyword("is"), g.sp, keyword("not")),
    keyword("is")
  ).ast;
  g.comparison = g.expr.then(
    m.seq(g.sp, g.compOp, g.sp, g.expr).zeroOrMore
  ).ast;
  g.notTest = m.delay(() =>
    m.choice(m.seq(keyword("not"), g.sp, g.notTest), g.comparison)
  ).ast;
  g.andTest = g.notTest.then(
    m.seq(g.sp, keyword("and"), g.sp, g.notTest).zeroOrMore
  ).ast;
  g.orTest = g.andTest.then(
    m.seq(g.sp, keyword("or"), g.sp, g.andTest).zeroOrMore
  ).ast;
  g.test = m
    .seq(
      g.orTest,
      m.seq(
        g.sp,
        guardedSeq(keyword("if"), g.orTest, keyword("else"), g.recTest)
      ).opt
    )
    .or(g.lambda).ast;

  g.withItem = m.seq(g.test, guardedSeq(keyword("as"), g.expr).opt).ast;
  g.withStmt = m.seq(
    keyword("with"),
    g.sp,
    commaList(g.withItem),
    g.sp,
    m.text(":"),
    g.sp.opt,
    g.suite
  ).ast;

  g.parameter = g.name.ast;
  g.parameters = guardedSeq("(", commaList(g.parameter, false).opt, ")").ast;

  g.functionDef = m.seq(
    keyword("def"),
    g.sp,
    g.name,
    g.sp,
    g.parameters,
    g.sp.opt,
    m.text(":"),
    g.sp.opt,
    g.suite
  ).ast;

  g.dottedName = g.name.then(guardedSeq(".", g.name).zeroOrMore).ast;
  g.yieldOrTest = m.choice(g.yieldExpr, g.testList);
  g.augmentedAssign = m.choice(
    "+=",
    "-=",
    "*=",
    "/=",
    "%=",
    "&=",
    "|=",
    "^=",
    "<<=",
    ">>=",
    "**=",
    "//="
  ).ast;

  g.elseStmt = m.seq(keyword("else"), g.sp, m.text(":"), g.sp.opt, g.suite).ast;
  g.forStmt = m.seq(
    keyword("for"),
    g.sp,
    g.exprList,
    g.sp,
    keyword("in"),
    g.sp,
    g.testList,
    g.sp.opt,
    m.text(":"),
    g.sp.opt,
    g.suite,
    g.elseStmt.opt
  ).ast;
  g.whileStmt = m.seq(
    keyword("while"),
    g.sp,
    g.test,
    g.sp.opt,
    m.text(":"),
    g.sp.opt,
    g.suite,
    g.elseStmt.opt
  ).ast;
  g.elifStmt = m.seq(
    keyword("elif"),
    g.sp,
    g.test,
    g.sp.opt,
    m.text(":"),
    g.sp.opt,
    g.suite
  ).ast;
  g.ifStmt = m.seq(
    keyword("if"),
    g.sp,
    g.test,
    g.sp.opt,
    m.text(":"),
    g.sp.opt,
    g.suite,
    g.elifStmt.zeroOrMore,
    g.elseStmt.opt
  ).ast;
  g.compoundStmt = m.choice(
    g.ifStmt,
    g.whileStmt,
    g.forStmt,
    g.withStmt,
    g.functionDef
  );

  g.assertStmt = guardedSeq(
    keyword("assert"),
    g.test,
    guardedSeq(",", g.test).opt
  ).ast;
  g.importStmt = guardedSeq(
    keyword("import"),
    g.dottedName,
    guardedSeq(keyword("as"), g.name).opt
  ).ast;
  g.passStmt = keyword("pass").ast;
  g.breakStmt = keyword("break").ast;
  g.continueStmt = keyword("continue").ast;
  g.returnStmt = guardedSeq(keyword("return"), g.testList.opt).ast;
  g.yieldStmt = g.yieldExpr.ast;
  g.raiseStmt = guardedSeq(
    keyword("raise"),
    g.test.then(guardedSeq(",", g.test, guardedSeq(",", g.test).opt).opt).opt
  ).ast;
  g.flowStmt = m.choice(
    g.breakStmt,
    g.continueStmt,
    g.returnStmt,
    g.raiseStmt,
    g.yieldStmt
  ).ast;
  g.delStmt = guardedSeq(keyword("del"), g.exprList).ast;

  const printToStdOut = commaList(g.test, true).opt;
  const printToFileTarget = m.seq(">>", g.sp, g.test);
  const printFileArgs = m
    .seq(g.comma, g.sp, g.test)
    .oneOrMore.then(g.comma.opt).opt;
  const printToFile = m.seq(printToFileTarget, printFileArgs.opt);
  g.printStmt = m.seq(
    keyword("print"),
    g.sp,
    m.choice(printToFile, printToStdOut)
  ).ast;

  g.exprStmt = g.testList.then(
    m.seq(
      g.sp.opt,
      m.choice(
        m.seq(g.augmentedAssign, g.sp.opt, g.yieldOrTest),
        m.seq(m.text("="), g.sp.opt, g.yieldOrTest).oneOrMore
      )
    ).opt
  ).ast;
  g.smallStmt = m.choice(
    g.exprStmt,
    g.printStmt,
    g.delStmt,
    g.passStmt,
    g.flowStmt,
    g.importStmt,
    g.assertStmt
  ).ast;

  g.simpleStmt = m.seq(
    g.smallStmt,
    m.zeroOrMore(m.seq(";", g.sp, g.smallStmt)),
    m.opt(";"),
    g.sp, // trailing whitespace/comment
    m.choice(m.newLine, m.at(m.end))
  ).ast;

  g.file_item = m.choice(g.blankLine, m.seq(g.sp, m.not(g.indent), g.stmt));

  g.program = g.file_item.zeroOrMore.then(m.end).ast;

  m.registerGrammar("pithy", g, g.program);
  return g;
}
