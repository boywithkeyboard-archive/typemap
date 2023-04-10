import { TypeSystem } from '../deps.ts'

export const blobType = TypeSystem.Type<Blob>('blob', (_, value) => {
  if (typeof value !== 'object')
    return false

  return value instanceof Blob
})
