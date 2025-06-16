import { Myna } from "../src";

// Implements a grammar for the Git-flavor of Markdown
// https://daringfireball.net/projects/markdown/syntax#autolink
// https://help.github.com/articles/basic-writing-and-formatting-syntax/
// https://guides.github.com/features/mastering-markdown/

export function createMarkdownGrammar(myna: typeof Myna) {
  const m = myna;

  const g = new (class {
    // Allows the "inline" to be referenced before it is defined.
    // This enables recursive definitions.
    inlineDelayed = m.delay(() => this.inline);

    boundedInline(begin: string, end?: string) {
      if (end === undefined) end = begin;
      return m.seq(begin, this.inlineDelayed.unless(end).zeroOrMore, end);
    }

    // Plain text
    specialCharSet = "[]()*~`@#\\_!";
    escaped = m.seq("\\", m.advance).ast;
    ws = m.char(" \t").oneOrMore;
    optWs = this.ws.opt;
    wsOrNewLine = this.ws.or(m.newLine);
    nonSpecialChar = m.notChar(this.specialCharSet).unless(m.newLine);
    specialChar = m.char(this.specialCharSet).ast;
    plainText = m.choice(m.digits, m.letters, this.ws, this.nonSpecialChar)
      .oneOrMore.ast;

    // Styling instructions
    bold = m.choice(this.boundedInline("**"), this.boundedInline("__")).ast;
    boldItalic = m.choice(
      this.boundedInline("*_", "_*"),
      this.boundedInline("_*", "*_")
    ).ast;
    italic = m.choice(this.boundedInline("*"), this.boundedInline("_")).ast;
    strike = this.boundedInline("~~").ast;
    code = m.not("```").then(this.boundedInline("`")).ast;
    styledText = m.choice(this.bold, this.italic, this.strike);

    // Image instructions
    linkedUrl = m.choice(this.escaped, m.notChar(")")).zeroOrMore.ast;
    altText = m.choice(this.escaped, m.notChar("]")).zeroOrMore.ast;
    image = m.seq("![", this.altText, "]", m.ws, "(", this.linkedUrl, ")").ast;

    // Linked text
    linkedText = this.inlineDelayed.unless("]").zeroOrMore.ast;
    linkText = m.seq("[", this.linkedText, "]");
    linkUrl = m.seq("(", this.linkedUrl, ")");
    link = m.seq(this.linkText, m.ws, this.linkUrl).ast;

    // Mention
    reference = m.choice(m.char("/-"), m.identifierNext).oneOrMore.ast;
    mention = m.seq("@", this.reference).ast;

    // Comment
    comment = m.seq("<!--", m.advanceUntilPast("-->")).ast;

    // Beginning of sections
    indent = m.zeroOrMore("  ").ast;
    inlineUrl = m.seq(
      m.choice("http://", "https://", "mailto:"),
      m.advanceWhileNot(this.wsOrNewLine)
    ).ast;
    numListStart = m.seq(this.indent, m.digit.oneOrMore, ".", m.ws);
    quotedLineStart = m.seq(this.indent, ">");
    listStart = m.seq(
      this.indent,
      m.char("-").or(m.seq("*", m.not("*"))),
      m.ws
    );
    headingLineStart = m.quantified("#", 1, 6).ast;
    codeBlockDelim = m.text("```");
    specialLineStart = this.optWs.then(
      m.choice(
        this.listStart,
        this.headingLineStart,
        this.quotedLineStart,
        this.numListStart,
        this.codeBlockDelim
      )
    );

    // Inline content
    any = m.advance.ast;
    inline = m
      .choice(
        this.comment,
        this.image,
        this.link,
        this.mention,
        this.styledText,
        this.code,
        this.escaped,
        this.inlineUrl,
        this.plainText,
        this.any
      )
      .unless(m.newLine);
    lineEnd = m.newLine.or(m.assert(m.end));
    emptyLine = m.char(" \t").zeroOrMore.then(m.newLine).ast;
    restOfLine = m.seq(this.inline.zeroOrMore).then(this.lineEnd).ast;
    simpleLine = m.seq(
      this.emptyLine.not,
      this.specialLineStart.not,
      m.notEnd,
      this.restOfLine
    ).ast;
    paragraph = this.simpleLine.oneOrMore.ast;

    // Lists
    orderedListItem = m.seq(this.numListStart, this.optWs, this.restOfLine).ast;
    unorderedListItem = m.seq(this.listStart, this.optWs, this.restOfLine).ast;
    orderedList = this.orderedListItem.oneOrMore.ast;
    unorderedList = this.unorderedListItem.oneOrMore.ast;
    list = m.choice(this.orderedList, this.unorderedList);

    // Quotes
    quotedLine = m.seq(">", this.optWs, this.restOfLine).ast;
    quote = this.quotedLine.oneOrMore.ast;

    // Code blocks
    codeBlockContent = m.advanceWhileNot(this.codeBlockDelim).ast;
    codeBlockHint = m.advanceWhileNot(m.choice(m.newLine, this.codeBlockDelim))
      .ast;
    codeBlock = m.guardedSeq(
      this.codeBlockDelim,
      this.codeBlockHint,
      m.newLine.opt,
      this.codeBlockContent,
      this.codeBlockDelim
    ).ast;

    // Heading
    heading = this.headingLineStart.then(this.optWs).then(this.restOfLine).ast;

    // A section
    content = m.choice(
      this.heading,
      this.list,
      this.quote,
      this.codeBlock,
      this.paragraph,
      this.emptyLine
    ).ast;
    document = this.content.zeroOrMore.ast;
  })();

  // Register the grammar, providing a name and the default parse rule
  return m.registerGrammar("markdown", g, g.document);
}
