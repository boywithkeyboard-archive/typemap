import { TypeSystem } from '../deps.ts'

export const bufferType = TypeSystem.Type<ArrayBuffer>('buffer', (_, value) => {
  if (typeof value !== 'object')
    return false

  return value instanceof ArrayBuffer
})
