import { describe, it, expect, beforeAll } from "vitest";
import { Myna } from "../src";
import { createPithyGrammar, PithyGrammar } from "../grammars/grammar_pithy";

let pithyProgramRule: Myna.Rule;

// Helper to check for successful parse
function expectPithyParseSuccess(code: string) {
  // Use the directly obtained rule instead of string lookup
  const ast = Myna.parse(pithyProgramRule, code);
  if (ast == null) {
    // Myna.parse returns null on failure to match the entire input with the given AST rule.
    expect("AST should be defined for a successful parse, but was null").toBe(
      false
    );
    return;
  }
  expect(ast).toBeDefined(); // Redundant if ast != null, but keeps structure
  // Check if the full input was consumed and no error reported
  expect(ast.error).toBeUndefined();
  // A successful parse of a program should match the 'program' rule
  expect(ast.name).toBe("program");
  // And it should consume the entire string
  expect(ast.end).toBe(code.length);
}

// Helper to check for failed parse
function expectPithyParseFailure(code: string) {
  // Use the directly obtained rule instead of string lookup
  const ast = Myna.parse(pithyProgramRule, code);
  // A parse fails if ast is null OR ast.error is defined OR it's a partial parse.
  if (ast == null) {
    // Myna.parse returns null for a failed parse against an AstRule
    expect(true).toBe(true); // Parse returned null, which is a failure.
  } else {
    // AST was returned, check for an error property or incomplete parse.
    const failed = ast.error != null || ast.end !== code.length;
    if (!failed) {
      // This block executes if the test is about to fail because invalid code was parsed successfully.
      console.log("\n[DEBUG] Unexpected successful parse of invalid code:");
      // console.log("Input Code:", JSON.stringify(code));
      // console.log("Parsed AST:", ast.toString());
    }
    expect(failed).toBe(true);
  }
}

describe("Pithy Grammar", () => {
  beforeAll(() => {
    // Get the grammar object and the program rule directly
    const pithyGrammar = createPithyGrammar(Myna);
    if (!pithyGrammar || !pithyGrammar.program) {
      throw new Error("Failed to create Pithy grammar or get program rule");
    }
    pithyProgramRule = pithyGrammar.program;
  });

  it("should provide grammar and AST schema strings", () => {
    expect(typeof Myna.grammarToString("pithy")).toBe("string");
    expect(typeof Myna.astSchemaToString("pithy")).toBe("string");
  });

  describe("Parsing Pithy code", () => {
    describe("Valid snippets", () => {
      it("should parse an empty string", () => {
        expectPithyParseSuccess("");
      });

      it("should parse a line with only a comment (and newline)", () => {
        expectPithyParseSuccess("# this is a comment\n");
      });

      it("should parse a simple assignment", () => {
        expectPithyParseSuccess("x = 1\n");
      });

      it("should parse a function definition with pass", () => {
        // Pithy requires 4 spaces for indentation as per grammar_pithy.ts
        expectPithyParseSuccess("def foo():\n    pass\n");
      });

      it("should parse a basic print statement", () => {
        expectPithyParseSuccess("print 'Hello, world!'\n");
      });

      it("should parse a silly if statement with true condition", () => {
        expectPithyParseSuccess("if True:\n    print x\n");
      });

      it("should parse a silly if statement with false condition", () => {
        expectPithyParseSuccess("if False:\n    print x\n");
      });

      it("should parse an if statement with computed conditional", () => {
        expectPithyParseSuccess("if 1 > 0:\n    print x\n");
      });

      it("should parse an if statement with assignment", () => {
        expectPithyParseSuccess("x = 1\nif x > 0:\n    print x\n");
      });

      it("should parse an if statement with assignment (inside suite)", () => {
        expectPithyParseSuccess("if True:\n    a = a + 1\n");
      });

      it("should parse an if statement with complex conditional and assignment", () => {
        expectPithyParseSuccess("if x + 1 > 0:\n    a = a + 1\n");
      });

      it("should parse a silly while loop with true condition", () => {
        expectPithyParseSuccess("while True:\n    print x\n");
      });

      it("should parse a silly while loop with false condition", () => {
        expectPithyParseSuccess("while False:\n    print x\n");
      });

      it("should parse a while loop", () => {
        expectPithyParseSuccess("while x < 10:\n    print x\n");
      });

      
      it("should parse a while loop with assignment (decrement)", () => {
        expectPithyParseSuccess("while x < 10:\n    x = x - 1\n");
      });

      
      it("should parse a while loop with assignment (increment)", () => {
        expectPithyParseSuccess("while x < 10:\n    x = x + 1\n");
      });

      it("should parse a for loop", () => {
        expectPithyParseSuccess("for i in range(5):\n    print i\n");
      });

      it("should parse print to file syntax", () => {
        expectPithyParseSuccess("print >> sys.stderr, 'Error message'\n");
      });

      it("should parse multiple statements", () => {
        const code = `x = 1\ny = x + 2\ndef bar():\n    return y\n`;
        expectPithyParseSuccess(code);
      });

      it("should parse a function with blank and comment lines in its body", () => {
        const code = `
def my_func():
    x = 1

    # a comment line
    y = 2
`;
        expectPithyParseSuccess(code.trim() + "\n");
      });
    });

    describe("Invalid snippets", () => {
      it("should fail to parse assignment with invalid RHS", () => {
        expectPithyParseFailure("x = @\n");
      });

      it("should fail to parse function definition with incorrect indentation (1 space)", () => {
        expectPithyParseFailure("def foo():\n pass\n");
      });

      it("should fail to parse function definition with incorrect indentation (3 spaces)", () => {
        expectPithyParseFailure("def foo():\n   pass\n");
      });

      it("should fail to parse unclosed parenthesis", () => {
        expectPithyParseFailure("print(x\n");
      });

      it("should fail on keyword misuse as variable", () => {
        expectPithyParseFailure("if = 1\n");
      });

      it("should fail on incomplete if statement", () => {
        expectPithyParseFailure("if x > 0:\n"); // Missing body
      });
    });
  });
});
