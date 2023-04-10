import { Type, Value, Static, TSchema } from './deps.ts'
import { blobType } from './types/blob.ts'
import { bufferType } from './types/buffer.ts'
import { formDataType } from './types/formData.ts'
import { objectIdType } from './types/objectId.ts'
import { streamType } from './types/stream.ts'

const validate = Value.Check as <T extends TSchema>(schema: T, value: unknown) => value is Static<T>

const types = {
  // standard
  any: Type.Any.bind(Type),
  array: Type.Array.bind(Type),
  bigint: Type.BigInt.bind(Type),
  boolean: Type.Boolean.bind(Type),
  date: Type.Date.bind(Type),
  literal: Type.Literal.bind(Type),
  null: Type.Null.bind(Type),
  number: Type.Number.bind(Type),
  object: Type.Object.bind(Type),
  omit: Type.Omit.bind(Type),
  optional: Type.Optional.bind(Type),
  partial: Type.Partial.bind(Type),
  pick: Type.Pick.bind(Type),
  record: Type.Record.bind(Type),
  regex: Type.RegEx.bind(Type),
  required: Type.Required.bind(Type),
  string: Type.String.bind(Type),
  tuple: Type.Tuple.bind(Type),
  undefined: Type.Undefined.bind(Type),
  union: Type.Union.bind(Type),
  unknown: Type.Unknown.bind(Type),

  // custom
  blob: blobType,
  buffer: bufferType,
  formData: formDataType,
  objectId: objectIdType,
  stream: streamType
}

export const v = Object.assign(validate, types)

export type { Static, TSchema as Schema } from './deps.ts'
