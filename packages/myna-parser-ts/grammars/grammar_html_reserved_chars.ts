import { Myna } from '../src';

// Define a grammar for common HTML reserved chars. Those are characters like <, >, and & that should be
// be replaced by an HTML entity to be displayed correctly.
export function createHtmlReservedCharsGrammar(myna: typeof Myna) {
    // Define individual rules for each character
    const ampersand = myna.char('&').ast;
    const lessThan = myna.char('<').ast;
    const greaterThan = myna.char('>').ast;
    const doubleQuote = myna.char('"').ast;
    const singleQuote = myna.char("'").ast;
    const regularText = myna.notChar('&<>"\'').ast;

    // Define the html_reserved_chars rule separately
    const htmlReservedCharsRule = myna.choice(
        ampersand,
        lessThan,
        greaterThan,
        doubleQuote,
        singleQuote,
        regularText
    ).oneOrMore.opt.ast;

    // Grammar definition
    const grammarObj = {
        html_reserved_chars: htmlReservedCharsRule,
        ampersand,
        lessThan,
        greaterThan,
        doubleQuote,
        singleQuote,
        regularText
    };
    myna.registerGrammar('html_reserved_chars', grammarObj, htmlReservedCharsRule);
    return grammarObj;
} 