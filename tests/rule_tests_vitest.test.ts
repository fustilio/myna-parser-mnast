import { beforeAll, describe, it } from "vitest";
import { Myna } from "../src";
import { getRuleTestInputs } from "./rule_test_inputs";
import RuleTesterVitest from "./rule_tester_vitest";
import { createGlslGrammar } from "../grammars/grammar_glsl";
import { createArithmeticGrammar } from "../grammars/grammar_arithmetic";
import { createJsonGrammar } from "../grammars/grammar_json";
import { createCsvGrammar } from "../grammars/grammar_csv";
import { createMarkdownGrammar } from "../grammars/grammar_markdown";
import { createMustacheGrammar } from "../grammars/grammar_mustache";
import { createLuceneGrammar } from "../grammars/grammar_lucene";
import { createHtmlReservedCharsGrammar } from "../grammars/grammar_html_reserved_chars";

describe("Parser Rules", () => {
  beforeAll(() => {
    // Initialize all required grammars in dependency order
    createHtmlReservedCharsGrammar(Myna);
    createMarkdownGrammar(Myna);
    createLuceneGrammar(Myna);
    createMustacheGrammar(Myna);
    createCsvGrammar(Myna);
    createJsonGrammar(Myna);
    createArithmeticGrammar(Myna);
    createGlslGrammar(Myna);
  });

  it("should run tests", () => {
    const inputs = getRuleTestInputs();
    const tester = new RuleTesterVitest(Myna, inputs);
    tester.runTests();
  });
});
