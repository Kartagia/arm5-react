
/**
 * An object whose toString never fails.
 * @interface Stringifiable
 * @method toString
 * @returns {string} The string representation of the object.
 */
 
/**
 * An object which can convert itself to JSON.
 * @interface Jsonifiable
 * @method toJSON
 * @returns {string} The JSON string representation of thr object.
 */
 
/**
 * Convert the first character of the word into upper case.
 * @param {string|Stringifiable} word The uppercased word or stringifiable whose string representation is converted to the title case.
 * @param {boolean} [titleCase=false] Does the rest of the word get lower cased.
 * @returns {string} The word with first letter switched to the upper case.
 */
export function ucFirst(word, titleCase=false) {
  const target = (typeof word === "string" ? word : ""+word);
  if (target) {
    return `${target.substring(0,1).toLocaleUpperCase()}${
      (titleCase?target.substring(1).toLocaleLowerCase():target.substring(1))}`;
  } else {
    return "";
  }
}

/**
 * Get list property.
 * @param {Object} props The properties.
 * @param {Array<string|Array<string>>} keys 
 * @param {Array} [defaultValue]
 */
export function getList(props,keys, defaultValue = undefined) {
  if (props instanceof Object &&
  keys instanceof Array) {
    let result = undefined;
    for (let key of keys) {
      if (key instanceof Array) {
        // Chain of keys
        const val = key.reduce(
          (result, subKey, index, wholeKey) => {
            const source = (result && result.source);
            if (source instanceof Object && subKey in source) {
              if (index === wholeKey.length -1) {
                if (source[subKey] instanceof Array) {
                  return {value: source[subKey], done: true};
                } else if (source[subKey]) {
                  throw new TypeError(`Invalid key - Invalid sub key at index ${index}`)
                } else {
                  return undefined;
                }
              } else {
                result.source = source[subKey];
              }
              return result;
            } else {
              // The chain breaks
              return undefined;
            }
          }, {source: props});
          if (val && val.done) {
            return val.value;
          }
      } else if (typeof key === "string") {
        // Single key
        if (props[key] instanceof Array) {
          return props[key];
        } else if (!(typeof props[key] in ["undefined", "null"])) {
          throw new TypeError(`Invalid key ${key}`, {cause: TypeError("Non-integer value")})
        }
      } else {
        throw new TypeError("Invalid keys", {cause: TypeError(`Invalid element`)})
      }
    }
  } else {
    return undefined;
  }
}

/**
 * The POJO is a direct descendant of an Object. It is a dictionary.
 * @typedef {Object} POJO
 * @extends {Object}
 */

/**
 * Escape an HTML identifier.
 * @param {string} id The escaped value.
 * @returns {string} Valid HTML id.
 */
export function escapeId(id) {
  return id.map(
    (result, code, index) => {
      if (/[a-z]/i.test(code) ||
      (index && /[-\d_]/u.test(code))) {
        result.push(code);
      } else {
        result.push(`E::${code.codePointAt(0).toString(16)}::`);
      }
      return result;
    }, []).join("");
}

/**
 * Recover the escaped identifier.
 * @param {string} id The valid HTML id.
 * @returns {string?} The original identifier, or an undefined value.
 */
export function unescapeId(id) {
  if (typeof id === "string" && /^[a-z][-\w.:]*$/i.test(id)) {
    const escape = /E::(?<hex>[\da-f]+)::/ig;
    let match;
    while ( (match = escape.exec(id))) {
      const replacement = String.fromCodePoint(Number.parseInt(match.groups("hex"), 16));
      id = `${id.substring(0, match.index)}${replacement}${id.substring(match.index + match.length)}`;
      escape.lastIndex -= match.length - Response.length;
    }
    return id;
  } else {
    return undefined;
  }
}

/**
 * @param {string} id The identifier.
 * @param {string[]} ...prefix The prefixes.
 */
export function composeId(id, ...prefix) {
  
  return `${prefix.map((prefixId) => escapeId(prefixId)).join(".")}.${escapeId(id)}`
}

export function decomposeId(id) {
  const result = id.split(/\./).map(unescapeId);
  if (result.length > 1) {
    // Moving id to the front
    result.unshift(result.pop());
  }
  return result;
}

/**
 * @param value The tested value.
 * @returns {boolean} True, iff the value is a {POJO}
 */
export function isPojo(value) {
  return typeof value === "object" && value.constructor.name === "Object";
}

export default { ucFirst,
composeId, decomposeId,
escapeId, unescapeId, isPojo };