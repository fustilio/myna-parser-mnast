"use strict";

import { Myna } from "../src";

interface CsvGrammar {
  textdata: Myna.Rule;
  quoted: Myna.Rule;
  field: Myna.Rule;
  record: Myna.Rule;
  file: Myna.Rule;
}

// Implements a CSV (comma separated values) grammar using the Myna parsing library
// See https://tools.ietf.org/html/rfc4180
// Because this grammar is computed at run-time, it can support tab delimited data by passing in "\t"
// to the constructor as the delimiter.
export function createCsvGrammar(
  myna: typeof Myna,
  delimiter: string = ","
): CsvGrammar {
  if (delimiter.length !== 1) {
    throw new Error("Delimiter must be a single character");
  }

  const m = myna;

  const g: CsvGrammar = {
    textdata: m.notChar('\n\r"' + delimiter),
    quoted: m.doubleQuoted(m.notChar('"').or('""').zeroOrMore),
    field: null as any,
    record: null as any,
    file: null as any,
  };

  // Set up circular references
  g.field = g.textdata.or(g.quoted).zeroOrMore.ast;
  g.record = g.field.delimited(delimiter).ast;
  g.file = g.record.delimited(m.newLine).ast;

  // Register the grammar, providing a name and the default parse rule
  myna.registerGrammar("csv", g, g.file);
  return g;
}
