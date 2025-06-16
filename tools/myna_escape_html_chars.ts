import { Myna } from '../src';
import { createHtmlReservedCharsGrammar } from '../grammars/grammar_html_reserved_chars';

// Create the HTML reserved chars grammar
createHtmlReservedCharsGrammar(Myna);

// Given a character that belongs to one of the reserved HTML characters 
// returns the entity representation. For all other text, returns the text  
function charToEntity(text: string): string {
    if (text.length != 1)
        return text; 
    switch (text) {
        case '&': return "&amp;";
        case '<': return "&lt;";
        case '>': return "&gt;";
        case '"': return "&quot;";
        case "'": return "&#039;";
    };    
    return text;
}

// Given an ast node that represents either an HTML reserved char or 
// text without any special entity returns a sanitized version
function astNodeToHtmlText(ast: any): string {
    return charToEntity(ast.allText);
}

// Returns a string, replacing all of the reserved characters with entities 
export function escapeHtmlChars(text: string): string {
    let ast = Myna.parsers.html_reserved_chars(text);
    if (!ast || !ast.children)
        return "";
    return ast.children.map(astNodeToHtmlText).join('');
} 