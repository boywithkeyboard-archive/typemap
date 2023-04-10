import { TypeSystem } from '../deps.ts'

export const streamType = TypeSystem.Type<ReadableStream>('stream', (_, value) => {
  if (typeof value !== 'object')
    return false

  return value instanceof ReadableStream
})
