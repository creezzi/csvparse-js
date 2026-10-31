# csvparse

Parse and stringify CSV with quotes, embedded newlines, custom delimiters and header rows.

## Usage

```js
import { parse, stringify } from "csvparse";

parse("name,age\nAda,36", { header: true }); // [{ name: "Ada", age: "36" }]
stringify([["a", "b,c"]]);                    // 'a,"b,c"\n'
```

## Test

```bash
npm test
```

## License

MIT
