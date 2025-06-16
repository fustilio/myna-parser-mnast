import { describe, it, bench, expect, beforeAll } from "vitest";
import { Myna } from "../src/myna";
import { createJsonGrammar } from "../grammars/grammar_json";
import input from "./input/1k_json";

// Benchmark Test Suite

describe("Benchmark Tests", () => {
  const m = Myna;
  let g;

  beforeAll(() => {
    g = createJsonGrammar(m);
  });

  // Basic Benchmark Tests
  describe("Basic Benchmark Tests", () => {
    it("should parse JSON input", () => {
      expect(m.parse(g.json.ast, input)).toBeTruthy();
    });

    it("should parse JSON input with whitespace", () => {
      expect(m.parse(g.json.ast, input + "  ")).toBeTruthy();
    });
  });

  // Performance Tests
  describe("Performance Tests", () => {
    it("should parse JSON input quickly", () => {
      m.parse(g.json.ast, input);
    });

    it("should parse JSON input with whitespace quickly", () => {
      m.parse(g.json.ast, input + "  ");
    });
  });
});
