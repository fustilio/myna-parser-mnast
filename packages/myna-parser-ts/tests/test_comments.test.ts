import { describe, it, expect, beforeAll } from "vitest";
import { Myna } from "../src";
import {
  CommentsGrammar,
  createCommentsGrammar,
} from "../grammars/grammar_comments";
import RuleTesterVitest from "./rule_tester_vitest";

describe("Comments Grammar", () => {
  let g: CommentsGrammar;

  beforeAll(() => {
    g = createCommentsGrammar(Myna);
  });

  describe("Line Comments", () => {
    it("should parse a single line comment", () => {
      const result = Myna.parse(g.lineComment, "// this is a comment\n");
      expect(result).toBeTruthy();
    });
    it("should parse a line comment without newline (EOF)", () => {
      const result = Myna.parse(g.lineComment, "// end of file");
      expect(result).toBeTruthy();
    });
    it("should not parse a line comment missing slashes", () => {
      const result = Myna.parse(g.lineComment, "this is not a comment\n");
      expect(result).toBeFalsy();
    });
  });

  describe("Block Comments", () => {
    it("should parse a simple block comment", () => {
      const result = Myna.parse(g.blockComment, "/* block comment */");
      expect(result).toBeTruthy();
    });
    it("should parse a block comment with newlines", () => {
      const result = Myna.parse(g.blockComment, "/* line1\nline2\n*/");
      expect(result).toBeTruthy();
    });
    it("should not parse an unterminated block comment", () => {
      const result = Myna.parse(g.blockComment, "/* unterminated");
      expect(result).toBeFalsy();
    });
  });

  describe("Whitespace and Code", () => {
    it("should parse whitespace", () => {
      const result = Myna.parse(g.ws, "   \t\t  ");
      expect(result).toBeTruthy();
    });
    it("should parse code between comments", () => {
      const result = Myna.parse(g.code, "int x = 42;");
      expect(result).toBeTruthy();
    });
    it("should parse code with symbols", () => {
      const result = Myna.parse(g.code, "a+b*c");
      expect(result).toBeTruthy();
    });
  });

  describe("File Rule (integration)", () => {
    it("should parse a file with code and comments", () => {
      const input = `// file header\nint x = 42; /* block */\n// end\n`;
      const result = Myna.parse(g.file, input);
      expect(result).toBeTruthy();
    });
    it("should parse a file with only comments", () => {
      const input = `// comment1\n/* comment2 */\n// comment3\n`;
      const result = Myna.parse(g.file, input);
      expect(result).toBeTruthy();
    });
    it("should parse a file with only whitespace", () => {
      const input = "    \t \n\n  ";
      const result = Myna.parse(g.file, input);
      expect(result).toBeTruthy();
    });
    it("should fail on unterminated block comment in file", () => {
      const input = `int x = 1; /* unterminated`;
      const result = Myna.parse(g.file, input);
      expect(result).toBeFalsy();
    });
  });

  describe("Rule-based Tests", () => {
    it("should run rule-based tests", () => {
      const ruleTests = [
        {
          rule: g.lineComment,
          passStrings: ["// comment\n", "//\n", "// comment"],
          failStrings: ["/ comment\n", "comment\n", "//"],
        },
        {
          rule: g.blockComment,
          passStrings: ["/* block */", "/* multi\nline */"],
          failStrings: ["/* unterminated", "/**/ unterminated"],
        },
        {
          rule: g.ws,
          passStrings: ["   ", "\t\t", " \t  "],
          failStrings: ["a", "/", "*"],
        },
        {
          rule: g.file,
          passStrings: [
            "// comment\nint x = 1;\n/* block */\n",
            "   \t\n// comment\n",
            "/* block */\n",
            "int x = 1;\n",
          ],
          failStrings: ["/* unterminated", "/ comment\n"],
        },
      ];
      const tester = new RuleTesterVitest(Myna, ruleTests);
      tester.runTests();
    });
  });
});
