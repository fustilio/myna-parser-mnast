# Myna Parsing Library: Essential Guide

## Table of Contents
1. What is Myna?
2. Core Concepts & API
3. Defining and Modifying Grammars
4. Using Myna in Code
5. Tooling and Utilities
6. Testing and Debugging
7. Project Structure and Conventions
8. Advanced Tips and Best Practices
9. Grammar Writing Recipes
10. Debugging and Inspecting Grammars
11. Common Pitfalls and How to Avoid Them
12. Performance and Scaling
13. Grammar Style Guide
14. Cheat Sheet: Combinators & Modifiers
15. Further Reading and References
16. Advanced Real-World Patterns & Recipes
17. Idioms from the Wild
18. FAQ and Troubleshooting

---

## 1. What is Myna?
Myna is a JavaScript/TypeScript library for building recursive-descent parsers using combinators. Unlike parser generators, you define grammars directly in code using Myna's API. Myna can automatically build an Abstract Syntax Tree (AST) from input text, and you control which rules contribute to the AST.

---

## 2. Core Concepts & API

### Myna Instance
- The main object for creating rules and grammars.
- Usually aliased as `m` in grammar files.

### Rules
- **Building blocks of a grammar.**
- Created with combinators:
  - `m.text("abc")` — match exact text
  - `m.char("aeiou")` — match any character in the set
  - `m.seq(ruleA, ruleB)` — match a sequence
  - `m.choice(ruleA, ruleB)` — match one of several options
  - `m.notChar("xyz")` — match any character not in the set
  - `m.keywords("if", "else")` — match whole keywords

### Rule Modifiers (Chaining)
- `.ast` — Mark this rule to create an AST node if it matches.
- `.opt` — Make rule optional.
- `.zeroOrMore` / `.oneOrMore` — Repeat rule 0+ or 1+ times.
- `.ws` — Allow whitespace between elements.

### AST (Abstract Syntax Tree)
- Myna builds an AST from rules marked with `.ast`.
- Node names are based on the property name in the grammar object.
- Only rules with `.ast` create nodes; others are for structure or matching only.

### Examples

#### Example 1: Basic Combinators
```typescript
// Match the exact text 'cat'
const cat = m.text('cat');

// Match any vowel
const vowel = m.char('aeiou');

// Match a sequence: 'cat' followed by a vowel
const catVowel = m.seq(cat, vowel);

// Match either 'cat' or 'dog'
const animal = m.choice(m.text('cat'), m.text('dog'));
```

#### Example 2: Rule Chaining and AST Nodes
```typescript
// Mark a rule to create an AST node
const word = m.oneOrMore(m.char('a-zA-Z')).ast;

// Make a rule optional
const maybeSpace = m.char(' ').opt;

// Repeat a rule zero or more times
const words = m.seq(word, m.seq(maybeSpace, word).zeroOrMore).ast;
```

#### Example 3: Full Mini-Grammar
```js
const m = require('myna-parser').Myna;
let g = m.newGrammar('mini');
g.word = m.oneOrMore(m.char('a-zA-Z')).ast;
g.space = m.char(' ');
g.sentence = m.seq(g.word, m.zeroOrMore(m.seq(g.space, g.word))).ast;
m.registerGrammar(g, 'mini');
```

### Example: Simple Grammar
```js
const m = require('myna-parser').Myna;
let g = m.newGrammar('example');
g.word = m.oneOrMore(m.char('a-zA-Z')).ast;
g.space = m.char(' ');
g.sentence = m.seq(g.word, m.zeroOrMore(m.seq(g.space, g.word))).ast;
m.registerGrammar(g, 'example');
```

---

## 3. Defining and Modifying Grammars

### Grammar Structure
```typescript
// 1. Define grammar interface
interface MyGrammar {
    rule1: Myna.Rule;
    rule2: Myna.Rule;
    // ... other rules
}

// 2. Create grammar function
export function createMyGrammar(myna: typeof Myna): MyGrammar {
    const m = myna;
    
    // Create grammar object with all rules
    const g: MyGrammar = {
        rule1: null as any,
        rule2: null as any,
        // ... initialize all rules as null
    };
    
    // Define helper rules first
    g.helperRule = m.text("helper").ast;
    
    // Define main rules
    g.rule1 = m.text("hello").ast;
    g.rule2 = m.seq(g.rule1, m.char(" "), g.rule1).ast;
    
    // Register grammar and return the grammar object
    myna.registerGrammar("grammarName", g, g.rule2);
    return g;
}
```

### Key Points:
- Always define a TypeScript interface for your grammar
- Use a factory function pattern with `create` prefix
- Accept `myna` instance as parameter
- Create grammar object with all rules initialized as `null as any` to handle circular references
- Define helper rules first, then main rules
- Register the grammar with a root rule
- Return the grammar object (not void) to allow for testing and reuse
- Use consistent naming: `create{Name}Grammar` for the function and `{name}` for the grammar registration
- Always use `.ast` for rules that should create AST nodes
- Use `m.delay()` for circular references
- Use helper functions like `guardedWsDelimSeq` and `commaDelimited` for common patterns

### Helper Functions
```typescript
// Common helper functions for grammar definitions
function guardedWsDelimSeq(...args: any[]) {
    const wsArgs = args.slice(1).map(r => m.seq(m.assert(r), g.ws));
    return m.seq(args[0], g.ws, m.seq(...wsArgs));
}

function commaDelimited(rule: Myna.Rule) {
    return m.delimited(rule, m.seq(g.comma, g.ws.opt));
}
```

### Circular References
```typescript
// Use m.delay() for circular references
g.value = m.choice(
    g.string,
    g.number,
    m.delay(() => g.array),  // Circular reference
    m.delay(() => g.object)  // Circular reference
).ast;
```

---

## 4. Using Myna in Code

### Parsing
```typescript
// Load the Myna module and grammar
const m = require('myna-parser');
require('./grammars/grammar_mygrammar')(m);

// Get the parser
const parser = m.parsers.mygrammar;

// Parse input
const ast = parser('input text');
console.log(ast.toString());
```

### Error Handling
```typescript
try {
    const ast = parser('invalid input');
    console.log(ast);
} catch (e) {
    console.log("Error occurred:");
    console.log(e.toString());
}
```

### AST Inspection
```typescript
const ast = parser(input);
console.log(ast.toString()); // Pretty-prints the AST

// Walk the AST
function walk(node, depth = 0) {
    console.log(' '.repeat(depth * 2) + node.name + ': ' + node.allText);
    for (const child of node.children) walk(child, depth + 1);
}
walk(ast);
```

---

## 5. Tooling and Utilities

### Grammar Utilities
- `Myna.registerGrammar` - Register a grammar with Myna
- `Myna.allGrammarRules` - List all rules for all registered grammars
- `Myna.grammarNames` - List names of all registered grammars
- `Myna.grammarRules` - Get rules for a specific grammar
- `Myna.grammarToString` - Get string representation of a grammar
- `Myna.astSchemaToString` - Get schema of AST nodes generated by a grammar

### Example: Using Grammar Utilities
```typescript
// Print grammar as PEG
console.log(m.grammarToString('json'));

// Print AST schema
console.log(m.astSchemaToString('json'));

// List all grammar rules
for (const rule of m.allGrammarRules()) {
    console.log(rule.toString());
}
```

---

## 6. Testing and Debugging

### Test Structure and Organization
1. **File Naming Convention**
   - All test files should use the pattern `test_*.test.ts`
   - Test files should be placed in the `tests/` directory
   - Test fixtures should be in `tests/fixtures/`
   - Test inputs should be in `tests/input/`
   - Test outputs should be in `tests/output/`

2. **Test File Organization**
   ```typescript
   import { describe, it, expect, beforeAll } from 'vitest';
   import { Myna } from '../src/myna';
   import { createMyGrammar } from '../grammars/grammar_mygrammar';

   describe('My Grammar', () => {
       let m: typeof Myna;
       let g: any;

       beforeAll(() => {
           m = Myna;
           createMyGrammar(m);
           g = m.grammars.mygrammar;
       });

       describe('Basic Rules', () => {
           it('should parse valid input', () => {
               const result = m.parse(g.rule1.ast, 'valid input');
               expect(result).toBeTruthy();
           });

           it('should reject invalid input', () => {
               const result = m.parse(g.rule1.ast, 'invalid input');
               expect(result).toBeFalsy();
           });
       });

       describe('Complex Cases', () => {
           it('should handle nested structures', () => {
               const result = m.parse(g.rule2.ast, 'complex input');
               expect(result).toBeTruthy();
           });
       });

       describe('Edge Cases', () => {
           it('should handle empty input', () => {
               const result = m.parse(g.rule1.ast, '');
               expect(result).toBeFalsy();
           });
       });

       describe('Error Cases', () => {
           it('should reject malformed input', () => {
               const result = m.parse(g.rule1.ast, 'malformed');
               expect(result).toBeFalsy();
           });
       });
   });
   ```

3. **Test Categories**
   - **Basic Rules**: Test simple valid/invalid cases
   - **Complex Cases**: Test nested structures and combinations
   - **Edge Cases**: Test empty input, whitespace, etc.
   - **Error Cases**: Test malformed input, syntax errors
   - **Rule-based Tests**: Systematic testing of each rule

4. **Best Practices**
   - Use `beforeAll` instead of `beforeEach` for grammar initialization
   - Initialize grammar once and reuse across tests
   - Group tests into logical categories
   - Use descriptive test names that explain the test case
   - Test both valid and invalid inputs
   - Verify AST structure for complex cases
   - Use `RuleTesterVitest` for systematic rule testing
   - Keep test files focused and maintainable
   - Use fixtures for complex test data
   - Document test cases with clear comments

5. **Debugging Tips**
   - Use `m.debug()` to enable debug logging
   - Check rule initialization order
   - Verify circular references are properly handled
   - Test edge cases thoroughly
   - Use AST inspection tools
   - Add temporary console.log statements for debugging
   - Use test.only() to focus on specific tests
   - Use test.skip() for tests under development

6. **Performance Testing**
   - Use benchmark tests for performance-critical code
   - Test with various input sizes
   - Monitor memory usage
   - Test parsing speed
   - Compare against baseline performance

7. **Integration Testing**
   - Test grammar interactions
   - Test parser combinations
   - Test error handling
   - Test AST transformations
   - Test with real-world inputs

---

## 7. Project Structure and Conventions

### File Organization
- Grammars: Defined in their own files under `grammars/`
- Tests: Test files validate grammars and tools
- Tools: Scripts in the tools directory

### Naming Conventions
- Grammar files: `grammar_*.ts`
- Grammar functions: `create*Grammar`
- Test files: `test_*.test.ts`
- Rule names: Descriptive of their purpose
- AST nodes: Only mark meaningful semantic units with `.ast`

---

## 8. Advanced Tips and Best Practices

### Rule Definition
1. **Basic Rules**:
   ```typescript
   // Text matching
   g.exactText = m.text("hello").ast;
   
   // Character sets
   g.letter = m.char("a-zA-Z").ast;
   g.digit = m.digit.ast;
   
   // Sequences
   g.word = m.seq(g.letter, g.letter.zeroOrMore).ast;
   
   // Choices
   g.operator = m.choice("+", "-", "*", "/").ast;
   ```

2. **Rule Modifiers**:
   ```typescript
   // Optional
   g.optionalPart = g.rule.opt;
   
   // Repetition
   g.many = g.rule.zeroOrMore;
   g.some = g.rule.oneOrMore;
   
   // Whitespace handling
   g.withSpaces = g.rule.ws;
   ```

### Common Patterns
1. **Delimited Lists**:
   ```typescript
   g.list = m.seq(
       g.item,
       m.seq(g.delimiter, g.item).zeroOrMore
   ).ast;
   ```

2. **Optional Whitespace**:
   ```typescript
   g.withOptionalSpaces = m.seq(
       m.ws.opt,
       g.content,
       m.ws.opt
   ).ast;
   ```

3. **Guarded Sequences**:
   ```typescript
   g.quoted = m.seq(
       '"',
       g.content,
       m.assert('"')  // Ensures closing quote
   ).ast;
   ```

---

## 9. Grammar Writing Recipes

This section provides practical, copy-pasteable patterns for common grammar constructs, inspired by real grammars in `/grammars`.

### 9.1. Delimited Lists
```typescript
g.list = m.seq(
    g.item,
    m.seq(g.delimiter, g.item).zeroOrMore
).ast;
// Or, using Myna's built-in:
g.list = m.delimited(g.item, g.delimiter).ast;
```

### 9.2. Recursive Rules (e.g., Expressions)
```typescript
g.expr = m.delay(() => g.sum).ast;
g.sum = m.seq(g.product, g.addExpr.or(g.subExpr).zeroOrMore).ast;
```

### 9.3. Operator Precedence (Arithmetic)
See [`grammar_arithmetic.ts`](../packages/myna-parser-ts/grammars/grammar_arithmetic.ts):
```typescript
g.expr = m.delay(() => g.sum).ast;
g.sum = m.seq(g.product, g.addExpr.or(g.subExpr).zeroOrMore).ast;
g.product = m.seq(g.prefixExpr.ws, g.mulExpr.or(g.divExpr).zeroOrMore).ast;
```

### 9.4. Parenthesized/Bracketed Content
```typescript
g.parenExpr = m.parenthesized(g.expr.ws).ast;
// Or, for custom delimiters:
g.bracketed = m.seq('[', g.content, ']').ast;
```

### 9.5. Optional and Repeated Elements
```typescript
g.optional = g.rule.opt;
g.zeroOrMore = g.rule.zeroOrMore;
g.oneOrMore = g.rule.oneOrMore;
```

### 9.6. Guarded Sequences (with whitespace)
```typescript
function guardedWsDelimSeq(...args: any[]) {
    const wsArgs = args.slice(1).map(r => m.seq(m.assert(r), g.ws));
    return m.seq(args[0], g.ws, m.seq(...wsArgs));
}
```

### 9.7. Circular References
```typescript
g.value = m.choice(
    g.string,
    g.number,
    m.delay(() => g.array),
    m.delay(() => g.object)
).ast;
```

### 9.8. Comments and Whitespace
```typescript
g.comment = m.seq('//', m.advanceWhileNot(m.newLine));
g.ws = g.comment.or(m.atWs.then(m.advance)).zeroOrMore;
```

### 9.9. Quoted Strings with Escapes
```typescript
g.escapedChar = m.seq('\\', m.choice('"', '\\', '/', 'b', 'f', 'n', 'r', 't', m.seq('u', m.hexDigit.repeat(4)))).ast;
g.quoteChar = m.choice(g.escapedChar, m.notChar('"\\')).ast;
g.string = m.seq('"', g.quoteChar.zeroOrMore, '"').ast;
```

---

## 10. Debugging and Inspecting Grammars

### 10.1. Enable Debug Logging
```typescript
m.debug(); // Enables verbose debug output
```

### 10.2. Print Grammar as PEG
```typescript
console.log(m.grammarToString('json'));
```

### 10.3. Print AST Schema
```typescript
console.log(m.astSchemaToString('json'));
```

### 10.4. Walk the AST
```typescript
function walk(node, depth = 0) {
    console.log(' '.repeat(depth * 2) + node.name + ': ' + node.allText);
    for (const child of node.children) walk(child, depth + 1);
}
walk(ast);
```

### 10.5. Test Individual Rules
```typescript
const result = m.parse(g.rule, 'input');
console.log(result);
```

### 10.6. Check Rule Initialization Order
- Ensure all rules are initialized as `null as any` in the grammar object to avoid circular reference issues.
- Use `m.delay()` for recursive/circular rules.

### 10.7. Use AST Inspection Tools
- Use `.toString()` on AST nodes for pretty-printing.
- Inspect node properties (`name`, `allText`, `children`).

---

## 11. Common Pitfalls and How to Avoid Them

1. **No AST nodes?**
   - Make sure rules are marked with `.ast`.
2. **Unexpected parse failures?**
   - Check for missing `.opt`, `.zeroOrMore`, or `.oneOrMore`.
3. **Circular references?**
   - Use `m.delay()` for recursive rules.
4. **Whitespace issues?**
   - Use `.ws` or `m.ws.opt` appropriately.
5. **Grammar not registered?**
   - Check `registerGrammar` call.
6. **Ambiguous rules?**
   - Order `m.choice()` options from most to least specific.
7. **Unintended matches?**
   - Use `m.assert()` and `m.not()` to guard boundaries.
8. **Performance bottlenecks?**
   - Avoid left-recursive patterns; prefer right recursion or iterative constructs.
9. **Hard-to-read grammars?**
   - Use helper functions and break up complex rules.
10. **Unmaintainable grammars?**
    - Use interfaces and factory functions for structure.
11. **Parser hangs on unterminated tokens?**
    - Use `m.assert(m.end)` to ensure proper termination
    - Separate error rules from valid token rules
    - Use `m.not(errorRule)` in the file rule to fail on errors
12. **Error handling not working?**
    - Ensure error rules are properly separated from valid token rules
    - Use `m.seq(validTokens, m.not(errorRule), m.end)` for file rules
    - Consider using `m.fail()` for explicit error cases

---

## 12. Performance and Scaling

- **Avoid left recursion:** Myna (like most combinator libraries) does not support left recursion. Rewrite left-recursive rules as right-recursive or iterative.
- **Use `.opt` and `.zeroOrMore` judiciously:** Overuse can lead to excessive backtracking.
- **Profile with large inputs:** Use benchmark tests for performance-critical grammars.
- **Reuse rules:** Factor out common patterns to avoid duplication and improve cache hits.
- **Minimize AST nodes:** Only mark rules with `.ast` that are semantically meaningful.
- **Test with real-world data:** Especially for large/complex grammars (see `/grammars/grammar_glsl.ts`, `/grammar_pithy.ts`).

---

## 13. Grammar Style Guide

- **Naming:**
  - Use descriptive, lowerCamelCase for rule names (e.g., `parenExpr`, `addExpr`).
  - Prefix helper functions with `create` (e.g., `createJsonGrammar`).
  - Use consistent naming for grammar files: `grammar_{name}.ts`.
- **Structure:**
  - Always define a TypeScript interface for your grammar.
  - Use a factory function pattern with `create{Name}Grammar`.
  - Initialize all rules as `null as any` in the grammar object.
  - Define helper rules first, then main rules.
  - Register the grammar with a root rule.
  - Return the grammar object for testing and reuse.
- **Documentation:**
  - Add comments explaining tricky rules or design decisions.
  - Reference related grammars or patterns.
- **Collaboration:**
  - Keep grammars modular and focused.
  - Use interfaces and clear structure for maintainability.
  - Document test cases and edge cases.

---

## 14. Cheat Sheet: Combinators & Modifiers

### Core Combinators
- `m.text("abc")` — match exact text
- `m.char("aeiou")` — match any character in the set
- `m.seq(ruleA, ruleB)` — match a sequence
- `m.choice(ruleA, ruleB)` — match one of several options
- `m.notChar("xyz")` — match any character not in the set
- `m.keywords("if", "else")` — match whole keywords
- `m.parenthesized(rule)` — match rule in parentheses
- `m.delimited(rule, delimiter)` — match delimited list
- `m.doubleQuoted(rule)` — match double-quoted string
- `m.singleQuoted(rule)` — match single-quoted string
- `m.advanceWhileNot(rule)` — advance until rule
- `m.advanceUntilPast(rule)` — advance until after rule
- `m.delay(() => rule)` — lazy/circular reference

### Rule Modifiers (Chaining)
- `.ast` — Mark this rule to create an AST node if it matches.
- `.opt` — Make rule optional.
- `.zeroOrMore` / `.oneOrMore` — Repeat rule 0+ or 1+ times.
- `.ws` — Allow whitespace between elements.
- `.then(rule)` — Sequence with another rule.
- `.or(rule)` — Alternative to another rule.
- `.unless(rule)` — Only match if rule does not match.
- `.not` — Only match if rule does not match at this position.
- `.assert(rule)` — Lookahead for rule.

### AST Node Helpers
- `.name` — Set the name of the AST node.
- `.toString()` — Pretty-print the AST node.

---

## 15. Further Reading and References

- [Myna GitHub Repository](https://github.com/cdiggins/myna-parser)
- [Myna on NPM](https://www.npmjs.com/package/myna-parser)
- [Sample Grammars](https://github.com/cdiggins/myna-parser/tree/master/grammars)
- [Example Tools](https://github.com/cdiggins/myna-parser/tree/master/tools)
- [Official Documentation](https://github.com/cdiggins/myna-parser#readme)
- [Your Project's /grammars Directory](../packages/myna-parser-ts/grammars/) — See real-world grammars for inspiration and patterns

---

Happy grammar writing! For more inspiration, explore the grammars in `/grammars` and experiment with your own combinators and patterns.

## 16. Advanced Real-World Patterns & Recipes

### 16.1. Custom Delimiters and Parameterization
- **CSV Grammar:**
  ```typescript
  // Accepts delimiter as parameter
  export function createCsvGrammar(myna: typeof Myna, delimiter: string = ',') { ... }
  // Usage: createCsvGrammar(m, '\t') for TSV
  ```
- **Mustache Grammar:**
  ```typescript
  // Accepts start/end delimiters as parameters
  export function createMustacheGrammar(myna: typeof Myna, start = '{{', end = '}}') { ... }
  ```

### 16.2. Mutually Recursive Rules
- **Markdown Inline/Section:**
  ```typescript
  // Allows inline to reference itself recursively
  inlineDelayed = m.delay(() => this.inline);
  inline = m.choice(..., this.inlineDelayed, ...);
  ```
- **Mustache Content/Section:**
  ```typescript
  g.recursiveContent = m.delay(() => g.content);
  g.sectionContent = g.recursiveContent.ast;
  ```

### 16.3. Advanced Whitespace and Comment Handling
- **Pithy/GLSL/Heron:**
  ```typescript
  g.comment = m.seq('//', m.advanceWhileNot(m.newLine));
  g.ws = g.comment.or(m.atWs.then(m.advance)).zeroOrMore;
  // Use g.ws in all whitespace-sensitive rules
  ```
- **Pithy:**
  ```typescript
  g.sp = m.choice(m.char(' \t'), g.comment).zeroOrMore;
  g.ws = m.choice(m.char(' \t\r\n\f\v'), g.comment).zeroOrMore;
  ```

### 16.4. Operator Precedence and Associativity
- **Arithmetic/GLSL/Heron/Pithy:**
  ```typescript
  // See grammar_arithmetic.ts, grammar_glsl.ts, grammar_heron.ts, grammar_pithy.ts
  g.expr = m.delay(() => g.sum).ast;
  g.sum = m.seq(g.product, g.addExpr.or(g.subExpr).zeroOrMore).ast;
  g.product = m.seq(g.prefixExpr.ws, g.mulExpr.or(g.divExpr).zeroOrMore).ast;
  // ...
  ```

### 16.5. Guarded Sequences and Lookahead
- **Heron/GLSL:**
  ```typescript
  function guardedWsDelimSeq(...args: any[]) {
    const wsArgs = args.slice(1).map(r => m.seq(m.assert(r), g.ws));
    return m.seq(args[0], g.ws, m.seq(...wsArgs));
  }
  // Use m.assert, m.not for lookahead/negative lookahead
  ```

### 16.6. Flexible List Parsing
- **Pithy:**
  ```typescript
  function commaList(r: Myna.Rule, trailing = true) {
    const flexible_comma_separator = m.seq(g.sp.opt, g.comma, g.sp.opt);
    const result = r.then(m.seq(flexible_comma_separator, r).zeroOrMore);
    if (trailing) return result.then(flexible_comma_separator.opt);
    return result;
  }
  ```
- **CSV:**
  ```typescript
  g.record = g.field.delimited(delimiter).ast;
  g.file = g.record.delimited(m.newLine).ast;
  ```

### 16.7. Indentation and Block-Sensitive Parsing
- **Pithy:**
  ```typescript
  g.indent = m.text('    ');
  g.dedent = m.not(g.indent);
  g.suite = m.delay(() => {
    const indented_line = m.choice(m.seq(g.indent, g.stmt), g.blankLine);
    const indented_block = m.seq(m.newLine, indented_line.oneOrMore, g.dedent);
    return m.choice(g.simpleStmt, indented_block);
  }).ast;
  ```

### 16.8. Template/Markup Grammars
- **Mustache:**
  ```typescript
  g.section = m.guardedSeq(g.startSection, g.sectionContent, g.endSection).ast;
  g.invertedSection = m.guardedSeq(g.startInvertedSection, g.sectionContent, g.endSection).ast;
  g.plainText = m.advanceOneOrMoreWhileNot(startDelimiter).ast;
  ```
- **Markdown:**
  ```typescript
  g.bold = m.choice(this.boundedInline('**'), this.boundedInline('__')).ast;
  g.codeBlock = m.guardedSeq(this.codeBlockDelim, this.codeBlockHint, m.newLine.opt, this.codeBlockContent, this.codeBlockDelim).ast;
  ```

### 16.9. Fielded/Key-Value Syntax
- **Lucene:**
  ```typescript
  g.field = g.fieldName.then(':');
  g.param = g.paramKey.then('=').opt.then(g.paramValue).ast;
  g.localParams = m.seq('{!', m.delimited(g.param, g.ws), m.assert('}')).ast;
  ```
- **JSON:**
  ```typescript
  g.pair = m.seq(g.string, m.ws, ':', m.ws, g.value).ast;
  g.object = m.seq(m.ws, '{', m.ws, m.choice(m.seq(g.pair, m.seq(m.ws, g.comma, m.ws, g.pair).zeroOrMore), m.text('')), m.ws, '}', m.ws).ast;
  ```

### 16.10. Error Handling and Unterminated Tokens
```typescript
// Example from JavaScript tokens grammar
// Define valid tokens
g.token = m.choice(
    g.whiteSpace,
    g.comment,
    g.identifier,
    g.number,
    g.doubleQuotedString,
    g.singleQuotedString,
    g.punctuator
).ast;

// Define error tokens separately
g.error = m.choice(
    g.unterminatedDoubleQuotedString,
    g.unterminatedSingleQuotedString,
    m.seq("/*", m.advanceUntilPast("*/").not),
    m.advance
).ast;

// File rule ensures no errors and proper termination
g.file = m.seq(
    m.zeroOrMore(g.token),
    m.not(g.error),
    m.end
).ast;
```

### 16.11. Handling Unterminated Strings
```typescript
// Valid string with proper termination
g.doubleQuotedString = m.seq(
    '"',
    m.choice(g.escape, m.notChar('"\n\r\\')).zeroOrMore,
    '"'
).ast;

// Unterminated string (for error detection)
g.unterminatedDoubleQuotedString = m.seq(
    '"',
    m.choice(g.escape, m.notChar('"\n\r\\')).zeroOrMore,
    m.assert(m.end)
).ast;
```

### 16.12. Handling Unterminated Comments
```typescript
// Valid multi-line comment
g.multiLineComment = m.seq("/*", m.advanceUntilPast("*/")).ast;

// Unterminated comment detection
g.unterminatedComment = m.seq(
    "/*",
    m.advanceUntilPast("*/").not
).ast;
```

### 16.13. Testing Error Cases and Edge Cases
```typescript
describe('Error Cases', () => {
  it('should fail on unterminated comment', () => {
    const input = `var x = 1; /* unterminated`;
    expect(!!Myna.parse(g.file, input)).toBeFalsy();
  });

  it('should fail on unterminated string', () => {
    const input = `var x = 'unterminated`;
    expect(!!Myna.parse(g.file, input)).toBeFalsy();
  });

  it('should handle escape sequences in strings', () => {
    const input = `"escaped: \\" \\n \\t"`;
    expect(!!Myna.parse(g.string, input)).toBeTruthy();
  });
});
```

### 16.14. Systematic Rule Testing
```typescript
describe('Rule-based Tests', () => {
  const tester = new RuleTesterVitest(Myna);
  
  it('should test all rules systematically', () => {
    tester.testRule(g.string, [
      { input: '"valid"', shouldMatch: true },
      { input: '"unterminated', shouldMatch: false },
      { input: '"escaped\\"quote"', shouldMatch: true }
    ]);
  });
});
```

### 16.15. Defensive Grammar Patterns
```typescript
// Always consume at least one character for unknown input
g.error = m.choice(
  m.seq('"', m.choice(g.escape, m.notChar('"\n\r\\')).zeroOrMore, m.assert(m.end)),
  m.seq("'", m.choice(g.escape, m.notChar("'\n\r\\")).zeroOrMore, m.assert(m.end)),
  m.seq("/*", m.advanceUntilPast("*/").not),
  m.advance  // Fallback: consume one character
).ast;

// Ensure progress is always made
g.file = m.seq(
  m.zeroOrMore(g.token),
  m.not(g.error),
  m.end
).ast;
```

### 16.16. Escape Sequence Handling
```typescript
// Define escape sequences
g.escape = m.seq(
  '\\',
  m.choice(
    m.char('"\'\\/bfnrt'),  // Simple escapes
    m.seq('u', m.hexDigit.repeat(4))  // Unicode escapes
  )
).ast;

// Use in string rules
g.doubleQuotedString = m.seq(
  '"',
  m.choice(g.escape, m.notChar('"\n\r\\')).zeroOrMore,
  '"'
).ast;
```

### 16.17. Integration Testing Patterns
```typescript
describe('Integration Tests', () => {
  it('should parse a sequence of tokens', () => {
    const input = `var x = 42; // comment
    let y = "string";`;
    expect(!!Myna.parse(g.file, input)).toBeTruthy();
  });

  it('should handle mixed content', () => {
    const input = `/* block comment */
    var x = "string" + 42; // line comment`;
    expect(!!Myna.parse(g.file, input)).toBeTruthy();
  });
});
```

### 16.18. Error Recovery Strategies
```typescript
// Option 1: Fail fast on first error
g.file = m.seq(
  m.zeroOrMore(g.token),
  m.not(g.error),
  m.end
).ast;

// Option 2: Collect errors but continue parsing
g.file = m.seq(
  m.zeroOrMore(m.choice(g.token, g.error)),
  m.end
).ast;

// Option 3: Error recovery with synchronization points
g.file = m.seq(
  m.zeroOrMore(m.choice(
    g.token,
    m.seq(g.error, m.advanceUntilPast(';').opt)  // Recover at statement end
  )),
  m.end
).ast;
```

### 16.19. Advanced Token Classification
```typescript
// Token classification with semantic meaning
g.token = m.choice(
  // Keywords (must be checked before identifiers)
  m.keywords("if", "else", "while", "for", "function").ast,
  // Literals
  g.number.ast,
  g.string.ast,
  // Operators (ordered by length to handle compound operators)
  m.choice("===", "==", "=").ast,
  m.choice("&&", "&").ast,
  // Identifiers (must come after keywords)
  g.identifier.ast,
  // Punctuators
  g.punctuator.ast
).ast;
```

### 16.20. Context-Sensitive Parsing
```typescript
// Example: Parsing template literals with embedded expressions
g.templateLiteral = m.seq(
  '`',
  m.choice(
    m.seq('${', g.expression, '}'),  // Expression
    m.notChar('`${').oneOrMore       // Literal text
  ).zeroOrMore,
  '`'
).ast;

// Example: Parsing JSX-like syntax
g.jsxElement = m.seq(
  '<',
  g.identifier,
  m.zeroOrMore(g.attribute),
  m.choice(
    m.seq('>', g.jsxContent, '</', g.identifier, '>'),  // Paired tags
    '/>'  // Self-closing
  )
).ast;
```

### 16.21. Performance Optimization Patterns
```typescript
// 1. Rule Caching
g.cachedRule = m.cache(m.choice(
  g.ruleA,
  g.ruleB
)).ast;

// 2. Early Termination
g.optimizedList = m.seq(
  g.item,
  m.choice(
    m.seq(g.delimiter, g.item).zeroOrMore,  // Normal case
    m.end  // Early exit if no more items
  )
).ast;

// 3. Lookahead Optimization
g.optimizedChoice = m.choice(
  m.seq(m.assert('if'), g.ifStatement),     // Keyword lookahead
  m.seq(m.assert('while'), g.whileStatement),
  g.defaultCase
).ast;
```

### 16.22. Advanced Error Reporting
```typescript
// Custom error reporting with context
g.error = m.choice(
  m.seq(
    '"',
    m.choice(g.escape, m.notChar('"\n\r\\')).zeroOrMore,
    m.assert(m.end).withError("Unterminated string literal")
  ),
  m.seq(
    "/*",
    m.advanceUntilPast("*/").not.withError("Unterminated comment")
  )
).ast;

// Error recovery with context preservation
g.file = m.seq(
  m.zeroOrMore(m.choice(
    g.token,
    m.seq(
      g.error,
      m.advanceUntilPast(';').opt.withContext("Recovering at statement end")
    )
  )),
  m.end
).ast;
```

### 16.23. Modular Grammar Composition
```typescript
// Base grammar with common rules
function createBaseGrammar(myna: typeof Myna) {
  const g = {
    identifier: m.identifier.ast,
    number: m.number.ast,
    string: m.string.ast,
    // ... common rules
  };
  return g;
}

// Language-specific grammar extending base
function createLanguageGrammar(myna: typeof Myna, base: any) {
  const g = {
    ...base,
    // Language-specific rules
    statement: m.choice(
      g.ifStatement,
      g.whileStatement,
      g.expressionStatement
    ).ast
  };
  return g;
}
```

### 16.24. Advanced AST Transformation
```typescript
// AST transformation with context
function transformAST(node: Myna.ASTNode, context: any) {
  switch (node.name) {
    case 'ifStatement':
      return transformIfStatement(node, context);
    case 'whileStatement':
      return transformWhileStatement(node, context);
    // ... other cases
  }
}

// AST validation
function validateAST(node: Myna.ASTNode): boolean {
  if (!node) return false;
  
  // Validate node structure
  if (node.name === 'function' && !node.children.some(c => c.name === 'body')) {
    return false;
  }
  
  // Recursively validate children
  return node.children.every(validateAST);
}
```

### 16.25. Grammar Debugging Tools
```typescript
// Rule tracing
function traceRule(rule: Myna.Rule, input: string) {
  console.log(`Tracing rule: ${rule.toString()}`);
  console.log(`Input: ${input}`);
  
  const result = Myna.parse(rule, input);
  console.log(`Result: ${result ? 'Match' : 'No match'}`);
  if (result) {
    console.log(`AST: ${result.toString()}`);
  }
}

// Grammar visualization
function visualizeGrammar(grammar: any) {
  const rules = Object.entries(grammar)
    .filter(([_, rule]) => rule instanceof Myna.Rule)
    .map(([name, rule]) => ({
      name,
      definition: rule.toString(),
      dependencies: findRuleDependencies(rule)
    }));
  
  return rules;
}
```

### 16.26. Advanced Testing Strategies
```typescript
// Property-based testing
describe('Grammar Properties', () => {
  it('should maintain invariants', () => {
    const inputs = generateTestInputs();
    for (const input of inputs) {
      const result = Myna.parse(g.file, input);
      if (result) {
        expect(validateAST(result)).toBeTruthy();
        expect(result.allText.length).toBe(input.length);
      }
    }
  });
});

// Performance testing
describe('Grammar Performance', () => {
  it('should handle large inputs efficiently', () => {
    const largeInput = generateLargeInput();
    const start = performance.now();
    Myna.parse(g.file, largeInput);
    const end = performance.now();
    expect(end - start).toBeLessThan(1000); // 1 second threshold
  });
});
```

### 16.27. Real-World Grammar Examples
```typescript
// Example: Markdown Parser
g.markdown = m.choice(
  g.heading,
  g.paragraph,
  g.list,
  g.codeBlock,
  g.blockquote
).ast;

g.heading = m.seq(
  m.char('#').oneToSix,
  m.ws,
  m.advanceWhileNot(m.newLine),
  m.newLine
).ast;

g.paragraph = m.seq(
  m.not(m.choice(g.heading, g.list, g.codeBlock)),
  m.advanceWhileNot(m.newLine),
  m.newLine
).ast;

// Example: SQL Parser
g.sql = m.choice(
  g.selectStatement,
  g.insertStatement,
  g.updateStatement,
  g.deleteStatement
).ast;

g.selectStatement = m.seq(
  'SELECT',
  m.ws,
  g.columnList,
  m.ws,
  'FROM',
  m.ws,
  g.tableName,
  g.whereClause.opt,
  g.groupByClause.opt,
  g.orderByClause.opt
).ast;
```

### 16.28. Advanced Error Recovery Patterns
```typescript
// 1. Synchronization Points
g.statement = m.choice(
  g.validStatement,
  m.seq(
    g.error,
    m.advanceUntilPast(';').opt,  // Sync at statement end
    g.errorRecovery
  )
).ast;

// 2. Error Correction
g.errorCorrection = m.choice(
  m.seq(g.error, m.advanceUntilPast(';').opt),  // Skip to next statement
  m.seq(g.error, m.advanceUntilPast('}').opt),  // Skip to block end
  m.seq(g.error, m.advanceUntilPast('\n').opt)  // Skip to next line
).ast;

// 3. Error Collection
g.file = m.seq(
  m.zeroOrMore(m.choice(
    g.token,
    m.seq(g.error, g.errorContext).ast
  )),
  m.end
).ast;
```

### 16.29. Advanced Testing Strategies
```typescript
// 1. Fuzzing Tests
describe('Grammar Fuzzing', () => {
  it('should handle random inputs gracefully', () => {
    for (let i = 0; i < 1000; i++) {
      const input = generateRandomInput();
      const result = Myna.parse(g.file, input);
      // Should not throw or hang
      expect(() => result).not.toThrow();
    }
  });
});

// 2. Regression Testing
describe('Grammar Regression', () => {
  it('should maintain backward compatibility', () => {
    const testCases = loadTestCases();
    for (const test of testCases) {
      const result = Myna.parse(g.file, test.input);
      expect(result).toEqual(test.expected);
    }
  });
});

// 3. Stress Testing
describe('Grammar Stress', () => {
  it('should handle large nested structures', () => {
    const input = generateDeeplyNestedInput(1000);
    const result = Myna.parse(g.file, input);
    expect(result).toBeTruthy();
  });
});
```

### 16.30. Performance Optimization Techniques
```typescript
// 1. Rule Memoization
g.memoizedRule = m.memoize(m.choice(
  g.complexRuleA,
  g.complexRuleB
)).ast;

// 2. Lazy Evaluation
g.lazyRule = m.delay(() => g.complexRule).ast;

// 3. Early Exit Optimization
g.optimizedRule = m.seq(
  m.assert(g.prefix),  // Quick check before complex parsing
  g.complexRule
).ast;

// 4. Rule Inlining
g.inlinedRule = m.seq(
  g.prefix,
  m.choice(
    m.seq(g.optionA, g.suffix),
    m.seq(g.optionB, g.suffix)
  )
).ast;
```

### 16.31. AST Manipulation Patterns
```typescript
// 1. AST Transformation Pipeline
function transformAST(node: Myna.ASTNode): Myna.ASTNode {
  return node
    .transform(removeWhitespace)
    .transform(normalizeIdentifiers)
    .transform(optimizeExpressions)
    .transform(generateCode);
}

// 2. AST Validation
function validateAST(node: Myna.ASTNode): ValidationResult {
  const errors: string[] = [];
  
  function validate(node: Myna.ASTNode, context: any) {
    // Type checking
    if (node.name === 'binaryExpression') {
      const leftType = getType(node.children[0]);
      const rightType = getType(node.children[1]);
      if (!areTypesCompatible(leftType, rightType)) {
        errors.push(`Type mismatch: ${leftType} and ${rightType}`);
      }
    }
    
    // Recursive validation
    node.children.forEach(child => validate(child, context));
  }
  
  validate(node, {});
  return { valid: errors.length === 0, errors };
}

// 3. AST Optimization
function optimizeAST(node: Myna.ASTNode): Myna.ASTNode {
  return node.transform(node => {
    switch (node.name) {
      case 'binaryExpression':
        return optimizeBinaryExpression(node);
      case 'ifStatement':
        return optimizeIfStatement(node);
      // ... other cases
    }
    return node;
  });
}
```

### 16.32. Grammar Visualization and Analysis
```typescript
// 1. Rule Dependency Graph
function buildDependencyGraph(grammar: any) {
  const graph = new Map<string, Set<string>>();
  
  for (const [name, rule] of Object.entries(grammar)) {
    if (rule instanceof Myna.Rule) {
      const dependencies = findRuleDependencies(rule);
      graph.set(name, new Set(dependencies));
    }
  }
  
  return graph;
}

// 2. Grammar Metrics
function analyzeGrammar(grammar: any) {
  return {
    ruleCount: Object.keys(grammar).length,
    maxDepth: calculateMaxDepth(grammar),
    complexity: calculateComplexity(grammar),
    circularDeps: findCircularDependencies(grammar)
  };
}

// 3. Grammar Documentation
function generateGrammarDocs(grammar: any) {
  return Object.entries(grammar)
    .filter(([_, rule]) => rule instanceof Myna.Rule)
    .map(([name, rule]) => ({
      name,
      definition: rule.toString(),
      examples: generateExamples(rule),
      dependencies: findRuleDependencies(rule)
    }));
}
```

### 16.33. Advanced Error Handling
```typescript
// 1. Custom Error Types
class GrammarError extends Error {
  constructor(
    public message: string,
    public position: number,
    public context: any
  ) {
    super(message);
  }
}

// 2. Error Recovery with Context
function recoverFromError(
  error: GrammarError,
  grammar: any,
  input: string
): RecoveryResult {
  const context = {
    position: error.position,
    expected: error.context.expected,
    found: error.context.found
  };
  
  // Try different recovery strategies
  const strategies = [
    skipToNextStatement,
    skipToBlockEnd,
    skipToNextLine,
    insertMissingToken
  ];
  
  for (const strategy of strategies) {
    const result = strategy(context, grammar, input);
    if (result.success) return result;
  }
  
  return { success: false, error };
}

// 3. Error Reporting
function formatError(error: GrammarError, input: string): string {
  const lines = input.split('\n');
  const line = lines[error.position.line];
  const column = error.position.column;
  
  return `
Error at line ${error.position.line}, column ${column}:
${line}
${' '.repeat(column)}^
${error.message}
Expected: ${error.context.expected}
Found: ${error.context.found}
  `.trim();
}
```

---

## 17. Idioms from the Wild

- **Avoiding Left Recursion:** Rewrite left-recursive rules as right-recursive or iterative (see arithmetic, Pithy, GLSL).
- **Modularizing Large Grammars:** Use interfaces, factory functions, and helper rules (see Heron, GLSL, Pithy).
- **Lookahead/Negative Lookahead:** Use `.assert`, `.not`, `.unless` for context-sensitive parsing (see Heron, Markdown, Mustache).
- **Greedy/Non-Greedy Patterns:** Use `.advanceWhileNot`, `.advanceUntilPast`, `.delay` for recursive/greedy patterns (see Markdown, Mustache).
- **Prioritized Alternatives:** Use `.or`, `.choice` with most specific rules first (see all grammars).
- **Whitespace Handling:** Use `.ws`, custom whitespace rules, and context-sensitive whitespace (see Heron, GLSL, Pithy).
- **Selective AST Marking:** Only use `.ast` for semantically meaningful nodes (see all grammars).
- **Parameterization:** Make grammars configurable for delimiters, keywords, etc. (see CSV, Mustache).
- **Testing in Isolation:** Test rules incrementally, not just at the top level.

---

## 18. FAQ and Troubleshooting

**Q: Why does my rule match too much/too little?**
- Check for missing `.opt`, `.zeroOrMore`, or `.oneOrMore`.
- Ensure alternatives in `.choice` are ordered from most to least specific.
- Use `.not`, `.assert`, or `.unless` to guard boundaries.

**Q: How do I debug infinite recursion or stack overflows?**
- Check for left recursion. Use `m.delay()` for recursive rules.
- Test rules in isolation with small inputs.

**Q: How do I parse context-sensitive constructs (e.g., indentation, nested templates)?**
- Use lookahead (`.assert`, `.not`), parameterized rules, and helper functions.
- See Pithy for indentation, Mustache for nested templates.

**Q: How do I handle optional/trailing delimiters?**
- Use flexible list idioms (see Pithy `commaList`, CSV `delimited`).

**Q: How do I parse languages with both line and block comments?**
- Combine comment rules with `.or` and include in your whitespace rule (see GLSL, Heron).

**Q: How do I test and validate my grammar incrementally?**
- Write tests for individual rules, not just the root rule.
- Use `m.parse(g.rule, input)` and inspect the AST.

**Q: How do I handle unterminated strings or comments?**
- Define separate rules for valid and unterminated tokens
- Use `m.assert(m.end)` to detect unterminated tokens
- Include error rules in a separate `error` rule
- Use `m.not(errorRule)` in the file rule to fail on errors
- See JavaScript tokens grammar for a complete example

**Q: Why does my parser hang on invalid input?**
- Check for proper error handling in your grammar
- Ensure unterminated tokens are properly detected
- Use `m.assert()` and `m.not()` to guard against infinite loops
- Consider using `m.fail()` for explicit error cases

**Q: How do I test my grammar systematically?**
- Use `RuleTesterVitest` for systematic rule testing
- Test both valid and invalid inputs
- Include edge cases and error cases
- Test individual rules in isolation
- Use integration tests for complex scenarios

**Q: How do I handle escape sequences in strings?**
- Define a separate `escape` rule for all valid escape sequences
- Include both simple escapes (`\n`, `\t`, etc.) and Unicode escapes
- Use `m.choice()` to combine different escape types
- Test with various escape sequence combinations

**Q: What's the best way to handle error recovery?**
- Choose between fail-fast and error collection strategies
- Use synchronization points for error recovery
- Consider using `m.advanceUntilPast()` for recovery
- Test error recovery with various invalid inputs

**Q: How do I prevent infinite loops in my grammar?**
- Always ensure progress is made (consume at least one character)
- Use `m.assert()` and `m.not()` to guard against infinite loops
- Test with unterminated tokens and malformed input
- Consider using defensive patterns like `m.advance` as fallback

**Q: How do I optimize my grammar for performance?**
- Use rule caching for frequently used rules
- Implement early termination where possible
- Use lookahead to avoid unnecessary backtracking
- Profile with real-world inputs
- Consider using `m.cache()` for expensive rules

**Q: How do I handle complex context-sensitive parsing?**
- Use lookahead with `m.assert()`
- Implement custom error reporting
- Use context objects to track state
- Consider using semantic actions
- Test with edge cases

**Q: How do I debug complex grammar issues?**
- Use rule tracing to see matching process
- Visualize grammar structure
- Implement custom error reporting
- Use property-based testing
- Profile performance with large inputs

**Q: How do I maintain large grammars?**
- Use modular composition
- Implement systematic testing
- Document complex rules
- Use consistent patterns
- Consider using grammar visualization tools

**Q: How do I handle complex language features?**
- Break down complex features into smaller rules
- Use context objects to track state
- Implement proper error recovery
- Test with real-world examples
- Consider using semantic actions

**Q: How do I optimize my grammar for large inputs?**
- Use rule memoization
- Implement early exit strategies
- Profile and optimize hot paths
- Consider using lazy evaluation
- Test with performance benchmarks

**Q: How do I maintain and evolve my grammar?**
- Use systematic testing
- Document rule dependencies
- Implement grammar visualization
- Track grammar metrics
- Use version control for grammar changes

**Q: How do I handle language evolution?**
- Design for extensibility
- Use modular composition
- Implement backward compatibility
- Test with old and new syntax
- Document breaking changes