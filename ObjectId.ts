// exact copy of bson's objectid implementation but without unnecessary boilerplate

// BYTE UTILITIES

// Web global
type ArrayBufferViewWithTag = ArrayBufferView & {
  [Symbol.toStringTag]?: string
}

/** @internal */
function webRandomBytes(byteLength: number) {
  if (byteLength < 0) {
    throw new RangeError(
      `The argument 'byteLength' is invalid. Received ${byteLength}`,
    )
  }
  return ByteUtils.fromNumberArray(
    Array.from({ length: byteLength }, () => Math.floor(Math.random() * 256)),
  )
}

const HEX_DIGIT = /(\d|[a-f])/i

/** @internal */
const ByteUtils = {
  toLocalBufferType(
    potentialUint8array: Uint8Array | ArrayBufferViewWithTag | ArrayBuffer,
  ): Uint8Array {
    const stringTag = potentialUint8array?.[Symbol.toStringTag] ??
      Object.prototype.toString.call(potentialUint8array)

    if (stringTag === 'Uint8Array') {
      return potentialUint8array as Uint8Array
    }

    if (ArrayBuffer.isView(potentialUint8array)) {
      return new Uint8Array(
        potentialUint8array.buffer.slice(
          potentialUint8array.byteOffset,
          potentialUint8array.byteOffset + potentialUint8array.byteLength,
        ),
      )
    }

    if (
      stringTag === 'ArrayBuffer' ||
      stringTag === 'SharedArrayBuffer' ||
      stringTag === '[object ArrayBuffer]' ||
      stringTag === '[object SharedArrayBuffer]'
    ) {
      return new Uint8Array(potentialUint8array)
    }

    throw new Error(
      `Cannot make a Uint8Array from ${String(potentialUint8array)}`,
    )
  },

  allocate(size: number): Uint8Array {
    if (typeof size !== 'number') {
      throw new TypeError(
        `The "size" argument must be of type number. Received ${String(size)}`,
      )
    }
    return new Uint8Array(size)
  },

  equals(a: Uint8Array, b: Uint8Array): boolean {
    if (a.byteLength !== b.byteLength) {
      return false
    }
    for (let i = 0; i < a.byteLength; i++) {
      if (a[i] !== b[i]) {
        return false
      }
    }
    return true
  },

  fromNumberArray(array: number[]): Uint8Array {
    return Uint8Array.from(array)
  },

  fromBase64(base64: string): Uint8Array {
    return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  },

  toBase64(uint8array: Uint8Array): string {
    return btoa(ByteUtils.toISO88591(uint8array))
  },

  /** **Legacy** binary strings are an outdated method of data transfer. Do not add public API support for interpreting this format */
  fromISO88591(codePoints: string): Uint8Array {
    return Uint8Array.from(codePoints, (c) => c.charCodeAt(0) & 0xff)
  },

  /** **Legacy** binary strings are an outdated method of data transfer. Do not add public API support for interpreting this format */
  toISO88591(uint8array: Uint8Array): string {
    return Array.from(
      Uint16Array.from(uint8array),
      (b) => String.fromCharCode(b),
    ).join('')
  },

  fromHex(hex: string): Uint8Array {
    const evenLengthHex = hex.length % 2 === 0
      ? hex
      : hex.slice(0, hex.length - 1)
    const buffer = []

    for (let i = 0; i < evenLengthHex.length; i += 2) {
      const firstDigit = evenLengthHex[i]
      const secondDigit = evenLengthHex[i + 1]

      if (!HEX_DIGIT.test(firstDigit)) {
        break
      }
      if (!HEX_DIGIT.test(secondDigit)) {
        break
      }

      const hexDigit = Number.parseInt(`${firstDigit}${secondDigit}`, 16)
      buffer.push(hexDigit)
    }

    return Uint8Array.from(buffer)
  },

  toHex(uint8array: Uint8Array): string {
    return Array.from(uint8array, (byte) => byte.toString(16).padStart(2, '0'))
      .join('')
  },

  fromUTF8(text: string): Uint8Array {
    return new TextEncoder().encode(text)
  },

  toUTF8(uint8array: Uint8Array): string {
    return new TextDecoder('utf8', { fatal: false }).decode(uint8array)
  },

  utf8ByteLength(input: string): number {
    return ByteUtils.fromUTF8(input).byteLength
  },

  encodeUTF8Into(
    buffer: Uint8Array,
    source: string,
    byteOffset: number,
  ): number {
    const bytes = ByteUtils.fromUTF8(source)
    buffer.set(bytes, byteOffset)
    return bytes.byteLength
  },

  randomBytes: webRandomBytes,
}

// GENERAL

interface ObjectIdExtended {
  $oid: string
}

const BSON_MAJOR_VERSION = 5 as const
let PROCESS_UNIQUE: Uint8Array | null = null

function isUint8Array(value: unknown): value is Uint8Array {
  return Object.prototype.toString.call(value) === '[object Uint8Array]'
}

const checkForHexRegExp = new RegExp('^[0-9a-fA-F]{24}$')

class BSONDataView extends DataView {
  static fromUint8Array(input: Uint8Array) {
    return new DataView(input.buffer, input.byteOffset, input.byteLength)
  }
}

interface ObjectIdLike {
  id: string | Uint8Array
  __id?: string
  toHexString(): string
}

abstract class BSONValue {
  /** @public */
  public abstract get _bsontype(): string

  /** @internal */
  get [Symbol.for('@@mdb.bson.version')](): typeof BSON_MAJOR_VERSION {
    return BSON_MAJOR_VERSION
  }

  /** @public */
  public abstract inspect(): string

  /** @internal */
  abstract toExtendedJSON(): unknown
}

const kId = Symbol('id')

export class ObjectId extends BSONValue {
  get _bsontype(): 'ObjectId' {
    return 'ObjectId'
  }

  /** @internal */
  private static index = Math.floor(Math.random() * 0xffffff)

  static cacheHexString: boolean

  /** ObjectId Bytes @internal */
  private [kId]!: Uint8Array
  /** ObjectId hexString cache @internal */
  private __id?: string

  /**
   * Create an ObjectId type
   *
   * @param inputId - Can be a 24 character hex string, 12 byte binary Buffer, or a number.
   */
  constructor(
    inputId?: string | number | ObjectId | ObjectIdLike | Uint8Array,
  ) {
    super()
    // workingId is set based on type of input and whether valid id exists for the input
    let workingId
    if (typeof inputId === 'object' && inputId && 'id' in inputId) {
      if (typeof inputId.id !== 'string' && !ArrayBuffer.isView(inputId.id)) {
        throw new Error(
          'Argument passed in must have an id that is of type string or Buffer',
        )
      }
      if (
        'toHexString' in inputId && typeof inputId.toHexString === 'function'
      ) {
        workingId = ByteUtils.fromHex(inputId.toHexString())
      } else {
        workingId = inputId.id
      }
    } else {
      workingId = inputId
    }

    // the following cases use workingId to construct an ObjectId
    if (workingId == null || typeof workingId === 'number') {
      // The most common use case (blank id, new objectId instance)
      // Generate a new id
      this[kId] = ObjectId.generate(
        typeof workingId === 'number' ? workingId : undefined,
      )
    } else if (ArrayBuffer.isView(workingId) && workingId.byteLength === 12) {
      // If intstanceof matches we can escape calling ensure buffer in Node.js environments
      this[kId] = ByteUtils.toLocalBufferType(workingId)
    } else if (typeof workingId === 'string') {
      if (workingId.length === 12) {
        // TODO(NODE-4361): Remove string of length 12 support
        const bytes = ByteUtils.fromUTF8(workingId)
        if (bytes.byteLength === 12) {
          this[kId] = bytes
        } else {
          throw new Error('Argument passed in must be a string of 12 bytes')
        }
      } else if (workingId.length === 24 && checkForHexRegExp.test(workingId)) {
        this[kId] = ByteUtils.fromHex(workingId)
      } else {
        throw new Error(
          'Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer',
        )
      }
    } else {
      throw new Error('Argument passed in does not match the accepted types')
    }
    // If we are caching the hex string
    if (ObjectId.cacheHexString) {
      this.__id = ByteUtils.toHex(this.id)
    }
  }

  /**
   * The ObjectId bytes
   * @readonly
   */
  get id(): Uint8Array {
    return this[kId]
  }

  set id(value: Uint8Array) {
    this[kId] = value
    if (ObjectId.cacheHexString) {
      this.__id = ByteUtils.toHex(value)
    }
  }

  /** Returns the ObjectId id as a 24 character hex string representation */
  toHexString(): string {
    if (ObjectId.cacheHexString && this.__id) {
      return this.__id
    }

    const hexString = ByteUtils.toHex(this.id)

    if (ObjectId.cacheHexString && !this.__id) {
      this.__id = hexString
    }

    return hexString
  }

  /**
   * Update the ObjectId index
   * @internal
   */
  private static getInc(): number {
    return (ObjectId.index = (ObjectId.index + 1) % 0xffffff)
  }

  /**
   * Generate a 12 byte id buffer used in ObjectId's
   *
   * @param time - pass in a second based timestamp.
   */
  static generate(time?: number): Uint8Array {
    if ('number' !== typeof time) {
      time = Math.floor(Date.now() / 1000)
    }

    const inc = ObjectId.getInc()
    const buffer = ByteUtils.allocate(12)

    // 4-byte timestamp
    BSONDataView.fromUint8Array(buffer).setUint32(0, time, false)

    // set PROCESS_UNIQUE if yet not initialized
    if (PROCESS_UNIQUE === null) {
      PROCESS_UNIQUE = ByteUtils.randomBytes(5)
    }

    // 5-byte process unique
    buffer[4] = PROCESS_UNIQUE[0]
    buffer[5] = PROCESS_UNIQUE[1]
    buffer[6] = PROCESS_UNIQUE[2]
    buffer[7] = PROCESS_UNIQUE[3]
    buffer[8] = PROCESS_UNIQUE[4]

    // 3-byte counter
    buffer[11] = inc & 0xff
    buffer[10] = (inc >> 8) & 0xff
    buffer[9] = (inc >> 16) & 0xff

    return buffer
  }

  /**
   * Converts the id into a 24 character hex string for printing, unless encoding is provided.
   * @param encoding - hex or base64
   */
  toString(encoding?: 'hex' | 'base64'): string {
    // Is the id a buffer then use the buffer toString method to return the format
    if (encoding === 'base64') return ByteUtils.toBase64(this.id)
    if (encoding === 'hex') return this.toHexString()
    return this.toHexString()
  }

  /** Converts to its JSON the 24 character hex string representation. */
  toJSON(): string {
    return this.toHexString()
  }

  /**
   * Compares the equality of this ObjectId with `otherID`.
   *
   * @param otherId - ObjectId instance to compare against.
   */
  equals(otherId: string | ObjectId | ObjectIdLike): boolean {
    if (otherId === undefined || otherId === null) {
      return false
    }

    if (otherId instanceof ObjectId) {
      return this[kId][11] === otherId[kId][11] &&
        ByteUtils.equals(this[kId], otherId[kId])
    }

    if (
      typeof otherId === 'string' &&
      ObjectId.isValid(otherId) &&
      otherId.length === 12 &&
      isUint8Array(this.id)
    ) {
      return ByteUtils.equals(this.id, ByteUtils.fromISO88591(otherId))
    }

    if (
      typeof otherId === 'string' && ObjectId.isValid(otherId) &&
      otherId.length === 24
    ) {
      return otherId.toLowerCase() === this.toHexString()
    }

    if (
      typeof otherId === 'string' && ObjectId.isValid(otherId) &&
      otherId.length === 12
    ) {
      return ByteUtils.equals(ByteUtils.fromUTF8(otherId), this.id)
    }

    if (
      typeof otherId === 'object' &&
      'toHexString' in otherId &&
      typeof otherId.toHexString === 'function'
    ) {
      const otherIdString = otherId.toHexString()
      const thisIdString = this.toHexString().toLowerCase()
      return typeof otherIdString === 'string' &&
        otherIdString.toLowerCase() === thisIdString
    }

    return false
  }

  /** Returns the generation date (accurate up to the second) that this ID was generated. */
  getTimestamp(): Date {
    const timestamp = new Date()
    const time = BSONDataView.fromUint8Array(this.id).getUint32(0, false)
    timestamp.setTime(Math.floor(time) * 1000)
    return timestamp
  }

  /** @internal */
  static createPk(): ObjectId {
    return new ObjectId()
  }

  /**
   * Creates an ObjectId from a second based number, with the rest of the ObjectId zeroed out. Used for comparisons or sorting the ObjectId.
   *
   * @param time - an integer number representing a number of seconds.
   */
  static createFromTime(time: number): ObjectId {
    const buffer = ByteUtils.fromNumberArray([
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ])
    // Encode time into first 4 bytes
    BSONDataView.fromUint8Array(buffer).setUint32(0, time, false)
    // Return the new objectId
    return new ObjectId(buffer)
  }

  /**
   * Creates an ObjectId from a hex string representation of an ObjectId.
   *
   * @param hexString - create a ObjectId from a passed in 24 character hexstring.
   */
  static createFromHexString(hexString: string): ObjectId {
    // Throw an error if it's not a valid setup
    if (
      typeof hexString === 'undefined' ||
      (hexString != null && hexString.length !== 24)
    ) {
      throw new Error(
        'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters',
      )
    }

    return new ObjectId(ByteUtils.fromHex(hexString))
  }

  /**
   * Checks if a value is a valid bson ObjectId
   *
   * @param id - ObjectId instance to validate.
   */
  static isValid(
    id: string | number | ObjectId | ObjectIdLike | Uint8Array,
  ): boolean {
    if (id == null) return false

    try {
      new ObjectId(id)
      return true
    } catch {
      return false
    }
  }

  /** @internal */
  toExtendedJSON(): ObjectIdExtended {
    if (this.toHexString) return { $oid: this.toHexString() }
    return { $oid: this.toString('hex') }
  }

  /** @internal */
  static fromExtendedJSON(doc: ObjectIdExtended): ObjectId {
    return new ObjectId(doc.$oid)
  }

  /**
   * Converts to a string representation of this Id.
   *
   * @returns return the 24 character hex string representation.
   * @internal
   */
  [Symbol.for('nodejs.util.inspect.custom')](): string {
    return this.inspect()
  }

  inspect(): string {
    return `new ObjectId("${this.toHexString()}")`
  }
}
