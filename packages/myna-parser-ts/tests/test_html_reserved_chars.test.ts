import { describe, it, expect, beforeAll } from "vitest";
import { Myna } from "../src";
import { createHtmlReservedCharsGrammar } from "../grammars/grammar_html_reserved_chars";
import RuleTesterVitest from "./rule_tester_vitest";

describe("HTML Reserved Chars Grammar", () => {
  beforeAll(() => {
    createHtmlReservedCharsGrammar(Myna);
  });

  describe("Basic Characters", () => {
    it("should parse ampersand", () => {
      const result = Myna.parsers.html_reserved_chars("&");
      expect(result).toBeTruthy();
    });

    it("should parse less than", () => {
      const result = Myna.parsers.html_reserved_chars("<");
      expect(result).toBeTruthy();
    });

    it("should parse greater than", () => {
      const result = Myna.parsers.html_reserved_chars(">");
      expect(result).toBeTruthy();
    });

    it("should parse double quote", () => {
      const result = Myna.parsers.html_reserved_chars('"');
      expect(result).toBeTruthy();
    });

    it("should parse single quote", () => {
      const result = Myna.parsers.html_reserved_chars("'");
      expect(result).toBeTruthy();
    });

    it("should parse regular text", () => {
      const result = Myna.parsers.html_reserved_chars("Hello World");
      expect(result).toBeTruthy();
    });
  });

  describe("Combined Characters", () => {
    it("should parse text with ampersand", () => {
      const result = Myna.parsers.html_reserved_chars("Hello & World");
      expect(result).toBeTruthy();
    });

    it("should parse text with less than", () => {
      const result = Myna.parsers.html_reserved_chars("Hello < World");
      expect(result).toBeTruthy();
    });

    it("should parse text with greater than", () => {
      const result = Myna.parsers.html_reserved_chars("Hello > World");
      expect(result).toBeTruthy();
    });

    it("should parse text with quotes", () => {
      const result = Myna.parsers.html_reserved_chars('Hello "World"');
      expect(result).toBeTruthy();
    });

    it("should parse text with single quotes", () => {
      const result = Myna.parsers.html_reserved_chars("Hello 'World'");
      expect(result).toBeTruthy();
    });
  });

  describe("Complex Cases", () => {
    it("should parse HTML-like content", () => {
      const result = Myna.parsers.html_reserved_chars(
        '<div class="test">Hello & World</div>'
      );
      expect(result).toBeTruthy();
    });

    it("should parse text with multiple special characters", () => {
      const result = Myna.parsers.html_reserved_chars(
        "&lt;div&gt;Hello &amp; World&lt;/div&gt;"
      );
      expect(result).toBeTruthy();
    });

    it("should parse text with nested quotes", () => {
      const result = Myna.parsers.html_reserved_chars(
        "He said \"Hello 'World'\""
      );
      expect(result).toBeTruthy();
    });

    it("should parse text with mixed special characters", () => {
      const result = Myna.parsers.html_reserved_chars("& < > \" ' Hello World");
      expect(result).toBeTruthy();
    });
  });

  describe("Edge Cases", () => {
    it("should parse empty string", () => {
      const result = Myna.parsers.html_reserved_chars("");
      expect(result).toBeTruthy();
    });

    it("should parse string with only special characters", () => {
      const result = Myna.parsers.html_reserved_chars("&<>\"'");
      expect(result).toBeTruthy();
    });

    it("should parse string with repeated special characters", () => {
      const result = Myna.parsers.html_reserved_chars("&&&&&");
      expect(result).toBeTruthy();
    });

    it("should parse string with special characters at boundaries", () => {
      const result = Myna.parsers.html_reserved_chars("&Hello World&");
      expect(result).toBeTruthy();
    });
  });

  describe("Rule-based Tests", () => {
    it("should run rule-based tests", () => {
      const htmlReservedCharsRuleTests = [
        {
          rule: Myna.grammars.html_reserved_chars.ampersand,
          passStrings: ["&"],
          failStrings: ["a", "b", "c"],
        },
        {
          rule: Myna.grammars.html_reserved_chars.lessThan,
          passStrings: ["<"],
          failStrings: ["a", "b", "c"],
        },
        {
          rule: Myna.grammars.html_reserved_chars.greaterThan,
          passStrings: [">"],
          failStrings: ["a", "b", "c"],
        },
        {
          rule: Myna.grammars.html_reserved_chars.doubleQuote,
          passStrings: ['"'],
          failStrings: ["a", "b", "c"],
        },
        {
          rule: Myna.grammars.html_reserved_chars.singleQuote,
          passStrings: ["'"],
          failStrings: ["a", "b", "c"],
        },
        {
          rule: Myna.grammars.html_reserved_chars.regularText,
          passStrings: ["Hello World"],
          failStrings: ["&", "<", ">", '"', "'"],
        },
      ];

      const tester = new RuleTesterVitest(Myna, htmlReservedCharsRuleTests);
      tester.runTests();
    });
  });
});
