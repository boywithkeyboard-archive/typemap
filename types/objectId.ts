import { TypeSystem, ObjectId } from '../deps.ts'

export const objectIdType = TypeSystem.Type<string>('objectId', (_, value) => {
  if (typeof value !== 'string')
    return false

  return ObjectId.isValid(value)
})
