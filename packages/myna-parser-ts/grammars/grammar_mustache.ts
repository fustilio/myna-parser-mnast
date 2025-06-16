import { Myna } from "../src";

interface MustacheGrammar {
  recursiveContent: Myna.Rule;
  key: Myna.Rule;
  restOfLine: Myna.Rule;
  startSection: Myna.Rule;
  endSection: Myna.Rule;
  startInvertedSection: Myna.Rule;
  escapedVar: Myna.Rule;
  unescapedVar: Myna.Rule;
  var: Myna.Rule;
  partial: Myna.Rule;
  comment: Myna.Rule;
  sectionContent: Myna.Rule;
  section: Myna.Rule;
  invertedSection: Myna.Rule;
  plainText: Myna.Rule;
  content: Myna.Rule;
  document: Myna.Rule;
}

// A Myna grammar for a variant of the Mustache and CTemplate template languages
// This grammar works with any template delimiters defaulting to "{{" and "}}"
// - http://mustache.github.io/mustache.5.html
// - https://github.com/olafvdspek/ctemplate
// According to the mustache documentation:
// - `#` indicates a start section
// - `/` indicates an end section
// - `^` indicates an inverted section
// - `!` indcates a comment
// - `&` or `{` indicate an unescaped variable
// - `>` indicates a *partial* which is effectively a file include with run-time expansion.

export function createMustacheGrammar(
  myna: typeof Myna,
  start?: string,
  end?: string
): void {
  const startDelimiter = start ?? "{{";
  const endDelimiter = end ?? "}}";

  if (startDelimiter.length === 0 || endDelimiter.length === 0)
    throw new Error("Missing start and end delimiters");

  const m = myna;

  const g: MustacheGrammar = {
    recursiveContent: null as any,
    key: null as any,
    restOfLine: null as any,
    startSection: null as any,
    endSection: null as any,
    startInvertedSection: null as any,
    escapedVar: null as any,
    unescapedVar: null as any,
    var: null as any,
    partial: null as any,
    comment: null as any,
    sectionContent: null as any,
    section: null as any,
    invertedSection: null as any,
    plainText: null as any,
    content: null as any,
    document: null as any,
  };

  // Define a rule so that we can refer to content recursively
  g.recursiveContent = m.delay(() => g.content);

  // Main grammar rules.
  // Only those with 'ast' will generate nodes in the parse tree
  g.key = m.advanceWhileNot(endDelimiter).ast;
  g.restOfLine = m.char(" \t").zeroOrMore.then(m.opt("\n"));
  g.startSection = m.seq(
    startDelimiter,
    "#",
    g.key,
    endDelimiter,
    g.restOfLine
  );
  g.endSection = m.seq(startDelimiter, "/", g.key, endDelimiter);
  g.startInvertedSection = m.seq(
    startDelimiter,
    "^",
    g.key,
    endDelimiter,
    g.restOfLine
  );
  g.escapedVar = m.seq(
    startDelimiter,
    m.notAtChar("#/^!{&<"),
    g.key,
    endDelimiter
  ).ast;
  g.unescapedVar = m.seq(
    startDelimiter,
    m.choice(m.seq("{", g.key, "}"), m.seq("&", g.key)),
    endDelimiter
  ).ast;
  g.var = m.choice(g.escapedVar, g.unescapedVar);
  g.partial = m.seq(startDelimiter, ">", m.ws.opt, g.key, endDelimiter).ast;
  g.comment = m.seq(startDelimiter, "!", g.key, endDelimiter).ast;
  g.sectionContent = g.recursiveContent.ast;
  g.section = m.guardedSeq(g.startSection, g.sectionContent, g.endSection).ast;
  g.invertedSection = m.guardedSeq(
    g.startInvertedSection,
    g.sectionContent,
    g.endSection
  ).ast;
  g.plainText = m.advanceOneOrMoreWhileNot(startDelimiter).ast;
  g.content = m.choice(
    g.invertedSection,
    g.section,
    g.comment,
    g.partial,
    g.var,
    g.plainText
  ).zeroOrMore;
  g.document = g.content.ast;

  // Register the grammar, providing a name and the default parse rule
  myna.registerGrammar("mustache", g, g.document);
}
