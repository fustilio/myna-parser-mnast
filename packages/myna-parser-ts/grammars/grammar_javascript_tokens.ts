"use strict";

// Implements a grammar for parsing JavaScript code into tokens
// See:
// - https://tc39.github.io/ecma262/#sec-ecmascript-language-lexical-grammar
// - https://github.com/jquery/esprima/blob/master/src/scanner.ts
// - https://github.com/jquery/esprima/blob/master/src/token.ts

import { Myna } from "../src";

export interface JavascriptTokensGrammar {
  whiteSpace: Myna.Rule;
  lineTerminator: Myna.Rule;
  singleLineComment: Myna.Rule;
  multiLineComment: Myna.Rule;
  comment: Myna.Rule;
  identifier: Myna.Rule;
  number: Myna.Rule;
  string: Myna.Rule;
  punctuator: Myna.Rule;
  token: Myna.Rule;
  file: Myna.Rule;
  error: Myna.Rule;
  doubleQuotedString: Myna.Rule;
  singleQuotedString: Myna.Rule;
  unterminatedDoubleQuotedString: Myna.Rule;
  unterminatedSingleQuotedString: Myna.Rule;
  escape: Myna.Rule;
  [key: string]: Myna.Rule;
}

export function createJavascriptTokensGrammar(myna: typeof Myna): JavascriptTokensGrammar {
  const m = myna;
  const g: JavascriptTokensGrammar = {
    whiteSpace: null as any,
    lineTerminator: null as any,
    singleLineComment: null as any,
    multiLineComment: null as any,
    comment: null as any,
    identifier: null as any,
    number: null as any,
    string: null as any,
    punctuator: null as any,
    token: null as any,
    file: null as any,
    error: null as any,
    doubleQuotedString: null as any,
    singleQuotedString: null as any,
    unterminatedDoubleQuotedString: null as any,
    unterminatedSingleQuotedString: null as any,
    escape: null as any,
  };

  g.whiteSpace = m.char(" \t\v\f\r\n").oneOrMore.ast;
  g.lineTerminator = m.char("\n\r\u2028\u2029").ast;
  g.singleLineComment = m.seq("//", m.advanceWhileNot(g.lineTerminator), g.lineTerminator.opt).ast;
  g.multiLineComment = m.seq("/*", m.advanceUntilPast("*/")).ast;
  g.comment = m.choice(g.singleLineComment, g.multiLineComment).ast;

  // Identifiers (simplified, not full Unicode)
  g.identifier = m.seq(m.letter.or("_"), m.letter.or(m.digit).or("_").zeroOrMore).ast;

  // Numbers (simplified: decimal only)
  g.number = m.seq(m.digits, m.seq(".", m.digits).opt).ast;

  // Escape sequence: backslash followed by any character
  g.escape = m.seq("\\", m.advance);

  // Double-quoted string: allow escapes and non-quote, non-newline chars
  g.doubleQuotedString = m.seq(
    '"',
    m.choice(g.escape, m.notChar('"\n\r\\')).zeroOrMore,
    '"'
  ).ast;

  // Single-quoted string: allow escapes and non-quote, non-newline chars
  g.singleQuotedString = m.seq(
    "'",
    m.choice(g.escape, m.notChar("'\n\r\\")).zeroOrMore,
    "'"
  ).ast;

  // Unterminated double-quoted string: starts with ", no closing ", no newlines
  g.unterminatedDoubleQuotedString = m.seq(
    '"',
    m.choice(g.escape, m.notChar('"\n\r\\')).zeroOrMore,
    m.assert(m.end)
  ).ast;

  // Unterminated single-quoted string: starts with ', no closing ', no newlines
  g.unterminatedSingleQuotedString = m.seq(
    "'",
    m.choice(g.escape, m.notChar("'\n\r\\")).zeroOrMore,
    m.assert(m.end)
  ).ast;

  g.string = m.choice(g.doubleQuotedString, g.singleQuotedString).ast;

  // Punctuators (common subset)
  g.punctuator = m.choice(
    "{", "}", "(", ")", "[", "]", ".", ";", ",", "<", ">", "<=", ">=", "==", "!=", "+", "-", "*", "%", "++", "--", "<<", ">>", "&", "|", "^", "!", "~", "&&", "||", "?", ":", "=", "+=", "-=", "*=", "%=", "<<=", ">>=", "&=", "|=", "^=", "=>", "**", "**="
  ).ast;

  // Token: any of the above, excluding errors for file rule
  g.token = m.choice(
    g.whiteSpace,
    g.comment,
    g.identifier,
    g.number,
    g.doubleQuotedString,
    g.singleQuotedString,
    g.punctuator
  ).ast;

  // Error token: unterminated string or comment
  g.error = m.choice(
    g.unterminatedDoubleQuotedString,
    g.unterminatedSingleQuotedString,
    m.seq("/*", m.advanceUntilPast("*/").not),
    m.advance
  ).ast;

  // File: zero or more valid tokens, must consume all input, and must not contain errors
  g.file = m.seq(
    m.zeroOrMore(g.token),
    m.not(g.error),
    m.end
  ).ast;

  myna.registerGrammar("javascript_tokens", g, g.file);
  return g;
}

// Export the grammar for usage by Node.js and CommonJs compatible module loaders 
if (typeof module === "object" && module.exports) 
    module.exports = createJavascriptTokensGrammar;