import {
  Any,
  Array,
  Blob,
  Boolean,
  Buffer,
  Date,
  FormData,
  Literal,
  Null,
  Number,
  Object,
  ObjectId,
  Omit,
  Optional,
  Partial,
  Pick,
  Record,
  Recursive,
  RegEx,
  Required,
  Stream,
  String,
  Tuple,
  Undefined,
  Union,
  Unknown,
} from './types.ts'

export default {
  // types
  any: Any,
  array: Array,
  blob: Blob,
  boolean: Boolean,
  buffer: Buffer,
  date: Date,
  formData: FormData,
  literal: Literal,
  null: Null,
  number: Number,
  object: Object,
  objectId: ObjectId,
  regex: RegEx,
  stream: Stream,
  string: String,
  undefined: Undefined,
  unknown: Unknown,

  // modifiers
  omit: Omit,
  optional: Optional,
  partial: Partial,
  pick: Pick,
  record: Record,
  recursive: Recursive,
  required: Required,
  tuple: Tuple,
  union: Union,
}

// @deno-types='https://cdn.jsdelivr.net/npm/bson@5.0.1/bson.d.ts'
export { ObjectId } from 'https://cdn.jsdelivr.net/npm/bson@5.0.1/+esm'

// @deno-types='https://cdn.jsdelivr.net/npm/@sinclair/typebox@0.25.24/value/value.d.ts'
import { Value } from 'https://cdn.jsdelivr.net/npm/@sinclair/typebox@0.25.24/value/value.js/+esm'

export const isValid = Value.Check

export type {
  Static,
  TSchema as TypeSchema,
} from 'https://cdn.jsdelivr.net/npm/@sinclair/typebox@0.25.24/typebox.d.ts'
