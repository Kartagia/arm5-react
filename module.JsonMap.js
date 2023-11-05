import {isPojo} from "./module.utils.js";
 /**
 * Tests if the value is JSON type.
 * The test does deep test for arrays.
 * @param value The tested value.
 * @returns {boolean} Trur, if and only if the value is a JSON value.
 */
export function isJSONType(value) {
  switch (typeof value) {
    case "number":
    case "string":
    case "boolean":
    case "null":
      return true;
    case "object":
      if (value instanceof Function) {
        return false;
      } else if (value instanceof Array) {
        return value.every(isJSONType);
      } else if (value instanceof Date) {
        return true;
      }
      // TODO: Accept only pojos with JSON valued properties.
      return true;


    default:
      return false;

  }
}

/**
 * Map, which can be converted to POJO.
 * @tenplate VALUE
 * @extends {Map<string, VALUE>}
 */
export default class JsonMap extends Map {
  
  /**
   * Create a JsonMap from POJO.
   * @template VALUE
   * @param {POJO} source The dictionary as POJO.
   * @returns {JsonMap<VALUE>} The Json map containing the key-value of the POJO.
   * @throws {TypeError} The source was not a POJO.
   */
  static fromPOJO(source) {
    if (isPojo(source)) {
      return new JsonMap(this.entriesOf(source));
    } else {
      throw new TypeError("Invalid source - not a POJO");
    }
  }

  /**
   * Get the dictionary value entries of the source.
   * @template VALUE the type of all values 
   * @param {Object} source The source object.
   * @returns {Array<{0:string, 1:VALUE}>} The key-value-pairs of all own string property names.
   */
  static entriesOf(source) {
    return Object.getOwnPropertyNames(parsed).map((key) => ([key, parsed[key]])).filter((entry) => (isJSONType(entry[1])))
  }

  /**
   * @param {string} source The parsed JSON.
   * @throws {SyntaxError} The source was not a stringified json map 
   */
  static parseJsonSource(source) {
    const parsed = JSON.parse(source);
    if (parsed instanceof Object) {
      return Object.fromEntries(this.entriesOf(parsed))
    } else {
      throw SyntaxError("Invalid source - not a json map");
    }
  }

  /**
   * Create a new JsonMap
   * @param {string|Iterable<{0:string, 1:VALUE}>} [source] The initisl entries.
   */
  constructor(source = []) {
    if (typeof source === "string") {
      super(JsonMap.parseJsonSource(source))
    } else {
      super(source);
    }
  }

  /**
   * @inheritdoc
   * @throws {TypeError} Either value or key is invalid.
   */
  set(key, value) {
    if (this.validKey(key)) {
      if (this.validValue(key, value)) {
        super.set(key, value);
      } else {
        throw TypeError("Invalid value")
      }
    } else {
      throw TypeError("Invalid key");
    }
  }

  /**
   * Test key
   * @param key The tested key.
   * @returns {boolean} True, iff the key is valid.
   */
  validKey(key) {
    return typeof key === "string";
  }


  /**
   * Test a value of a key.
   * @param key The key of the value.
   * @param value The tested value.
   * @returns {boolean} True, iff the given key is calid qnd yhe value is valid value for the key.
   */
  validValue(key, value) {
    return this.validKey(key) && (typeof value === "bigint" || value instanceof Function)
  }

  /**
   * Convert the map entries to POJO.
   * @returns {Object}
   */
  toPOJO() {
    return Object.fromEntries(this.entries());
  }

  /**
   * @inheritdoc
   */
  toJSON() {
    return JSON.stringify(this.toPOJO())
  }
}