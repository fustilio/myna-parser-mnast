import { describe, it, expect, beforeAll } from "vitest";
import { Myna } from "../src/myna";
import { createGlslGrammar, GlslGrammar } from "../grammars/grammar_glsl";
import RuleTesterVitest from "./rule_tester_vitest";

// GLSL Grammar Test Suite

describe("GLSL Grammar Tests", () => {
  const m = Myna;
  let g: GlslGrammar;

  beforeAll(() => {
    g = createGlslGrammar(m);
  });

  // Basic Lexical Rules
  describe("Basic Lexical Rules", () => {
    it("should parse whitespace", () => {
      expect(m.parse(g.ws.ast, "  \t\n  ")).toBeTruthy();
    });

    it("should parse comments", () => {
      expect(m.parse(g.comment.ast, "// This is a comment")).toBeTruthy();
      expect(
        m.parse(g.comment.ast, "/* This is a\nmulti-line comment */")
      ).toBeTruthy();
    });

    it("should parse identifiers", () => {
      expect(m.parse(g.identifier.ast, "myVariable")).toBeTruthy();
      expect(m.parse(g.identifier.ast, "_myVariable123")).toBeTruthy();
      expect(m.parse(g.identifier.ast, "my_variable")).toBeTruthy();
    });
  });

  // Literals
  describe("Literals", () => {
    it("should parse boolean literals", () => {
      expect(m.parse(g.bool.ast, "true")).toBeTruthy();
      expect(m.parse(g.bool.ast, "false")).toBeTruthy();
    });

    it("should parse numbers", () => {
      expect(m.parse(g.number.ast, "123")).toBeTruthy();
      expect(m.parse(g.number.ast, "-123")).toBeTruthy();
      expect(m.parse(g.number.ast, "123.456")).toBeTruthy();
      expect(m.parse(g.number.ast, "1e-10")).toBeTruthy();
      expect(m.parse(g.number.ast, "-1.23e+45")).toBeTruthy();
    });
  });

  // Operators
  describe("Operators", () => {
    it("should parse arithmetic operators", () => {
      expect(m.parse(g.additiveOp.ast, "+")).toBeTruthy();
      expect(m.parse(g.additiveOp.ast, "-")).toBeTruthy();
      expect(m.parse(g.multiplicativeOp.ast, "*")).toBeTruthy();
      expect(m.parse(g.multiplicativeOp.ast, "/")).toBeTruthy();
    });

    it("should parse comparison operators", () => {
      expect(m.parse(g.relationalOp.ast, "<")).toBeTruthy();
      expect(m.parse(g.relationalOp.ast, ">")).toBeTruthy();
      expect(m.parse(g.relationalOp.ast, "<=")).toBeTruthy();
      expect(m.parse(g.relationalOp.ast, ">=")).toBeTruthy();
      expect(m.parse(g.equalityOp.ast, "==")).toBeTruthy();
      expect(m.parse(g.equalityOp.ast, "!=")).toBeTruthy();
    });

    it("should parse logical operators", () => {
      expect(m.parse(g.logicalAndOp.ast, "&&")).toBeTruthy();
      expect(m.parse(g.logicalOrOp.ast, "||")).toBeTruthy();
      expect(m.parse(g.logicalXOrOp.ast, "^^")).toBeTruthy();
    });
  });

  // Expressions
  describe("Expressions", () => {
    it("should parse simple arithmetic expressions", () => {
      expect(m.parse(g.expr.ast, "1 + 2")).toBeTruthy();
      expect(m.parse(g.expr.ast, "3 * 4")).toBeTruthy();
      expect(m.parse(g.expr.ast, "5 - 6")).toBeTruthy();
      expect(m.parse(g.expr.ast, "7 / 8")).toBeTruthy();
    });

    it("should parse complex arithmetic expressions", () => {
      expect(m.parse(g.expr.ast, "1 + 2 * 3")).toBeTruthy();
      expect(m.parse(g.expr.ast, "(1 + 2) * 3")).toBeTruthy();
      expect(m.parse(g.expr.ast, "1 + 2 * 3 - 4 / 5")).toBeTruthy();
    });

    it("should parse logical expressions", () => {
      expect(m.parse(g.expr.ast, "true && false")).toBeTruthy();
      expect(m.parse(g.expr.ast, "a > b || c < d")).toBeTruthy();
      expect(m.parse(g.expr.ast, "!(a == b)")).toBeTruthy();
    });

    it("should parse conditional expressions", () => {
      expect(m.parse(g.expr.ast, "a ? b : c")).toBeTruthy();
      expect(m.parse(g.expr.ast, "a > b ? c + d : e - f")).toBeTruthy();
    });
  });

  // Statements
  describe("Statements", () => {
    it("should parse variable declarations", () => {
      expect(m.parse(g.varDecl.ast, "int x;")).toBeTruthy();
      expect(m.parse(g.varDecl.ast, "float y = 1.0;")).toBeTruthy();
      expect(
        m.parse(g.varDecl.ast, "vec3 color = vec3(1.0, 0.0, 0.0);")
      ).toBeTruthy();
    });

    it("should parse if statements", () => {
      expect(
        m.parse(g.ifStatement.ast, "if (x > 0) { return 1; }")
      ).toBeTruthy();
      expect(
        m.parse(
          g.ifStatement.ast,
          "if (x > 0) { return 1; } else { return 0; }"
        )
      ).toBeTruthy();
    });

    it("should parse loops", () => {
      expect(
        m.parse(g.forLoop.ast, "for (int i = 0; i < 10; i++) { x += i; }")
      ).toBeTruthy();
      expect(m.parse(g.whileLoop.ast, "while (x > 0) { x--; }")).toBeTruthy();
      expect(m.parse(g.doLoop.ast, "do { x--; } while (x > 0);")).toBeTruthy();
    });
  });

  // Functions
  describe("Functions", () => {
    it("should parse function calls", () => {
      expect(m.parse(g.funcCall.ast, "sin(x)")).toBeTruthy();
      expect(m.parse(g.funcCall.ast, "mix(color1, color2, 0.5)")).toBeTruthy();
    });

    it("should parse function definitions", () => {
      expect(
        m.parse(g.funcDef.ast, "float myFunc(float x) { return x * 2.0; }")
      ).toBeTruthy();
      expect(
        m.parse(
          g.funcDef.ast,
          "vec3 transform(vec3 v, mat4 m) { return (m * vec4(v, 1.0)).xyz; }"
        )
      ).toBeTruthy();
    });
  });

  // Structs
  describe("Structs", () => {
    it("should parse struct definitions", () => {
      expect(
        m.parse(
          g.structDef.ast,
          "struct Light { vec3 position; vec3 color; float intensity; };"
        )
      ).toBeTruthy();
    });

    it("should parse struct member access", () => {
      expect(m.parse(g.fieldSelect.ast, "light.position")).toBeTruthy();
      expect(m.parse(g.fieldSelect.ast, "material.diffuse.rgb")).toBeTruthy();
    });
  });

  // Preprocessor
  describe("Preprocessor", () => {
    it("should parse preprocessor directives", () => {
      expect(m.parse(g.ppDirective.ast, "#define MAX_LIGHTS 4")).toBeTruthy();
      expect(
        m.parse(g.ppDirective.ast, "#define PI 3.14159265359")
      ).toBeTruthy();
    });
  });

  // Rule-based Tests
  describe("Rule-based Tests", () => {
    it("should handle all rule-based test cases", () => {
      const glslRuleTests = [
        {
          rule: g.ws,
          passStrings: [
            "",
            " ",
            "\t",
            "\n",
            "/* */",
            " /* \n */ ",
            "// abc\n",
            "// abc",
          ],
          failStrings: ["a", " a "],
        },
        {
          rule: g.expr,
          passStrings: ["4", "42", "4.", "4.0", "4.2"],
          failStrings: ["1.4.2"],
        },
        {
          rule: g.bool,
          passStrings: ["true", "false"],
          failStrings: ["True", "fal se"],
        },
        {
          rule: g.expr,
          passStrings: [
            "4 + 2",
            "14+12",
            "14\t+2",
            "14/* meh */+// abc \n12",
            "1+4 + 12",
          ],
          failStrings: ["1+4+"],
        },
        {
          rule: g.expr,
          passStrings: [
            "(1)",
            "((1)+(4+2))",
            "(3.0-2.0*f)",
            "f*f*(3.0-2.0*f)",
            "f = f*f*(3.0-2.0*f)",
          ],
          failStrings: ["(1", "1)", "(1+", "+1)"],
        },
        {
          rule: g.expr,
          passStrings: [
            "-w",
            "- w",
            "- w * 0.4",
            "w =  - w * 0.4",
            "camTar.y = cameraPos.y = max((h*.25)+3.5, 1.5+sin(iGlobalTime*5.)*.5)",
          ],
          failStrings: [],
        },
        {
          rule: g.expr,
          passStrings: [
            "fn(1)",
            "fn(fn(1),2)",
            "x[12]",
            "x[(1)](42)[a]",
            "x.f",
            "x.n(1)",
            "f(x, 123, a[42](8, x))",
            "mix( rg.x, rg.y, f.z )",
          ],
          failStrings: [],
        },
        {
          rule: g.qualifiers,
          passStrings: [
            "invariant",
            "varying",
            "mediump",
            "invariant attribute lowp",
          ],
          failStrings: ["highp const"],
        },
        {
          rule: g.varDecl,
          passStrings: [
            "int x;",
            "int x=1;",
            "float x[1];",
            "float x[1] = x;",
            "varying int x = 2;",
            "int x, y;",
            "int x = 1, y = 42;",
            "invariant varying mediump vec3 color;",
          ],
          failStrings: ["int x", "int x==2"],
        },
        {
          rule: g.structDef,
          passStrings: [
            "struct S {};",
            "struct S {} s;",
            "struct S {} s[3];",
            "struct S { int a; };",
            "struct S { int a; float b; };",
          ],
          failStrings: ["struct {};"],
        },
        {
          rule: g.statement,
          passStrings: [
            "break;",
            ";",
            "continue;",
            "{}",
            "return;",
            "return 42;",
            "if (true) {} else {}",
            "do {} while (true)",
            "while (true) { }",
            "for (int i=0; i < 42; ++i) { }",
          ],
          failStrings: [],
        },
        {
          rule: g.statement,
          passStrings: [
            "int x;",
            "x = 42;",
            "x += 23;",
            "f();",
            "f(x, 123, a[42](8, x));",
            "p.x += 42;",
            "p.x *= iResolution.x/iResolution.y;",
          ],
          failStrings: [],
        },
        {
          rule: g.statement,
          passStrings: [
            "x = 42;",
            "x = 42;\r\n",
            "f(123); ",
            "{\r\n  x = 42; \r\n f(123); }",
          ],
          failStrings: [],
        },
        {
          rule: g.statement,
          passStrings: [
            "vec2 p = -1.0 + 2.0 * fragCoord.xy / iResolution.xy;",
            "{ vec2 p = -1.0 + 2.0 * fragCoord.xy / iResolution.xy;\r\n  p.x *= iResolution.x/iResolution.y; }",
          ],
          failStrings: [],
        },
        {
          rule: g.statement,
          passStrings: [
            "f = f*f*(3.0-2.0*f);",
            "return;",
            "return 42;",
            "return mix( rg.x, rg.y, f.z );",
          ],
          failStrings: [],
        },
        {
          rule: g.statement,
          passStrings: [
            "#ifndef HIGH_QUALITY_NOISE",
            "#ifndef HIGH_QUALITY_NOISE\n",
            "#endif\t",
          ],
          failStrings: [],
        },
        {
          rule: g.funcDef,
          passStrings: [
            "float f() { }",
            "float f () { }",
            "float f() { return fract(sin(v) * 437585.); }",
            "float rand1(in float x) {}",
            "float f() { return fract(sin(v) * 437585.); }",
            "float rand1 (in float v) {                             return fract(sin(v) * 437585.);}",
            `float rand1 (in float v) {                         \n        return fract(sin(v) * 437585.);\n    }`,
          ],
          failStrings: [],
        },
      ];

      const tester = new RuleTesterVitest(Myna, glslRuleTests);
      tester.runTests();
    });
  });
});
