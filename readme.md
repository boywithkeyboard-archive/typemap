## typemap

```ts
import { v } from 'https://deno.land/x/typemap@v0.2.0/mod.ts'
import type { Static, Schema } from 'https://deno.land/x/typemap@v0.2.0/mod.ts'

const schema = v.object({
  key: v.literal('value')
})

const valid = {
  key: 'value'
}

const invalid = {
  key: 'key'
}

console.log(v(schema, valid)) // true
console.log(v(schema, invalid)) // false
```
