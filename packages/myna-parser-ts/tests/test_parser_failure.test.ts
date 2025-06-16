import { describe, test, expect } from 'vitest';
import { Myna } from '../src';
import { createJsonGrammar } from '../grammars/grammar_json';

createJsonGrammar(Myna);
const parse = Myna.parsers.json;

describe('JSON Parser Failure', () => {
  test('should throw or return null for invalid JSON', () => {
    const invalidJson = `{
      "number" : 42,
      "array" : [1, 2, 3 }
    }`;
    let threw = false;
    let ast = null;
    try {
      ast = parse(invalidJson);
    } catch (e) {
      threw = true;
    }
    expect(threw || ast === null).toBe(true);
  });
}); 