import { describe, it, expect, beforeAll } from "vitest";
import fs from "fs";
import { Myna } from "../src";
import { escapeHtmlChars } from "../tools/myna_escape_html_chars.js";
import { createHtmlReservedCharsGrammar } from "../grammars/grammar_html_reserved_chars.js";

// Escape HTML Chars Test Suite

function testEscape(text: string, expected: string) {
  const result = escapeHtmlChars(text);
  expect(result).toBe(expected);
}

describe("Escape HTML Chars", () => {
  beforeAll(() => {
    createHtmlReservedCharsGrammar(Myna);
  });

  // Basic Character Escaping
  it("escapes basic chars", () => {
    testEscape("123", "123");
    testEscape("'", "&#039;");
    testEscape("< >", "&lt; &gt;");
    testEscape(" && ", " &amp;&amp; ");
    testEscape('"', "&quot;");
    testEscape("", "");
    testEscape("a", "a");
  });

  // Benchmarking
  it("benchmarks escape functions", () => {
    function naiveEscapeChars(s: string) {
      return s
        .replace(/&/g, "&amp;")
        .replace(/>/g, "&gt;")
        .replace(/</g, "&lt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
    const s = fs.readFileSync("tests/fixtures/qunit.html", "utf-8");

    const s1 = naiveEscapeChars(s);
    const s2 = escapeHtmlChars(s);
    expect(s1).toBe(s2);
  });
});
