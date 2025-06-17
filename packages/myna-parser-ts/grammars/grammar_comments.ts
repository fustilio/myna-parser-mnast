"use strict";

import { Myna } from "../src";

export interface CommentsGrammar {
  lineComment: Myna.Rule;
  blockComment: Myna.Rule;
  ws: Myna.Rule;
  newLine: Myna.Rule;
  code: Myna.Rule;
  element: Myna.Rule;
  file: Myna.Rule;
  [key: string]: Myna.Rule;
}

// Implements a parser for common programming language comments (C++, Java, JS, TS, etc.)
export function createCommentsGrammar(myna: typeof Myna): CommentsGrammar {
  const m = myna;

  const g: CommentsGrammar = {
    lineComment: null as any,
    blockComment: null as any,
    ws: null as any,
    newLine: null as any,
    code: null as any,
    element: null as any,
    file: null as any,
  };

  g.newLine = m.newLine.ast;
  g.lineComment = m.seq("//", m.advanceWhileNot(m.newLine), g.newLine.opt).ast;
  g.blockComment = m.seq("/*", m.advanceUntilPast("*/")).ast;
  g.ws = m.char(" \t").oneOrMore.ast;
  g.code = m.not(m.choice("/", m.char(" \t\r\n"))).then(m.advance).ast;
  g.element = m.choice(g.ws, g.lineComment, g.blockComment, g.code, g.newLine).ast;
  g.file = g.element.zeroOrMore.then(m.end).ast;

  myna.registerGrammar("comments", g, g.file);
  return g;
}

