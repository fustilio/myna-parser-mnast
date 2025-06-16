import { describe, it, expect, beforeAll } from "vitest";
import { Myna } from "../src";
import { createCsvGrammar } from "../grammars/grammar_csv";
import RuleTesterVitest from "./rule_tester_vitest";

// CSV Grammar Test Suite

describe("CSV Grammar", () => {
  beforeAll(() => {
    createCsvGrammar(Myna);
  });

  // Basic CSV Parsing
  describe("Basic CSV Parsing", () => {
    it("should parse empty file", () => {
      const result = Myna.parsers.csv("");
      expect(result).toBeTruthy();
    });

    it("should parse single field", () => {
      const result = Myna.parsers.csv("hello");
      expect(result).toBeTruthy();
    });

    it("should parse multiple fields", () => {
      const result = Myna.parsers.csv("hello,world");
      expect(result).toBeTruthy();
    });

    it("should parse multiple records", () => {
      const result = Myna.parsers.csv("hello,world\nfoo,bar");
      expect(result).toBeTruthy();
    });

    it("should parse empty fields", () => {
      const result = Myna.parsers.csv(",,");
      expect(result).toBeTruthy();
    });

    it("should parse fields with spaces", () => {
      const result = Myna.parsers.csv("hello world,foo bar");
      expect(result).toBeTruthy();
    });
  });

  // Quoted Fields
  describe("Quoted Fields", () => {
    it("should parse quoted field", () => {
      const result = Myna.parsers.csv('"hello"');
      expect(result).toBeTruthy();
    });

    it("should parse quoted field with comma", () => {
      const result = Myna.parsers.csv('"hello,world"');
      expect(result).toBeTruthy();
    });

    it("should parse quoted field with newline", () => {
      const result = Myna.parsers.csv('"hello\nworld"');
      expect(result).toBeTruthy();
    });

    it("should parse quoted field with quotes", () => {
      const result = Myna.parsers.csv('"hello""world"');
      expect(result).toBeTruthy();
    });

    it("should parse mixed quoted and unquoted fields", () => {
      const result = Myna.parsers.csv('hello,"world,foo",bar');
      expect(result).toBeTruthy();
    });
  });

  // Custom Delimiters
  describe("Custom Delimiters", () => {
    it("should parse tab-delimited file", () => {
      createCsvGrammar(Myna, "\t");
      const result = Myna.parsers.csv("hello\tworld\nfoo\tbar");
      expect(result).toBeTruthy();
    });

    it("should parse semicolon-delimited file", () => {
      createCsvGrammar(Myna, ";");
      const result = Myna.parsers.csv("hello;world\nfoo;bar");
      expect(result).toBeTruthy();
    });

    it("should parse pipe-delimited file", () => {
      createCsvGrammar(Myna, "|");
      const result = Myna.parsers.csv("hello|world\nfoo|bar");
      expect(result).toBeTruthy();
    });
  });

  // Line Endings
  describe("Line Endings", () => {
    it("should parse CRLF line endings", () => {
      const result = Myna.parsers.csv("hello,world\r\nfoo,bar");
      expect(result).toBeTruthy();
    });

    it("should parse LF line endings", () => {
      const result = Myna.parsers.csv("hello,world\nfoo,bar");
      expect(result).toBeTruthy();
    });

    it("should parse CR line endings", () => {
      const result = Myna.parsers.csv("hello,world\rfoo,bar");
      expect(result).toBeTruthy();
    });

    it("should parse mixed line endings", () => {
      const result = Myna.parsers.csv(
        "hello,world\r\nfoo,bar\nbaz,qux\rquux,corge"
      );
      expect(result).toBeTruthy();
    });
  });

  // Complex Cases
  describe("Complex Cases", () => {
    it("should parse complex data with all features", () => {
      const csv = `name,age,description
"John ""The Rock"" Smith",42,"Likes to lift weights, and ""pound"" the pavement"
"Jane ""The Hammer"" Doe",35,"Prefers to ""hammer"" out problems"
"Bob ""The Builder"" Jones",28,"Always ""building"" something new"`;
      const result = Myna.parsers.csv(csv);
      expect(result).toBeTruthy();
    });

    it("should parse data with empty lines", () => {
      const csv = `header1,header2,header3

value1,value2,value3

value4,value5,value6`;
      const result = Myna.parsers.csv(csv);
      expect(result).toBeTruthy();
    });

    it("should parse data with trailing delimiter", () => {
      const result = Myna.parsers.csv("hello,world,\nfoo,bar,");
      expect(result).toBeTruthy();
    });
  });

  // Error Cases
  describe("Error Cases", () => {
    it("should reject unclosed quotes", () => {
      expect(() => Myna.parsers.csv('"hello')).toThrow();
    });

    it("should reject invalid quote escaping", () => {
      expect(() => Myna.parsers.csv('"hello"world"')).toThrow();
    });

    it("should reject invalid custom delimiter", () => {
      expect(() => {
        createCsvGrammar(Myna, "invalid");
      }).toThrow();
    });
  });

  // Rule-based Tests
  describe("Rule-based Tests", () => {
    it("should handle all rule-based test cases", () => {
      const csvRuleTests = [
        {
          rule: Myna.grammars.csv.field,
          passStrings: [
            "hello",
            "hello world",
            '"hello"',
            '"hello""world"',
            '"hello,world"',
            '"hello\nworld"',
          ],
          failStrings: [
            '"hello', // unclosed quote
          ],
        },
        {
          rule: Myna.grammars.csv.record,
          passStrings: [
            "hello,world",
            ",,",
            '"hello,world","foo,bar"',
            'hello,"world,foo",bar',
          ],
          failStrings: [
            '"hello"world"', // invalid escaping
          ],
        },
        {
          rule: Myna.grammars.csv.file,
          passStrings: [
            "hello,world\nfoo,bar",
            "hello,world\n\nfoo,bar",
            "hello,world\r\nfoo,bar",
            "hello,world\r\nfoo,bar\nbaz,qux\rquux,corge",
            `name,age,description\n"John ""The Rock"" Smith",42,"Likes to lift weights, and ""pound"" the pavement"\n"Jane ""The Hammer"" Doe",35,"Prefers to ""hammer"" out problems"\n"Bob ""The Builder"" Jones",28,"Always ""building"" something new"`,
          ],
          failStrings: [
            '"hello"world"', // invalid file
          ],
        },
      ];

      const tester = new RuleTesterVitest(Myna, csvRuleTests);
      tester.runTests();
    });
  });
});
