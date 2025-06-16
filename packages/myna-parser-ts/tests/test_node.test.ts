import { describe, test, expect } from 'vitest';
import Myna from '../src';

describe('All Grammar Rules', () => {
  test('should stringify all grammar rules', () => {
    for (let r of Myna.allGrammarRules()) {
      expect(typeof r.toString()).toBe('string');
    }
  });
}); 