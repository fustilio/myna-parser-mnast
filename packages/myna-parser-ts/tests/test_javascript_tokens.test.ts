import { describe, it, expect, beforeAll } from "vitest";
import { Myna } from "../src";
import {
  createJavascriptTokensGrammar,
  JavascriptTokensGrammar,
} from "../grammars/grammar_javascript_tokens";
import RuleTesterVitest from "./rule_tester_vitest";

describe("JavaScript Tokens Grammar", () => {
  let g: JavascriptTokensGrammar;

  beforeAll(() => {
    g = createJavascriptTokensGrammar(Myna);
  });

  describe("Whitespace", () => {
    it("should parse spaces and tabs", () => {
      expect(Myna.parse(g.whiteSpace, "   \t\t  ")).toBeTruthy();
    });
    it("should parse newlines", () => {
      expect(Myna.parse(g.whiteSpace, "\n\r\n")).toBeTruthy();
    });
  });

  describe("Comments", () => {
    it("should parse single-line comment", () => {
      expect(Myna.parse(g.singleLineComment, "// comment\n")).toBeTruthy();
    });
    it("should parse multi-line comment", () => {
      expect(
        Myna.parse(g.multiLineComment, "/* block comment */")
      ).toBeTruthy();
    });
    it("should fail on unterminated multi-line comment", () => {
      expect(Myna.parse(g.multiLineComment, "/* unterminated")).toBeFalsy();
    });
  });

  describe("Identifiers", () => {
    it("should parse simple identifiers", () => {
      expect(Myna.parse(g.identifier, "foo")).toBeTruthy();
      expect(Myna.parse(g.identifier, "_bar123")).toBeTruthy();
    });
    it("should fail on invalid identifiers", () => {
      expect(Myna.parse(g.identifier, "123abc")).toBeFalsy();
    });
  });

  describe("Numbers", () => {
    it("should parse integers", () => {
      expect(Myna.parse(g.number, "42")).toBeTruthy();
    });
    it("should parse decimals", () => {
      expect(Myna.parse(g.number, "3.14")).toBeTruthy();
    });
    it("should fail on invalid numbers", () => {
      expect(Myna.parse(g.number, ".123")).toBeFalsy();
    });
  });

  describe("Strings", () => {
    it("should parse double-quoted strings", () => {
      expect(Myna.parse(g.string, '"hello"')).toBeTruthy();
    });
    it("should parse single-quoted strings", () => {
      expect(Myna.parse(g.string, "'world'")).toBeTruthy();
    });
    it("should fail on unterminated strings", () => {
      expect(Myna.parse(g.string, '"unterminated')).toBeFalsy();
    });
  });

  describe("Punctuators", () => {
    it("should parse common punctuators", () => {
      [
        "{",
        "}",
        "(",
        ")",
        ";",
        ",",
        "+",
        "-",
        "*",
        "==",
        "!=",
        "&&",
        "||",
        "=>",
      ].forEach((p) => {
        expect(Myna.parse(g.punctuator, p)).toBeTruthy();
      });
    });
    it("should fail on non-punctuator", () => {
      expect(Myna.parse(g.punctuator, "foo")).toBeFalsy();
    });
  });

  describe("File Rule (integration)", () => {
    it("should parse a sequence of tokens", () => {
      const input = `var x = 42; // comment\nfunction foo() { return 'bar'; }`;
      expect(Myna.parse(g.file, input)).toBeTruthy();
    });
    it("should fail on unterminated comment", () => {
      const input = `var x = 1; /* unterminated`;
      expect(Myna.parse(g.file, input)).toBeFalsy();
    });
    it("should fail on unterminated string", () => {
      const input = `var x = 'unterminated`;

      expect(Myna.parse(g.file, input)).toBeFalsy();
    });
  });

  describe("Rule-based Tests", () => {
    it("should run rule-based tests", () => {
      const ruleTests = [
        {
          rule: g.whiteSpace,
          passStrings: [" ", "\t", "\n", "\r", "  \t\n"],
          failStrings: ["a", "/", "1"],
        },
        {
          rule: g.singleLineComment,
          passStrings: ["// comment\n", "//\n", "// comment"],
          failStrings: ["/ comment\n", "comment\n", "//"],
        },
        {
          rule: g.multiLineComment,
          passStrings: ["/* block */", "/* multi\nline */"],
          failStrings: ["/* unterminated", "/**/ unterminated"],
        },
        {
          rule: g.identifier,
          passStrings: ["foo", "_bar", "baz123"],
          failStrings: ["123abc", "!foo", ""],
        },
        {
          rule: g.number,
          passStrings: ["42", "3.14", "123456"],
          failStrings: [".123", "foo", "1.2.3"],
        },
        {
          rule: g.string,
          passStrings: ['"hello"', "'world'"],
          failStrings: ['"unterminated', "'unterminated"],
        },
        {
          rule: g.punctuator,
          passStrings: ["{", "}", "+", "-", "==", "=>"],
          failStrings: ["foo", "123", "@"],
        },
      ];
      const tester = new RuleTesterVitest(Myna, ruleTests);
      tester.runTests();
    });
  });
});
