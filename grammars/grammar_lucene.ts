"use strict";

// This is a grammar for Lucene 4.0 and Solr queries
// http://lucene.apache.org/core/4_0_0/queryparser/org/apache/lucene/queryparser/classic/package-summary.html
// https://wiki.apache.org/solr/SolrQuerySyntax

// Additional grammars to be built
// https://cwiki.apache.org/confluence/display/solr/Spatial+Search
// https://wiki.apache.org/solr/SpatialSearch
// http://lucene.apache.org/core/4_0_0/core/org/apache/lucene/util/automaton/RegExp.html?is-external=true

// Sample grammars
// https://github.com/thoward/lucene-query-parser.js/blob/master/lib/lucene-query.grammar
// https://github.com/lrowe/lucenequery/blob/master/lucenequery/StandardLuceneGrammar.g4
// https://github.com/romanchyla/montysolr/blob/master/contrib/antlrqueryparser/grammars/StandardLuceneGrammar.g

// TODO: is a&&b a single term? Or two terms?
// TODO: support geo-coordinate parsing
// TODO: support fucntion parsing

// TODO: support date-time parsing
// http://lucene.apache.org/solr/6_5_1/solr-core/org/apache/solr/util/DateMathParser.html

import { Myna } from "../src";

interface LuceneGrammar {
  delayedQuery: Myna.Rule;
  ws: Myna.Rule;
  escapedChar: Myna.Rule;
  float: Myna.Rule;
  boostFactor: Myna.Rule;
  boost: Myna.Rule;
  fuzzFactor: Myna.Rule;
  fuzz: Myna.Rule;
  modifier: Myna.Rule;
  symbolicOperator: Myna.Rule;
  operator: Myna.Rule;
  termChar: Myna.Rule;
  singleTerm: Myna.Rule;
  fieldName: Myna.Rule;
  field: Myna.Rule;
  phrase: Myna.Rule;
  regex: Myna.Rule;
  group: Myna.Rule;
  endPoint: Myna.Rule;
  inclusiveRange: Myna.Rule;
  exclusiveRange: Myna.Rule;
  range: Myna.Rule;
  postOps: Myna.Rule;
  term: Myna.Rule;
  keyChar: Myna.Rule;
  paramKey: Myna.Rule;
  singleQuotedValue: Myna.Rule;
  doubleQuotedValue: Myna.Rule;
  paramValue: Myna.Rule;
  param: Myna.Rule;
  localParams: Myna.Rule;
  terms: Myna.Rule;
  query: Myna.Rule;
}

export function createLuceneGrammar(myna: typeof Myna): LuceneGrammar {
  const m = myna;

  const g: LuceneGrammar = {
    delayedQuery: null as any,
    ws: null as any,
    escapedChar: null as any,
    float: null as any,
    boostFactor: null as any,
    boost: null as any,
    fuzzFactor: null as any,
    fuzz: null as any,
    modifier: null as any,
    symbolicOperator: null as any,
    operator: null as any,
    termChar: null as any,
    singleTerm: null as any,
    fieldName: null as any,
    field: null as any,
    phrase: null as any,
    regex: null as any,
    group: null as any,
    endPoint: null as any,
    inclusiveRange: null as any,
    exclusiveRange: null as any,
    range: null as any,
    postOps: null as any,
    term: null as any,
    keyChar: null as any,
    paramKey: null as any,
    singleQuotedValue: null as any,
    doubleQuotedValue: null as any,
    paramValue: null as any,
    param: null as any,
    localParams: null as any,
    terms: null as any,
    query: null as any
  };

  g.delayedQuery = m.delay(() => g.query);
  g.ws = m.char(" \t\n\r\f").zeroOrMore;
  g.escapedChar = m.char("\\").advance;
  g.float = m.digit.zeroOrMore.then(m.seq(".", m.digits).opt).ast;

  g.boostFactor = g.float.ast;
  g.boost = m.text("^").then(g.boostFactor).ast;

  g.fuzzFactor = g.float.ast;
  g.fuzz = m.seq("~", g.fuzzFactor.opt).ast;

  g.modifier = m.char("+-").ast;

  g.symbolicOperator = m.choice("||", "&&", "!");
  g.operator = m
    .keywords("OR NOT", "AND NOT", "OR", "AND", "NOT")
    .or(g.symbolicOperator).opt.ast;

  // Represents valid termchars
  // NOTE: according to the specification additional characters are not accepted: ':/&|' however, many of these
  // interfere with date parsing.
  g.termChar = m
    .seq(g.symbolicOperator.not, m.notChar(' \t\r\n\f{}()"^~[]\\'))
    .or(g.escapedChar);

  g.singleTerm = g.termChar.oneOrMore.ast;
  g.fieldName = g.termChar.unless(m.char(":/")).oneOrMore.ast;
  g.field = g.fieldName.then(":");

  g.phrase = m.doubleQuoted(m.notChar('"').zeroOrMore).ast;
  g.regex = m.seq("/", m.notChar("/").zeroOrMore, "/").ast;

  g.group = m.seq("(", g.delayedQuery, m.assert(")")).ast;

  g.endPoint = m.seq(g.ws, g.singleTerm, g.ws);
  g.inclusiveRange = m.seq(
    "[",
    g.endPoint,
    m.keyword("TO"),
    g.endPoint,
    "]"
  ).ast;
  g.exclusiveRange = m.seq(
    "{",
    g.endPoint,
    m.keyword("TO"),
    g.endPoint,
    "}"
  ).ast;
  g.range = m.choice(g.inclusiveRange, g.exclusiveRange).ast;
  g.postOps = m.choice(
    g.boost.then(g.fuzz.opt),
    g.fuzz.then(g.boost.opt)
  );
  g.term = m.seq(
    g.field.opt,
    g.modifier.opt,
    m.choice(
      g.group,
      g.singleTerm,
      g.phrase,
      g.regex,
      g.range
    ),
    g.postOps.opt
  ).ast;

  // localParams
  g.keyChar = m.letter.or(".");
  g.paramKey = g.keyChar.oneOrMore.ast;
  g.singleQuotedValue = m.singleQuotedString(g.escapedChar).ast;
  g.doubleQuotedValue = m.doubleQuotedString(g.escapedChar).ast;
  g.paramValue = m.choice(
    g.singleQuotedValue,
    g.doubleQuotedValue,
    g.term
  ).ast;
  g.param = g.paramKey.then("=").opt.then(g.paramValue).ast;
  g.localParams = m.seq(
    "{!",
    m.delimited(g.param, g.ws),
    m.assert("}")
  ).ast;

  // Query
  g.terms = m.delimited(
    g.term.then(g.ws),
    g.operator.then(g.ws)
  ).ast;
  g.query = m.seq(
    g.ws,
    g.localParams.opt,
    g.ws,
    g.terms,
    g.ws
  ).ast;

  // Register the grammar, providing a name and the default parse rule
  myna.registerGrammar("lucene", g, g.query);
  return g;
}
