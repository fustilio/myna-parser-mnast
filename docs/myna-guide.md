# Myna Parsing Library: LLM Essential Guide

## Table of Contents
1. What is Myna?
2. Core Concepts & API
3. Defining and Modifying Grammars
4. Using Myna in Code
5. Tooling and Utilities
6. Testing and Debugging
7. Project Structure and Conventions
8. Advanced Tips and Best Practices
9. Troubleshooting and Common Pitfalls

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

## 9. Troubleshooting and Common Pitfalls

### Common Issues
1. **No AST nodes?** Make sure rules are marked with `.ast`
2. **Unexpected parse failures?** Check for missing `.opt`, `.zeroOrMore`, or `.oneOrMore`
3. **Circular references?** Use `m.delay()` for recursive rules
4. **Whitespace issues?** Use `.ws` or `m.ws.opt` appropriately
5. **Grammar not registered?** Check `registerGrammar` call

### Best Practices
1. Use `.ast` selectively: Only mark rules that should appear in the AST
2. Use constants for character sets: Improves readability and maintainability
3. Test edge cases: Always include tests for invalid and ambiguous input
4. Leverage combinators: Compose complex rules from smaller, well-named building blocks
5. Document grammars: Add comments explaining tricky rules or design decisions

---

## Further Reading and References

- [Myna GitHub Repository](https://github.com/cdiggins/myna-parser)
- [Myna on NPM](https://www.npmjs.com/package/myna-parser)
- [Sample Grammars](https://github.com/cdiggins/myna-parser/tree/master/grammars)
- [Example Tools](https://github.com/cdiggins/myna-parser/tree/master/tools)
- [Official Documentation](https://github.com/cdiggins/myna-parser#readme)