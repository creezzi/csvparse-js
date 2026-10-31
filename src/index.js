/**
 * @param {string} text
 * @param {{delimiter?: string, header?: boolean}} [options]
 * @returns {string[][] | Record<string,string>[]}
 */
export function parse(text, { delimiter = ",", header = false } = {}) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  let started = false;

  const endField = () => {
    row.push(field);
    field = "";
  };
  const endRow = () => {
    endField();
    rows.push(row);
    row = [];
    started = false;
  };

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += c;
    } else if (c === '"' && field === "") {
      quoted = started = true;
    } else if (c === delimiter) {
      endField();
      started = true;
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      endRow();
    } else {
      field += c;
      started = true;
    }
  }
  if (quoted) throw new SyntaxError("unterminated quoted field");
  if (started || field !== "") endRow();

  if (!header) return rows;
  const [names = [], ...body] = rows;
  return body.map((r) => Object.fromEntries(names.map((n, i) => [n, r[i] ?? ""])));
}

/** Quote only the fields that need it. Accepts arrays of arrays or of objects. */
export function stringify(rows, { delimiter = ",", columns } = {}) {
  const needsQuote = new RegExp(`["\\n\\r${delimiter.replace(/[\\\]^-]/g, "\\$&")}]`);
  const cell = (v) => {
    const s = v === null || v === undefined ? "" : String(v);
    return needsQuote.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
  };
  let table = rows;
  if (rows.length && !Array.isArray(rows[0])) {
    const cols = columns ?? Object.keys(rows[0]);
    table = [cols, ...rows.map((r) => cols.map((c) => r[c]))];
  }
  return table.map((r) => r.map(cell).join(delimiter) + "\n").join("");
}
