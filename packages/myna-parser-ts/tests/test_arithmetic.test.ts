import { describe, it, expect, beforeAll } from "vitest";
import { Myna } from "../src";
import { evaluateArithmetic } from "../tools/myna_arithmetic_evaluator";
import { createArithmeticGrammar } from "../grammars/grammar_arithmetic";
import RuleTesterVitest from "./rule_tester_vitest";

// Arithmetic Grammar Test Suite

describe("Arithmetic Grammar", () => {
  let m: typeof Myna;
  let g: any;

  beforeAll(() => {
    m = Myna;
    // Register the grammar
    g = createArithmeticGrammar(Myna);
  });

  // Arithmetic Evaluator
  describe("Arithmetic Evaluator", () => {
    it('should evaluate "(42)" to 42', () => {
      expect(evaluateArithmetic("(42)")).toBe(42);
    });

    it('should evaluate "6 * 7" to 42', () => {
      expect(evaluateArithmetic("6 * 7")).toBe(42);
    });

    it('should evaluate "42" to 42', () => {
      expect(evaluateArithmetic("42")).toBe(42);
    });

    it('should evaluate "0" to 0', () => {
      expect(evaluateArithmetic("0")).toBe(0);
    });

    it('should evaluate "-42" to -42', () => {
      expect(evaluateArithmetic("-42")).toBe(-42);
    });

    it('should evaluate "- 5" to -5', () => {
      expect(evaluateArithmetic("- 5")).toBe(-5);
    });

    it('should evaluate "-       -   5" to 5', () => {
      expect(evaluateArithmetic("-       -   5")).toBe(5);
    });

    it('should evaluate "-(42)" to -42', () => {
      expect(evaluateArithmetic("-(42)")).toBe(-42);
    });

    it('should evaluate "+42" to 42', () => {
      expect(evaluateArithmetic("+42")).toBe(42);
    });

    it('should evaluate "+(42)" to 42', () => {
      expect(evaluateArithmetic("+(42)")).toBe(42);
    });

    it('should evaluate "2 * 3 * 7" to 42', () => {
      expect(evaluateArithmetic("2 * 3 * 7")).toBe(42);
    });

    it('should evaluate "5 * 8 + 2" to 42', () => {
      expect(evaluateArithmetic("5 * 8 + 2")).toBe(42);
    });

    it('should evaluate "2 + 5 * 8" to 42', () => {
      expect(evaluateArithmetic("2 + 5 * 8")).toBe(42);
    });

    it('should evaluate "(5 * 8) + 2" to 42', () => {
      expect(evaluateArithmetic("(5 * 8) + 2")).toBe(42);
    });

    it('should evaluate "2 + (5 * 8)" to 42', () => {
      expect(evaluateArithmetic("2 + (5 * 8)")).toBe(42);
    });

    it('should evaluate "((5 * 8) + 2)" to 42', () => {
      expect(evaluateArithmetic("((5 * 8) + 2)")).toBe(42);
    });

    it('should evaluate "(2 + (5 * 8))" to 42', () => {
      expect(evaluateArithmetic("(2 + (5 * 8))")).toBe(42);
    });

    it('should evaluate "6 * (9 - 2)" to 42', () => {
      expect(evaluateArithmetic("6 * (9 - 2)")).toBe(42);
    });

    it('should evaluate "(9 - 2) * 6" to 42', () => {
      expect(evaluateArithmetic("(9 - 2) * 6")).toBe(42);
    });

    it('should evaluate "5 * 9 - 3" to 42', () => {
      expect(evaluateArithmetic("5 * 9 - 3")).toBe(42);
    });

    it('should evaluate "-5 * 9" to -45', () => {
      expect(evaluateArithmetic("-5 * 9")).toBe(-45);
    });

    it('should evaluate "3 - -5" to 8', () => {
      expect(evaluateArithmetic("3 - -5")).toBe(8);
    });

    it('should evaluate "-3 - -5 * 9" to 42', () => {
      expect(evaluateArithmetic("-3 - -5 * 9")).toBe(42);
    });
  });

  // Rule-based Tests
  describe("Rule-based Tests", () => {
    it("should pass", () => {
      const ag = Myna.grammars.arithmetic;

      const arithmeticRuleTests = [
        {
          rule: ag.number,
          passStrings: ["0", "100", "421", "123.456", "0.0123e-456"],
          failStrings: ["", "abc", "1+2", "e+2", "01", "-"],
        },
        {
          rule: ag.parenExpr,
          passStrings: ["(1)", "(1+2)", "((1))", "((1)+(2))"],
          failStrings: ["", "?", " "],
        },
        {
          rule: ag.leafExpr,
          passStrings: ["123", "0", "(2+3)"],
          failStrings: ["", "?", " ", "x(1,2)", "sqrt(-9.9)", "x0"],
        },
        {
          rule: ag.prefixExpr,
          passStrings: ["+34", "-999", "+(-(4))"],
          failStrings: ["", "?", " ", "-x"],
        },
        {
          rule: ag.mulExpr,
          passStrings: ["* 42", "* -3"],
          failStrings: ["", "?", " ", "+ 12"],
        },
        {
          rule: ag.divExpr,
          passStrings: ["/\t12", "/ -3"],
          failStrings: ["", "?", " "],
        },
        {
          rule: ag.product,
          passStrings: ["1", "1*2", "1 * 2 * 3", "42 * (9 + 3)"],
          failStrings: ["42 * 9 + 3", "", "?", " "],
        },
        {
          rule: ag.addExpr,
          passStrings: ["+333"],
          failStrings: ["- 43", "", "?", " "],
        },
        {
          rule: ag.subExpr,
          passStrings: ["- 43"],
          failStrings: ["+333", "", "?", " "],
        },
        {
          rule: ag.sum,
          passStrings: ["1", "1+2", "1 + 2 + 3", "42 * 9 + 3"],
          failStrings: ["", "?", " "],
        },
        {
          rule: ag.expr,
          passStrings: ["(1+(2.3 * 42) / (19))"],
          failStrings: ["", "?", " "],
        },
      ];

      const tester = new RuleTesterVitest(Myna, arithmeticRuleTests);
      tester.runTests();
    });
  });
});
