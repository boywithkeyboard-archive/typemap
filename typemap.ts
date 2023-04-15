export type Static<T extends Schema<unknown>> = T['static']

export interface Schema<Static, Options = unknown> {
  _: {
    v: (value: unknown) => boolean
  } & Options

  static: Static

  // or: () => void

  // promise: () => this

  // nullable: () => this
}

/* boolean ------------------------------------------------------------------ */

export type BooleanSchema = Schema<boolean>

export const booleanType = {
  _: {
    v(val) {
      try {
        if (typeof val !== 'boolean')
          throw 0

          return true
      } catch (_err) {
        return false
      }
    }
  }
} as BooleanSchema

/* bigint ------------------------------------------------------------------- */

export type BigIntSchema = Schema<bigint>

export const bigintType = {
  _: {
    v(val) {
      try {
        if (typeof val !== 'bigint')
          throw 0

          return true
      } catch (_err) {
        return false
      }
    }
  }
} as BigIntSchema

/* literal ------------------------------------------------------------------ */

type LiteralSchema<T> = Schema<T>

export const literalType = <T = unknown>(value: T): LiteralSchema<T> => ({
  _: {
    v(val) {
      try {
        if (val !== value)
          throw 0

        return true
      } catch (_err) {
        return false
      }
    }
  }
} as LiteralSchema<T>)

/* number ------------------------------------------------------------------- */

export interface NumberSchema extends Schema<number, {
  min?: number
  max?: number
  lt?: number
  gt?: number
  lte?: number
  gte?: number
}> {
  min: (minimum: number) => this
  max: (maximum: number) => this
  lt: (lowerThan: number) => this
  gt: (greaterThan: number) => this
  lte: (lowerThanOrEqual: number) => this
  gte: (greaterThanOrEqual: number) => this
}

export const numberType = {
  _: {
    v(val) {
      try {
        if (typeof val !== 'number')
          throw 0

        if (this.min && val < this.min)
          throw 0

        if (this.max && val > this.max)
          throw 0

        if (this.lt && val >= this.lt)
          throw 0
        
        if (this.gt && val <= this.gt)
          throw 0
        
        if (this.lte && val > this.lte)
          throw 0

        if (this.gte && val < this.gte)
          throw 0

        return true
      } catch (_err) {
        return false
      }
    },
  },

  min(num) {
    this._.min = num

    return this
  },

  max(num) {
    this._.max = num

    return this
  },

  lt(num) {
    this._.lt = num

    return this
  },

  gt(num) {
    this._.gt = num

    return this
  },

  lte(num) {
    this._.lte = num

    return this
  },

  gte(num) {
    this._.gte = num

    return this
  }
} as NumberSchema

/* string ------------------------------------------------------------------- */

export interface StringSchema extends Schema<string, {
  min?: number
  max?: number
  format?:
    | 'email'
    | 'ipv4'
    | 'ipv6'
    | 'ip'
  encoding?:
    | 'base64'
  startsWith?: string
  endsWith?: string
  includes?: string
}> {
  min: (minimumLength: number) => this
  max: (maximumLength: number) => this
  length: (length: number) => this
  startsWith: (str: string) => this
  endsWith: (str: string) => this
  includes: (str: string) => this
  email: () => this
  ipv4: () => this
  ipv6: () => this
  ip: () => this
}

export const stringType = {
  _: {
    v(value) {
      try {
        if (typeof value !== 'string')
          throw 0
        
        if (this.min && value.length < this.min)
          throw 0

        if (this.max && value.length > this.max)
          throw 0

        if (this.startsWith && !value.startsWith(this.startsWith))
          throw 0

        if (this.endsWith && !value.endsWith(this.endsWith))
          throw 0

        if (this.includes && !value.includes(this.includes))
          throw 0

        if (this.format) {
          if (this.format === 'email') {
            if (/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value.toLowerCase()) === false)
              throw 0
          } else if (this.format === 'ip') {
            if (/(?:^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$)|(?:^(?:(?:[a-fA-F\d]{1,4}:){7}(?:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){5}(?::(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,2}|:)|(?:[a-fA-F\d]{1,4}:){4}(?:(?::[a-fA-F\d]{1,4}){0,1}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,3}|:)|(?:[a-fA-F\d]{1,4}:){3}(?:(?::[a-fA-F\d]{1,4}){0,2}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,4}|:)|(?:[a-fA-F\d]{1,4}:){2}(?:(?::[a-fA-F\d]{1,4}){0,3}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,5}|:)|(?:[a-fA-F\d]{1,4}:){1}(?:(?::[a-fA-F\d]{1,4}){0,4}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,6}|:)|(?::(?:(?::[a-fA-F\d]{1,4}){0,5}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,7}|:)))(?:%[0-9a-zA-Z]{1,})?$)/gm.test(value) === false)
              throw 0
          } else if (this.format === 'ipv4') {
            if (/^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$/gm.test(value) === false)
              throw 0
          } else if (this.format === 'ipv6') {
            if (/^(?:(?:[a-fA-F\d]{1,4}:){7}(?:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){6}(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|:[a-fA-F\d]{1,4}|:)|(?:[a-fA-F\d]{1,4}:){5}(?::(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,2}|:)|(?:[a-fA-F\d]{1,4}:){4}(?:(?::[a-fA-F\d]{1,4}){0,1}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,3}|:)|(?:[a-fA-F\d]{1,4}:){3}(?:(?::[a-fA-F\d]{1,4}){0,2}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,4}|:)|(?:[a-fA-F\d]{1,4}:){2}(?:(?::[a-fA-F\d]{1,4}){0,3}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,5}|:)|(?:[a-fA-F\d]{1,4}:){1}(?:(?::[a-fA-F\d]{1,4}){0,4}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,6}|:)|(?::(?:(?::[a-fA-F\d]{1,4}){0,5}:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}|(?::[a-fA-F\d]{1,4}){1,7}|:)))(?:%[0-9a-zA-Z]{1,})?$/gm.test(value) === false)
              throw 0
          }
        }

        return true
      } catch (_err) {
        return false
      }
    }
  },
  
  min(min) {
    this._.min = min

    return this
  },

  max(max) {
    this._.max = max

    return this
  },

  length(length) {
    this._.min = length
    this._.max = length

    return this
  },

  startsWith(str: string) {
    this._.startsWith = str

    return this
  },

  endsWith(str: string) {
    this._.startsWith = str
    
    return this
  },

  includes(str: string) {
    this._.startsWith = str
    
    return this
  },

  email() {
    this._.format = 'email'

    return this
  },

  ipv4() {
    this._.format = 'ipv4'

    return this
  },

  ipv6() {
    this._.format = 'ipv6'

    return this
  },

  ip() {
    this._.format = 'ip'

    return this
  }
} as StringSchema

/* object ------------------------------------------------------------------- */

type ObjectSchema<T> = Schema<T, { object: true }>

export const objectType = <T extends Record<string, Schema<unknown>>>(object: T): ObjectSchema<T> => ({
  _: {
    object: true,

    v(val) {
      try {
        if (typeof val !== 'object')
          throw 0

        // const loopThrough = (object: Schema<unknown> | ObjectSchema<unknown>) => {
        //   if (object._.object === true)
        //     return loopThrough(object)

        //   if (object.)
        // }

        return true
      } catch (_err) {
        return false
      }
    }
  }
} as ObjectSchema<T>)

/* types -------------------------------------------------------------------- */

export const v = {
  boolean: booleanType,
  bigint: bigintType,
  literal: literalType,
  number: numberType,
  string: stringType,
  object: objectType
}

export function isValid<Expected extends Schema<unknown>>(expected: Expected, value: unknown) {
  return expected._.v(value)
}
