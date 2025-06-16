import { beforeAll, describe, expect, it } from "vitest";
import { createHeronGrammar } from "../grammars/grammar_heron";
import { Myna } from "../src";
import fs from "fs";

function processType(ast) {
  if (ast.name != "typeExpr") throw new Error("expected a type expression");
  return ast.allText;
}

function processPrimitive(ast, prims) {
  var name = ast.children[0].allText;
  var type = processType(ast.children[1]);
  prims[name] = type;
}

describe("Heron Grammar", () => {
  const m = Myna;
  let g: any;

  beforeAll(() => {
    g = createHeronGrammar(m);
  });

  it("should parse primitives", () => {
    var text = fs.readFileSync("./tests/input/primitives.heron", "utf-8");
    var ast = m.parse(g.primitiveFile, text);

    if (!ast.children) {
      throw new Error("expected children");
    }

    var prims = {};
    for (var p of ast.children) {
      processPrimitive(p, prims);
    }

    const expectedSubsetOfPrimitives = {
      // Simple variable
      "iResolution": "ivec3",
      // Function type definition
      "float": "(bool) -> float", // This is the last definition of 'float' in the file
      // Operator as name with spaces in type signature
      "matrixCompMult": "( mat, mat ) -> mat",
      // Built-in constant
      "gl_MaxVertexUniformComponents": "int",
      // Fragment shader output
      "gl_FragColor": "vec4",
      // A type with an array
      "iChannelResolution": "vec3[4]",
      // An operator
      "+": "(Any, Any) -> Any",
    };

    for (const name in expectedSubsetOfPrimitives) {
      expect(prims).toHaveProperty(name);
      // @ts-ignore
      expect(prims[name]).toEqual(expectedSubsetOfPrimitives[name]);
    }

    // Verify the total count of unique primitives parsed
    // Based on manual count of unique names in tests/input/primitives.heron
    const expectedTotalPrimitives = 178;
    expect(Object.keys(prims).length).toBe(expectedTotalPrimitives);
  });
});
