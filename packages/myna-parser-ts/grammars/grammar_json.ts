"use strict";

import { Myna } from "../src";

export interface JsonGrammar {
  escapedChar: Myna.Rule;
  quoteChar: Myna.Rule;
  fraction: Myna.Rule;
  plusOrMinus: Myna.Rule;
  exponent: Myna.Rule;
  comma: Myna.Rule;
  string: Myna.Rule;
  null: Myna.Rule;
  bool: Myna.Rule;
  number: Myna.Rule;
  value: Myna.Rule;
  array: Myna.Rule;
  pair: Myna.Rule;
  object: Myna.Rule;
  json: Myna.Rule;
  [key: string]: Myna.Rule; // Add index signature
}

// Implements a JSON (JavaScript Object Notation) grammar using the Myna parsing library
// See http://www.json.org
export function createJsonGrammar(myna: typeof Myna): JsonGrammar {
  const m = myna;

  const g: JsonGrammar = {
    escapedChar: m.seq(
      "\\",
      m.choice(
        '"',
        "\\",
        "/",
        "b",
        "f",
        "n",
        "r",
        "t",
        m.seq("u", m.hexDigit.repeat(4))
      )
    ).ast,
    quoteChar: null as any,
    fraction: m.seq(".", m.digit.oneOrMore).ast,
    plusOrMinus: m.char("+-").ast,
    exponent: null as any,
    comma: m.seq(m.ws, m.char(","), m.ws).ast,
    string: null as any,
    null: null as any,
    bool: null as any,
    number: null as any,
    value: null as any,
    array: null as any,
    pair: null as any,
    object: null as any,
    json: null as any,
  };

  // Set up circular references
  g.escapedChar = m.seq(
    "\\",
    m.choice(
      '"',
      "\\",
      "/",
      "b",
      "f",
      "n",
      "r",
      "t",
      m.seq("u", m.hexDigit.repeat(4))
    )
  ).ast;
  g.quoteChar = m.choice(g.escapedChar, m.notChar('"\\')).ast;
  g.exponent = m.seq(m.char("eE"), g.plusOrMinus.opt, m.digits).ast;
  g.string = m.seq('"', g.quoteChar.zeroOrMore, '"').ast;
  g.number = m.seq(
    g.plusOrMinus.opt,
    m.integer,
    g.fraction.opt,
    g.exponent.opt
  ).ast;
  g.null = m.keyword("null").ast;
  g.bool = m.keywords("true", "false").ast;

  // Define value rule with delayed references to avoid circular dependencies
  g.value = m.choice(
    g.string,
    g.number,
    g.bool,
    g.null,
    m.delay(() => g.array),
    m.delay(() => g.object)
  ).ast;

  // Define array and object rules
  g.array = m.seq(
    m.ws,
    "[",
    m.ws,
    m.choice(
      m.seq(g.value, m.seq(m.ws, g.comma, m.ws, g.value).zeroOrMore),
      m.text("")
    ),
    m.ws,
    "]",
    m.ws
  ).ast;

  g.pair = m.seq(g.string, m.ws, ":", m.ws, g.value).ast;

  g.object = m.seq(
    m.ws,
    "{",
    m.ws,
    m.choice(
      m.seq(g.pair, m.seq(m.ws, g.comma, m.ws, g.pair).zeroOrMore),
      m.text("")
    ),
    m.ws,
    "}",
    m.ws
  ).ast;

  // Register the grammar, providing a name and the default parse rule
  const root = m.seq(m.ws, g.value, m.ws, m.end).ast;
  root.name = "json";
  g.json = root;
  myna.registerGrammar("json", g, root);

  return g;
}
