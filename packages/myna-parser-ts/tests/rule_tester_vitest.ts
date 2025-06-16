import { describe, test, expect } from "vitest";

interface TestResult {
  name: string;
  description: string;
  negative: boolean;
  success: boolean;
  error?: any;
  ruleDescr: string;
  rule: any;
}

interface TestInput {
  rule: any;
  passStrings: string[];
  failStrings: string[];
}

export class RuleTesterVitest {
  constructor(private myna: any, private inputs: TestInput[]) {
    if (!myna) throw new Error("Missing Myna module");
    if (!inputs) throw new Error("Missing inputs");
  }

  private testParse(
    rule: any,
    text: string,
    shouldPass: boolean = true
  ): TestResult {
    let result = this.myna.failed;
    let err: any;

    try {
      const astRule = rule.ast;
      const node = this.myna.parse(astRule, text);
      if (node) result = node.end;
    } catch (e) {
      if (e.type !== "ParserError") {
        throw e;
      }
      err = e;
    }

    const testResult: TestResult = {
      name: `${rule.toString()} with input "${text}"`,
      description: `${result}/${text.length}`,
      negative: !shouldPass,
      success: (result === text.length) !== !shouldPass,
      error: err,
      ruleDescr: `${rule.type}: ${rule.toString()}`,
      rule,
    };

    if (!testResult.success) {
      console.log(testResult);
    }

    return testResult;
  }

  private testRule(
    rule: any,
    passStrings: string[],
    failStrings: string[]
  ): void {
    for (const input of passStrings) {
      const result = this.testParse(rule, input, true);
      expect(result.success, `${result.name} should pass`).toBe(true);
    }

    for (const input of failStrings) {
      const result = this.testParse(rule, input, false);
      expect(result.success, `${result.name} should fail`).toBe(true);
    }
  }

  public runTests(): void {
    for (const t of this.inputs) {
      if (!t || !t.rule || !t.passStrings || !t.failStrings) {
        console.log("t", t);
        throw new Error(
          "Each test must have a rule, an array of passing strings, and an array of failing strings"
        );
      }

      describe(t.rule.toString(), () => {
        test("should parse valid inputs", () => {
          this.testRule(t.rule, t.passStrings, t.failStrings);
        });
      });
    }
  }
}

export default RuleTesterVitest;
