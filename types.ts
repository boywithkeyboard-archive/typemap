// deno-lint-ignore-file no-explicit-any
// @deno-types='https://cdn.jsdelivr.net/npm/@sinclair/typebox@0.25.24/typebox.d.ts'
import {
  ArrayOptions,
  DateOptions,
  Hint,
  Kind,
  Modifier,
  NumericOptions,
  ObjectOptions,
  ObjectPropertyKeys,
  SchemaOptions,
  StringFormatOption,
  StringOptions,
  TAny,
  TArray,
  TBoolean,
  TDate,
  TLiteral,
  TLiteralValue,
  TModifier,
  TNever,
  TNull,
  TNumber,
  TNumeric,
  TObject,
  TOmit,
  TOptional,
  TPartial,
  TPick,
  TProperties,
  TRecord,
  TRecordProperties,
  TRecursive,
  TRequired,
  TSchema,
  TSelf,
  TString,
  TTuple,
  TUndefined,
  TUnion,
  TUnknown,
  TUnsafe,
  UnionStringLiteralToTuple,
  UnsafeOptions,
} from 'https://cdn.jsdelivr.net/npm/@sinclair/typebox@0.25.24/typebox.js/+esm'
import { ObjectId as _ObjectId } from 'https://deno.land/x/realm@v0.1.1/mod.ts'
// @deno-types='https://cdn.jsdelivr.net/npm/@sinclair/typebox@0.25.24/custom/custom.d.ts'
import { Custom } from 'https://cdn.jsdelivr.net/npm/@sinclair/typebox@0.25.24/custom/custom.js/+esm'

let TypeOrdinal = 0

function clone(value: any): any {
  const isObject = (object: any): object is Record<string | symbol, any> =>
    typeof object === 'object' && object !== null &&
    !globalThis.Array.isArray(object)
  const isArray = (object: any): object is any[] =>
    typeof object === 'object' && object !== null &&
    globalThis.Array.isArray(object)
  if (isObject(value)) {
    return globalThis.Object.keys(value).reduce(
      (acc, key) => ({
        ...acc,
        [key]: clone(value[key]),
      }),
      globalThis.Object.getOwnPropertySymbols(value).reduce(
        (acc, key: any) => ({
          ...acc,
          [key]: clone(value[key]),
        }),
        {},
      ),
    )
  } else if (isArray(value)) {
    return value.map((item: any) => clone(item))
  } else {
    return value
  }
}

// modifiers
export function Omit<T extends TObject, K extends TUnion<TLiteral<string>[]>>(
  schema: T,
  keys: K,
  options?: ObjectOptions,
): TOmit<T, UnionStringLiteralToTuple<K>>

export function Omit<T extends TObject, K extends ObjectPropertyKeys<T>[]>(
  schema: T,
  keys: readonly [...K],
  options?: ObjectOptions,
): TOmit<T, K>

export function Omit(schema: any, keys: any, options: ObjectOptions = {}) {
  const select: readonly string[] = keys[Kind] === 'Union'
    ? keys.anyOf.map((schema: TLiteral) => schema.const)
    : keys
  const next = { ...clone(schema), ...options, [Hint]: 'Omit' }
  if (next.required) {
    next.required = next.required.filter((key: string) =>
      !select.includes(key as any)
    )
    if (next.required.length === 0) delete next.required
  }
  for (const key of globalThis.Object.keys(next.properties)) {
    if (select.includes(key as any)) delete next.properties[key]
  }
  return next
}

export function Optional<T extends TSchema>(item: T): TOptional<T> {
  return { [Modifier]: 'Optional', ...item }
}

export function Partial<T extends TObject>(
  schema: T,
  options: ObjectOptions = {},
): TPartial<T> {
  const next = { ...clone(schema), ...options, [Hint]: 'Partial' }
  delete next.required
  for (const key of globalThis.Object.keys(next.properties)) {
    const property = next.properties[key]
    const modifer = property[Modifier]
    switch (modifer) {
      case 'ReadonlyOptional':
        property[Modifier] = 'ReadonlyOptional'
        break
      case 'Readonly':
        property[Modifier] = 'ReadonlyOptional'
        break
      case 'Optional':
        property[Modifier] = 'Optional'
        break
      default:
        property[Modifier] = 'Optional'
        break
    }
  }
  return next
}

export function Pick<T extends TObject, K extends TUnion<TLiteral<string>[]>>(
  schema: T,
  keys: K,
  options?: ObjectOptions,
): TPick<T, UnionStringLiteralToTuple<K>>

export function Pick<T extends TObject, K extends ObjectPropertyKeys<T>[]>(
  schema: T,
  keys: readonly [...K],
  options?: ObjectOptions,
): TPick<T, K>

export function Pick<T extends TObject, K extends ObjectPropertyKeys<T>[]>(
  schema: any,
  keys: any,
  options: ObjectOptions = {},
) {
  const select: readonly string[] = keys[Kind] === 'Union'
    ? keys.anyOf.map((schema: TLiteral) => schema.const)
    : keys
  const next = { ...clone(schema), ...options, [Hint]: 'Pick' }
  if (next.required) {
    next.required = next.required.filter((key: any) => select.includes(key))
    if (next.required.length === 0) delete next.required
  }
  for (const key of globalThis.Object.keys(next.properties)) {
    if (!select.includes(key as any)) delete next.properties[key]
  }
  return next
}

export function Record<K extends TUnion<TLiteral[]>, T extends TSchema>(
  key: K,
  schema: T,
  options?: ObjectOptions,
): TObject<TRecordProperties<K, T>>

export function Record<K extends TString | TNumeric, T extends TSchema>(
  key: K,
  schema: T,
  options?: ObjectOptions,
): TRecord<K, T>

export function Record(key: any, value: any, options: ObjectOptions = {}) {
  // If string literal union return TObject with properties extracted from union.
  if (key[Kind] === 'Union') {
    return Object(
      key.anyOf.reduce((acc: any, literal: any) => {
        return { ...acc, [literal.const]: value }
      }, {}),
      { ...options, [Hint]: 'Record' },
    )
  }
  // otherwise return TRecord with patternProperties
  const pattern = ['Integer', 'Number'].includes(key[Kind])
    ? '^(0|[1-9][0-9]*)$'
    : key[Kind] === 'String' && key.pattern
    ? key.pattern
    : '^.*$'
  return {
    ...options,
    [Kind]: 'Record',
    type: 'object',
    patternProperties: { [pattern]: value },
    additionalProperties: false,
  }
}

export function Recursive<T extends TSchema>(
  callback: (self: TSelf) => T,
  options: SchemaOptions = {},
): TRecursive<T> {
  if (options.$id === undefined) options.$id = `T${TypeOrdinal++}`
  const self = callback({ [Kind]: 'Self', $ref: `${options.$id}` } as any)
  self.$id = options.$id
  return { ...options, ...self }
}

export function Required<T extends TObject>(
  schema: T,
  options: SchemaOptions = {},
): TRequired<T> {
  const next = { ...clone(schema), ...options, [Hint]: 'Required' }
  next.required = globalThis.Object.keys(next.properties)
  for (const key of globalThis.Object.keys(next.properties)) {
    const property = next.properties[key]
    const modifier = property[Modifier]
    switch (modifier) {
      case 'ReadonlyOptional':
        property[Modifier] = 'Readonly'
        break
      case 'Readonly':
        property[Modifier] = 'Readonly'
        break
      case 'Optional':
        delete property[Modifier]
        break
      default:
        delete property[Modifier]
        break
    }
  }
  return next
}

function Never(options: SchemaOptions = {}): TNever {
  return {
    ...options,
    [Kind]: 'Never',
    allOf: [
      { type: 'boolean', const: false },
      { type: 'boolean', const: true },
    ],
  } as any
}

export function Tuple<T extends TSchema[]>(
  items: [...T],
  options: SchemaOptions = {},
): TTuple<T> {
  const additionalItems = false
  const minItems = items.length
  const maxItems = items.length
  const schema = (items.length > 0
    ? {
      ...options,
      [Kind]: 'Tuple',
      type: 'array',
      items,
      additionalItems,
      minItems,
      maxItems,
    }
    : {
      ...options,
      [Kind]: 'Tuple',
      type: 'array',
      minItems,
      maxItems,
    }) as any
  return schema
}

export function Union(items: [], options?: SchemaOptions): TNever

export function Union<T extends TSchema[]>(
  items: [...T],
  options?: SchemaOptions,
): TUnion<T>

export function Union<T extends TSchema[]>(
  items: [...T],
  options: SchemaOptions = {},
) {
  return items.length === 0
    ? Never({ ...options })
    : { ...options, [Kind]: 'Union', anyOf: items }
}

// types
export function Any(options: SchemaOptions = {}): TAny {
  return { ...options, [Kind]: 'Any' } as any
}

export function Array<T extends TSchema>(
  items: T,
  options: ArrayOptions = {},
): TArray<T> {
  return { ...options, [Kind]: 'Array', type: 'array', items } as any
}

export function Boolean(options: SchemaOptions = {}): TBoolean {
  return { ...options, [Kind]: 'Boolean', type: 'boolean' } as any
}

export function Date(options: DateOptions = {}): TDate {
  return {
    ...options,
    [Kind]: 'Date',
    type: 'object',
    instanceOf: 'Date',
  } as any
}

export function Literal<T extends TLiteralValue>(
  value: T,
  options: SchemaOptions = {},
): TLiteral<T> {
  return {
    ...options,
    [Kind]: 'Literal',
    const: value,
    type: typeof value as 'string' | 'number' | 'boolean',
  } as any
}

export function Null(options: SchemaOptions = {}): TNull {
  return { ...options, [Kind]: 'Null', type: 'null' } as any
}

export function Number(options: NumericOptions = {}): TNumber {
  return { ...options, [Kind]: 'Number', type: 'number' } as any
}

export function Object<T extends TProperties>(
  properties: T,
  options: ObjectOptions = {},
): TObject<T> {
  const property_names = globalThis.Object.keys(properties)
  const optional = property_names.filter((name) => {
    const property = properties[name] as TModifier
    const modifier = property[Modifier]
    return modifier &&
      (modifier === 'Optional' || modifier === 'ReadonlyOptional')
  })
  const required = property_names.filter((name) => !optional.includes(name))
  if (required.length > 0) {
    return {
      ...options,
      [Kind]: 'Object',
      type: 'object',
      properties,
      required,
    } as any
  } else {
    return { ...options, [Kind]: 'Object', type: 'object', properties } as any
  }
}

export function RegEx(regex: RegExp, options: SchemaOptions = {}): TString {
  return {
    ...options,
    [Kind]: 'String',
    type: 'string',
    pattern: regex.source,
  } as any
}

export function String<Format extends string>(
  options: StringOptions<StringFormatOption | Format> = {},
): TString<Format> {
  return { ...options, [Kind]: 'String', type: 'string' } as any
}

export function Undefined(options: SchemaOptions = {}): TUndefined {
  return {
    ...options,
    [Kind]: 'Undefined',
    type: 'null',
    typeOf: 'Undefined',
  } as any
}

export function Unknown(options: SchemaOptions = {}): TUnknown {
  return { ...options, [Kind]: 'Unknown' } as any
}

function Unsafe<T>(options: UnsafeOptions = {}): TUnsafe<T> {
  return { ...options, [Kind]: options[Kind] || 'Unsafe' } as any
}

// deno-lint-ignore ban-types
function createType<Type, Options = object>(
  kind: string,
  callback: (options: Options, value: unknown) => boolean,
) {
  if (Custom.Has(kind)) throw new Error(`duplicate type: ${kind}`)
  Custom.Set(kind, callback)
  return (options: Partial<Options> = {}) =>
    Unsafe<Type>({ ...options, [Kind]: kind })
}

export const Blob = createType<Blob>('blob', (_options, value) => {
  if (typeof value !== 'object') {
    return false
  }

  if (!(value instanceof Blob)) {
    return false
  }

  return true
})

export const Buffer = createType<ArrayBuffer>('buffer', (_options, value) => {
  if (typeof value !== 'object') {
    return false
  }

  if (!(value instanceof ArrayBuffer)) {
    return false
  }

  return true
})

export const FormData = createType<FormData>('formData', (_options, value) => {
  if (typeof value !== 'object') {
    return false
  }

  if (!(value instanceof FormData)) {
    return false
  }

  return true
})

export const Stream = createType<ReadableStream>(
  'stream',
  (_options, value) => {
    if (typeof value !== 'object') {
      return false
    }

    if (!(value instanceof ReadableStream)) {
      return false
    }

    return true
  },
)

export const ObjectId = createType<string>('objectId', (_options, value) => {
  if (typeof value !== 'string') {
    return false
  }

  return _ObjectId.isValid(value)
})
