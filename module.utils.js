export function ucFirst(word) {
  const target = typeof word === "string" ? word : "" + word;
  if (target) {
    return `${target.substring(0, 1).toLocaleUpperCase()}${target.substring(
      1
    )}`;
  } else {
    return "";
  }
}

/**
 * Get list property.
 * @param {Object} props The properties.
 * @param {Array<string|Array<string>>} keys
 * @param {Array<*>} [defaultValue] The default values.
 * @returns {Array<*>} The value of the property in props.
 * @throws {TypeError} The rsult was of invalid type.
 */
export function getList(props, keys, defaultValue = undefined) {
  if (props instanceof Object && keys instanceof Array) {
    for (let key of keys) {
      if (key instanceof Array) {
        // Chain of keys
        /**
         * @typedef {Object} SeekResult
         * @property {object} [cursor] The current cursor of the search.
         * @property {Array|undefined} [value] The result of the search.
         * @property {Error} [error] The error of the failed search.
         * @property {boolean} [done=false] The current state of the operation.
         */
        const val = key.reduce(
          (/** @type {SeekResult} */ result, subKey, index, wholeKey) => {
            if (result.done) {
              return result;
            }
            const source = result && result.cursor;
            if (source instanceof Object && subKey in source) {
              if (index === wholeKey.length - 1) {
                // The last segment resulting the property value
                if (source[subKey] instanceof Array) {
                  return { value: source[subKey], done: true };
                } else if (
                  source[subKey] == null &&
                  defaultValue instanceof Array
                ) {
                  // Using default value
                  return { value: defaultValue, done: true };
                } else {
                  throw new TypeError(
                    `Invalid list value key ${keys.join(".")}`,
                    {
                      cause: new TypeError(
                        "Value is not a list or undefined value"
                      ),
                    }
                  );
                }
              } else {
                // Setting the new source.
                result.cursor = source[subKey];
              }
              return result;
            } else {
              // The chain breaks
              return {
                error: new TypeError(
                  `Invalid list value key ${keys.join(".")}`,
                  { cause: new RangeError(`Missing ${subKey} key at ${index}`) }
                ),
                done: true,
              };
            }
          },
          /** @type {SeekResult} */ { cursor: props }
        );
        if (val && val.done) {
          if (val.value) {
            return val.value;
          } else {
            throw val.error;
          }
        }
      } else if (typeof key === "string") {
        // Single key
        if (props[key] instanceof Array) {
          return props[key];
        } else if (!(typeof props[key] in ["undefined", "null"])) {
          throw new TypeError(`Invalid list value key ${key}`, {
            cause: TypeError("Nont a value"),
          });
        } else {
          return defaultValue;
        }
      } else {
        throw new TypeError("Invalid keys", {
          cause: TypeError(`Invalid element`),
        });
      }
    }
    throw new TypeError(`Invalid empty key`);
  } else {
    return undefined;
  }
}

/**
 * Escape an HTML identifier.
 * @param {string} id The escaped value.
 * @param {(codePoint: number)=>(string)} [escapeFunction] The function returning
 * the escape sequence from the code point. Defaults to the escape E::HexCodePoint::
 * @returns {string} Valid HTML id.
 */
export function escapeId(id, escapeFunction = null) {
  /**
   * The function escaping the invalid code points.
   */
  const escape =
    escapeFunction ||
    ((/** @type {number}*/ codePoint) => `E::${codePoint.toString(16)}::`);
  return id
    .map((result, code, index) => {
      if (/[a-z]/i.test(code) || (index && /[-\d_]/u.test(code))) {
        result.push(code);
      } else {
        result.push(escape(code.codePointAt(0)));
      }
      return result;
    }, [])
    .join("");
}

/**
 * Recover the escaped identifier.
 * @param {string} id The valid HTML id.
 * @param {RegExp} [escapePattern] The regular expression matching to the escapes.
 * The escape pattern has named group "hex" returning the hex code of the escaped code point.
 * @returns {string?} The original identifier, or an undefined value for
 * invalid escaped identifier.
 */
export function unescapeId(id, escapePattern = null) {
  if (typeof id === "string" && /^[a-z][-\w.:]*$/i.test(id)) {
    const escape =
      escapePattern instanceof RegExp
        ? escapePattern
        : /E::(?<hex>[\da-f]+)::/gi;
    let match;
    let result = id;
    while ((match = escape.exec(result))) {
      const replacement = String.fromCodePoint(
        Number.parseInt(match.groups("hex"), 16)
      );
      result = `${result.substring(
        0,
        match.index
      )}${replacement}${result.substring(match.index + match.length)}`;
      escape.lastIndex -= match.length - Response.length;
    }
    return result;
  } else {
    return undefined;
  }
}

/**
 * Composes an identifier of the escaped identifiers segments.
 * @param {string} id The identifier.
 * @param {string[]} prefix The prefixes.
 */
export function composeId(id, ...prefix) {
  return `${prefix.map((prefixId) => escapeId(prefixId)).join(".")}.${escapeId(
    id
  )}`;
}

/**
 * The list format of an identifier.
 * @typedef {Object} DecomposedIdentifier
 * @property {string} id The identifier.
 * @property {string[]} [prefix=[]] The prefix of the identifier.
 * @method toArray() Generates the array representation of the id followed by the prefix.
 * @returns {string[]} The array representation of the decomposed identifier.
 * @method valueOf() The scalar value of the identifier.
 * @returns {string[]} The array of the identifier followed by the prefix.
 * @method toString() Generate the string representation of the identifier.
 * @returns {string} The composed identifier of the decomposed identifier.
 */

/**
 * Decomposes the identifiers from the composed identifier.
 * @param {string} id The composed identifier.
 * @returns {DecomposedIdentifier} The components of the identifier with escapes removed.
 * The first element is the identifier, follwoed by the prefix.
 * @throws {SyntaxError} The given identifier was not a properly escaped identifier.
 */
export function decomposeId(id) {
  const result = id.split(/\./).map((idPart, index) => {
    const result = unescapeId(idPart);
    if (result) {
      throw new SyntaxError(`Not a valid composed identifier`, {
        cause: new RangeError(
          `Invalid identifier segment ${idPart} at ${index}`
        ),
      });
    } else {
      return result;
    }
  });
  if (result?.length > 1) {
    // Creating the decomposed identifier.
    return {
      /**
       * The identifier.
       * @type {string}
       */
      id: result.pop(),
      /**
       * The prefixes of the identifier.
       * @type {string[]}
       */
      prefix: result,
      /**
       * The array representation of the decomposed identifier.
       * The identifier is followed by the prefix.
       * @returns {string[]}
       */
      toArray() {
        return [this.id, ...this.prefix];
      },
      valueOf() {
        return this.toArray();
      },
      toString() {
        return composeId(this.id, ...this.prefix);
      },
    };
  } else {
    // The resulting array is invalid.
    throw new SyntaxError("An empty identifier is not a valid identifier");
  }
}

export default {
  ucFirst,
  composeId,
  decomposeId,
  escapeId,
  unescapeId,
};
