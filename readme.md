## typemap

```ts
import { isValid, v } from 'https://deno.land/x/typemap@v0.1.10'
import type { Static, TypeSchema } from 'https://deno.land/x/typemap@v0.1.10'

const schema = v.object({
  key: v.literal('value'),
})

const value = {
  key: 'value',
}

console.log(isValid(schema, value)) // true
```
