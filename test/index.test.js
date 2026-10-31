import { test } from "node:test";
import assert from "node:assert/strict";
import { parse, stringify } from "../src/index.js";

test("parses simple rows", () => {
  assert.deepEqual(parse("a,b\n1,2\n"), [["a", "b"], ["1", "2"]]);
});

test("handles quotes, commas and escaped quotes", () => {
  assert.deepEqual(parse('x,"has, comma","say ""hi"""'), [["x", "has, comma", 'say "hi"']]);
});

test("handles embedded newlines and CRLF", () => {
  assert.deepEqual(parse('a,"line1\nline2"\r\nb,c\r\n'), [["a", "line1\nline2"], ["b", "c"]]);
});

test("keeps empty fields and a final row without newline", () => {
  assert.deepEqual(parse(",,\na,,"), [["", "", ""], ["a", "", ""]]);
  assert.deepEqual(parse("a\nb"), [["a"], ["b"]]);
  assert.deepEqual(parse(""), []);
});

test("header option returns objects and fills missing cells", () => {
  assert.deepEqual(parse("name,age\nAda,36\nBob", { header: true }), [
    { name: "Ada", age: "36" },
    { name: "Bob", age: "" },
  ]);
});

test("custom delimiter", () => {
  assert.deepEqual(parse('a;"b;c"', { delimiter: ";" }), [["a", "b;c"]]);
});

test("unterminated quote throws", () => {
  assert.throws(() => parse('"abc'), SyntaxError);
});

test("stringify quotes only when needed", () => {
  assert.equal(stringify([["a", "b,c", 'd"e', "f\ng", null, 3]]), 'a,"b,c","d""e","f\ng",,3\n');
});

test("stringify objects and round trip", () => {
  const rows = [{ name: "Ada", note: 'likes "csv", a lot' }, { name: "Bob", note: "" }];
  const text = stringify(rows);
  assert.deepEqual(parse(text, { header: true }), rows);
  assert.equal(stringify(rows, { columns: ["note"] }).split("\n")[0], "note");
});
