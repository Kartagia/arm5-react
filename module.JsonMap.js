import { isPojo } from "./module.utils.js";

/**
 * @template V1
 * A predicate testing a single value.
 * @callback Predicate
 * @param {V1} value1 The first tested value.
 * @returns {boolean} True, if and only if the given value 
 * passes the predicate.
 */

/**
 * @template V1, V2
 * A predicate testing a tuple of two values.
 * @callback BiPredicate
 * @param {V1} value1 The first tested value.
 * @param {V2} value2 The second tested value.
 * @returns {boolean} True, if and only if the given combination of values 
 * passes the predicate.
 */

/**
 * @template V1, V2, V3
 * A predicate testing three values.
 * @callback TriPredicate
 * @param {V1} value1 The first tested value.
 * @param {V2} value2 The second tested value.
 * @param {V3} value3 The third tested value.
 * @returns {boolean} True, if and only if the given combination of values 
 * passes the predicate.
 */

/**
 * The predicate always returning true.
 * @type {Predicate} TruePredicate
 * @returns {boolean} Always true.
 */
export const TruePredicate = () => (true);

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
   * Options for parsing JsonMap from JSON string.
   * 
   * @template TYPE
   * @typedef {Object} JsonParseOptions
   * @property {Function} [reviver] The reviver function used during parse.
   * @property {BiPredicate<string, TYPE>} [validator] The function validating key-value-pairs.
   * @property {Predicate<string>} [keyValidator] The function validating keys. 
   * @property {Predicate<TYPE>} [valueValidator] The function validating values.
   * @property {BiPredicate<string, TYPE>} [filter] The function filtering the key-value pairs.
   * @property {Predicate<string>} [keyFilter] The function selecting keys. 
   * @property {Predicate<TYPE>} [valueFilter] The function validating values. 
   * @property {boolean} [lenient=true] Is the parse lenient. Lenient parse
   * ignores invalid values instead of throwing exception.
    */

  /**
   * Create a JsonMap from a JSON object.
   * @template TYPE
   * @param {string} source JSON string representation of a JsonMap.
   * @param {JsonParseOptions<TYPE>} [options] The JSON parse options. 
   * @returns {JsonMap<TYPE>} The JsonMap created from the pojo.
   * @throws {SyntaxError} The JSON is invalid - the parse failed.
   * @throws {TypeError} The JSON did not represent a JSON object or array.
   */
  static fromJSON(source, options = {}) {
    const lenient = options.lenient == null ? true : options.lenient == true;
    /**
     * Filters entries by key.
     * @type {Predicate<string>}
     */
    const filterKey = options.keyFilter == null ? TruePredicate : options.keyFilter;
    /**
    * Filters entries by value.
    * @type {Predicate<TYPE>}
    */
    const filterValue = options.valueFilter == null ? TruePredicate : options.valueFilter;
    /**
     * Filters the entries using both key and value.
     * @type {BiPredicate<string,TYPE>}
     */
    const filterEntry = (options.filter == null ? TruePredicate : options.filter);
    /**
     * Validates entries by key.
     * @type {Predicate<string>}
     */
    const validKey = (options.keyValidator == null ? TruePredicate : options.keyValidator);
    /**
    * Validate entries by value.
    * @type {Predicate<TYPE>}
    */
    const validValue = (options.valueValidator == null ? (value) => (isJSONType(value)) : options.valueValidator);
    /**
     * Validates the entry using both key and value.
     * @type {BiPredicate<string,TYPE>}
     */
    const validEntry = (options.validator == null ? () => (true) : options.validator);

    // Generating filter function.
    const filter = (lenient ? (key, value) => (
      filterKey(key) && filterValue(value) && filterEntry(key, value) &&
      validKey(key) && validValue(value) && validValue(key, value)
    ) : (key, value) => (filterKey(key) && filterValue(value) && filterEntry(key, value)));
    const validator = (lenient ? () => (true) :
      (key, value) => (validKey(key) && validValue(value) && validEntry(key, value))
    );

    if (typeof source === "string") {
      const json = JSON.parse(source, options.reviver);
      if (json instanceof Array) {
        return new JsonMap(json.map((entry, index) => {
          if (entry instanceof Array && entry.length == 2) {
            // The entry is a map entry.
            return entry;
          } else if (lenient) {
            // Returning dummy filtered out in the next phase due non-string key.
            return [null, null];
          } else {
            // Error
            const cause = (json instanceof Array ? RangeError("Invalid array size") : TypeError("Entry is of invalid type"))
            throw RangeError("Invalid array entry at index " + index, { cause });
          }
        }).filter(([key, value]) => (filter(key, value))).map((entry) => {
          const [key, value] = entry;
          if (validator(key, value)) {
            return entry;
          } else {
            if (!validKey(key)) {
              throw new RangeError("Invalid key");
            } else if (!validValue(value)) {
              throw new RangeError("Invalid value");
            } else if (!validEntry(key, value)) {
              throw new RangeError("Invalid entry");
            }
          }
        }));
      } else if (json instanceof Object) {
        const entriesOptions = {
          lenient, validator, filter
        };
        return new JsonMap(this.entriesOf(json, entriesOptions));
      } else {
        // Invalid parse result.
        throw new TypeError("The source was not an array or object json");
      }
    } else {
      throw new TypeError("Cannot create map from non-string");
    }
  }

  /**
   * Get the dictionary value entries of the source.
   * @template VALUE the type of all values 
   * @param {Object} source The source object.
   * @param {BiPredicate<string, VALUE>} [filter] The filter filtering the key-value pairs before
   * validation. All values not accepted by the filter are ignored. Defaults to a filter accepting
   * only string keys and JSON type values. 
   * @param {BiPredicate<string, VALUE>} [validator] The validator validating key-value-pairs. 
   * @returns {Array<{0:string, 1:VALUE}>} The key-value-pairs of all own string property names.
   * @throws {TypeError} The type of the source is not an object.
   * @throws {RangeError} The operation is not lenient, and at least one of the filtered key-value pairs
   * did not pass the validator.
   */
  static entriesOf(source, {
    filter = (key, value) => (key.length > 0 && isJSONType(value)), validator = () => (true), lenient = true } = {}) {
    if (source instanceof Object && !(source instanceof Function)) {
      if (lenient) {
        // Lenient treats validator as an additional filter.
        const propertyNames = Object.getOwnPropertyNames(source);
        return propertyNames.map((key) => ([key, source[key]])).filter(
          ([key, value]) => (filter(key, value) && validator(key, value)));
      } else {
        // Non-lenient checks the validity of all filtered values, and throws exception, if  value is not valid.
        return Object.getOwnPropertyNames(source).map((key) => ([key, source[key]])).filter(
          ([key, value]) => (typeof key === "string" && filter(key, value))).map(
            ([key, value]) => {
              if (!validator(key, value)) {
                throw new RangeError("Invalid value or key");
              }
              return [key, source[key]];
            });
      }
    } else {
      throw new TypeError("Invalid source: Only objects are accepted");
    }
  }

  /**
   * Parse a JSON source.
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
      super(JsonMap.parseJsonSource(source));
    } else {
      super([...(source)]);
    }
  }

  /**
   * @inheritdoc
   * @throws {TypeError} Either value or key is invalid.
   */
  set(key, value) {
    if (this.validValue(key, value)) {
      super.set(key, value);
    } else if (this.validKey(key)) {
      throw TypeError("Invalid value")
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
    return this.validKey(key) && (!(typeof value === "bigint" || value instanceof Function))
  }

  /**
   * Convert the map entries to POJO.
   * @returns {Object}
   */
  toPOJO() {
    return Object.fromEntries([...this.entries()]);
  }

  /**
   * @inheritdoc
   */
  toJSON() {
    return JSON.stringify(this.toPOJO())
  }
}