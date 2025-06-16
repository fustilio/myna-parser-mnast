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