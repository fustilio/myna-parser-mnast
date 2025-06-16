import { describe, it, expect, beforeAll } from "vitest";
import { Myna } from "../src/myna";
import { createJsonGrammar, JsonGrammar } from "../grammars/grammar_json";
import RuleTesterVitest from "./rule_tester_vitest";

// JSON Grammar Test Suite

describe("JSON Grammar", () => {
  let m: typeof Myna;
  let g: JsonGrammar;
  beforeAll(() => {
    m = Myna;
    g = createJsonGrammar(Myna);
  });

  // Basic Values
  describe("Basic Values", () => {
    it("should parse null", () => {
      const result = Myna.parse(m.seq(g.null, m.end).ast, "null");
      expect(result).toBeTruthy();
    });

    it("should parse true", () => {
      const result = Myna.parse(m.seq(g.bool, m.end).ast, "true");
      expect(result).toBeTruthy();
    });

    it("should parse false", () => {
      const result = Myna.parse(m.seq(g.bool, m.end).ast, "false");
      expect(result).toBeTruthy();
    });

    it("should parse numbers", () => {
      const numbers = [
        "0",
        "42",
        "-42",
        "3.14",
        "-3.14",
        "1e10",
        "1e-10",
        "1.5e10",
        "-1.5e-10",
      ];
      numbers.forEach((num) => {
        const result = Myna.parse(m.seq(g.number, m.end).ast, num);
        expect(result).toBeTruthy();
      });
    });

    it("should parse strings", () => {
      const strings = [
        '""',
        '"hello"',
        '"hello world"',
        '"\\"quoted\\""',
        '"\\n\\r\\t"',
        '"\\u0041"',
        '"\\u00A9"',
      ];
      strings.forEach((str) => {
        const result = Myna.parse(m.seq(g.string, m.end).ast, str);
        expect(result).toBeTruthy();
      });
    });
  });

  // Arrays
  describe("Arrays", () => {
    it("should parse empty array", () => {
      const result = Myna.parse(m.seq(g.array, m.end).ast, "[]");
      expect(result).toBeTruthy();
    });

    it("should parse array with single value", () => {
      const result = Myna.parse(m.seq(g.array, m.end).ast, "[42]");
      expect(result).toBeTruthy();
    });

    it("should parse array with multiple values", () => {
      const result = Myna.parse(m.seq(g.array, m.end).ast, "[1, 2, 3]");
      expect(result).toBeTruthy();
    });

    it("should parse array with mixed values", () => {
      const result = Myna.parse(
        m.seq(g.array, m.end).ast,
        '[1, "two", true, null]'
      );
      expect(result).toBeTruthy();
    });

    it("should parse nested arrays", () => {
      const result = Myna.parse(
        m.seq(g.array, m.end).ast,
        "[1, [2, 3], [4, [5, 6]]]"
      );
      expect(result).toBeTruthy();
    });
  });

  // Objects
  describe("Objects", () => {
    it("should parse empty object", () => {
      const result = Myna.parse(m.seq(g.object, m.end).ast, "{}");
      expect(result).toBeTruthy();
    });

    it("should parse object with single property", () => {
      const result = Myna.parse(m.seq(g.object, m.end).ast, '{"key": "value"}');
      expect(result).toBeTruthy();
    });

    it("should parse object with multiple properties", () => {
      const result = Myna.parse(
        m.seq(g.object, m.end).ast,
        '{"a": 1, "b": 2, "c": 3}'
      );
      expect(result).toBeTruthy();
    });

    it("should parse object with mixed value types", () => {
      const result = Myna.parse(
        m.seq(g.object, m.end).ast,
        '{"number": 42, "string": "hello", "boolean": true, "null": null}'
      );
      expect(result).toBeTruthy();
    });

    it("should parse nested objects", () => {
      const result = Myna.parse(
        m.seq(g.object, m.end).ast,
        '{"outer": {"inner": "value"}}'
      );
      expect(result).toBeTruthy();
    });

    it("should parse complex nested structures", () => {
      const result = Myna.parse(
        m.seq(g.object, m.end).ast,
        `
                {
                    "name": "John",
                    "age": 30,
                    "address": {
                        "street": "123 Main St",
                        "city": "Boston",
                        "zip": "02108"
                    },
                    "phones": [
                        {
                            "type": "home",
                            "number": "555-1234"
                        },
                        {
                            "type": "work",
                            "number": "555-5678"
                        }
                    ]
                }
            `
      );
      expect(result).toBeTruthy();
    });
  });

  // Whitespace Handling
  describe("Whitespace Handling", () => {
    it("should handle various whitespace patterns", () => {
      const json = `
                {
                    "name": "John",
                    "age": 30,
                    "address": {
                        "street": "123 Main St",
                        "city": "Boston",
                        "zip": "02108"
                    }
                }
            `;
      const result = Myna.parse(m.seq(g.object, m.end).ast, json);
      expect(result).toBeTruthy();
    });
  });

  // Error Cases
  describe("Error Cases", () => {
    it("should reject invalid JSON", () => {
      const invalidInputs = [
        "{",
        "}",
        "[",
        "]",
        '{"key":',
        '{"key"}',
        "{,}",
        '{"key": "value",}',
        "[1,",
        "[1 2]",
        "[,]",
      ];
      invalidInputs.forEach((input) => {
        const result = Myna.parse(m.seq(g.object, m.end).ast, input);
        expect(result).toBeFalsy();
      });
    });

    it("should reject invalid strings", () => {
      const invalidInputs = [
        '"',
        '"unterminated',
        '"invalid\\escape"',
        '"invalid\\u"',
        '"invalid\\u123"',
      ];
      invalidInputs.forEach((input) => {
        const result = Myna.parse(m.seq(g.string, m.end).ast, input);
        expect(result).toBeFalsy();
      });
    });

    it("should reject invalid numbers", () => {
      const invalidInputs = ["1.", ".1", "1..2", "1e", "1e+"];
      invalidInputs.forEach((input) => {
        const result = Myna.parse(m.seq(g.number, m.end).ast, input);
        expect(result).toBeFalsy();
      });
    });
  });

  describe("Rule-based Tests", () => {
    it("should parse all pass strings", () => {
      const jsonRuleTests = [
        {
          rule: g.null,
          passStrings: ["null"],
          failStrings: ["nul", "NULL", "nullx"],
        },
        {
          rule: g.bool,
          passStrings: ["true", "false"],
          failStrings: ["tru", "TRUE", "truex", "fals", "FALSE", "falsex"],
        },
        {
          rule: g.number,
          passStrings: [
            "0",
            "42",
            "-42",
            "3.14",
            "-3.14",
            "1e10",
            "1e-10",
            "1.5e10",
            "-1.5e-10",
          ],
          failStrings: ["1.", ".1", "1..2", "1e", "1e+", "1e-", "1e++1"],
        },
        {
          rule: g.string,
          passStrings: [
            '""',
            '"hello"',
            '"hello world"',
            '"\\"quoted\\""',
            '"\\n\\r\\t"',
            '"\\u0041"',
            '"\\u00A9"',
          ],
          failStrings: [
            '"',
            '"unterminated',
            '"invalid\\escape"',
            '"invalid\\u"',
            '"invalid\\u123"',
          ],
        },
        {
          rule: g.array,
          passStrings: [
            "[]",
            "[42]",
            "[1, 2, 3]",
            '[1, "two", true, null]',
            "[1, [2, 3], [4, [5, 6]]]",
          ],
          failStrings: ["[", "]", "[1,", "[1 2]", "[,]"],
        },
        {
          rule: g.object,
          passStrings: [
            "{}",
            '{"key": "value"}',
            '{"a": 1, "b": 2, "c": 3}',
            '{"number": 42, "string": "hello", "boolean": true, "null": null}',
            '{"outer": {"inner": "value"}}',
          ],
          failStrings: [
            "{",
            "}",
            '{"key":',
            '{"key"}',
            "{,}",
            '{"key": "value",}',
          ],
        },
      ];

      const tester = new RuleTesterVitest(Myna, jsonRuleTests);
      tester.runTests();
    });
  });
});
