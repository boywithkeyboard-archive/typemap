import { TypeSystem } from '../deps.ts'

export const formDataType = TypeSystem.Type<FormData>('formData', (_, value) => {
  if (typeof value !== 'object')
    return false

  return value instanceof FormData
})
