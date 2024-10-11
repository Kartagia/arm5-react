
/**
 * Module containing utilities.
 * @module utils
 */

/**
 * The comparison result.
 * - 0, if compared was equal to comparee.
 * - 1, if compared was greater than comparee.
 * - -1, if compared was less than comparee.
 * - undefined, if compared and comparee were not comparable.
 * @typedef {-1|0|1|undefined} ComparisonResult
 */


/**
 * Comparator compares values of a type.
 * @template TYPE The compared value.
 * @callback Comparator
 * @param {TYPE} compared The compared value.
 * @param {TYPE} comparee The value compared with.
 * @returns {ComparisonResult} The comparison result.
 */


/**
 * The default compare using operator <, > and === (or == if not strict)
 * @template [TYPE=any] The type of the compared values.
 * @param {TYPE} compared The compared value.
 * @param {TYPE} compare The value comparee with.
 * @param {boolean} [strict=true] Is the comparison strict or loose. A strict
 * comparison use strict equality and loose uses loose equality.
 * @returns {ComparisonResult} The comparison result.
 */
export function defaultCompare(compared, compare, strict = true) {
  return(compared < compare ? -1 : compared > compare ?  1 : (
    strict ? compared === compare : compared == compare
  ) ? 0 : undefined);
}

/**
 * Compare two values.
 * @template TYPE The compared value type.
 * @param {TYPE} compared The compared value.
 * @param {TYPE} comparee The value compared with.
 * @param {Comparator<TYPE>} [comparator] The comparator.
 * @returns {ComparisonResult} The comparison result.
 */
export function compare(compared, comparee, comparator = defaultCompare) {
  return comparator(compared, comparee);
}


/**
 * Convert the lower case word into title case.
 * @param {string} word The word, whose first character is converted to upper case.
 * @returns {string} The given string with first character changed to upper case.
 * @todo Unicode support - works only on Main Language Plane at the moment.
 */
export function ucFirst(word) {
  const target = (typeof word === "string" ? word : ""+word);
  if (target) {
    return `${target.substring(0,1).toLocaleUpperCase()}${target.substring(1)}`;
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
                  throw new TypeError("Invalid key - Invalid sub key")
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

export function isPojo(value) {
  return typeof value === "object" && value.constructor.name === "Object";
}

export default { ucFirst,
composeId, decomposeId,
escapeId, unescapeId, isPojo };
/**
 * The day of year.
 * @typedef {Object} DayOfYear
 * @property {Year} year The year into which the day belongs.
 * @property {number|Day} dayOfYear The day of year.
 */
/**
 * The temporal value representing a day.
 * @typedef {Object} Day
 * @property {number} day The day value. Starts with 1.
 * @property {() => number} valueOf The value of the day.
 * @property {( mode = undefined ) => string} toString The string representation of the
 * day.
 */
/**
 * Get the body of a numbers between 12 and 20 and tens between 20 and 100.
 * @param {2|3|4|5|6|7|8|9} value The number of tens.
 * @return {string} The number of tens as text.
 */

export function tensAsTextBody(value) {
  switch (value) {
    case 1:
      return undefined;
    case 2:
      return "twent";
    case 3:
      return "thirt";
    case 4:
      return "fourt";
    case 5:
      return "fift";
    case 6:
      return "sixt";
    case 7:
      return "sevent";
    case 8:
      return "eight";
    case 9:
      return "ninet";
    default:
      throw new SyntaxError("Not a valid number of tens");
  }
}
/**
 * Get tens as text body. 
 * @param {1|2|3|4|5|6|7|8|9} value The number of tens.
 * @return {string} The number of tens as text.
 */
export function tensAsText(value) {
  return (value === 1 ? "ten" : `${tensAsTextBody(value)}y`);
}
/**
 * Tens as ordinal text.
 * @param {1|2|3|4|5|6|7|8|9} value The number of tens.
 * @return {string} The number of tens as ordinal text.
 */
export function tensAsOrdinal(value) {
  return (value === 1 ? "tenth" : `${tensAsTextBody(value)}ieth`);
}

/**
 * Convert an integer number into text.
 * @param {number} value An integer value converted to text.
 * @returns {string} The string containing the text representation of the given
 * integer.
 * @throws {SyntaxError} The given value is not a safe integer.
 */
export function numberAsText(value) {
  if (!Number.isSafeInteger(value)) {
    throw new SyntaxError("Value is not a number");
  } else if (value === 0) {
    return "zero";
  } else if (value < 0) {
    return `minus ${numberAsText(-value)}`;
  } else if (value < 100) {
    // Handling the situation with less than 100. 
    if (value < 20) {
      if (value <= 10) {
        switch (value) {
          case 1: return "one";
          case 2: return "two";
          case 3: return "three";
          case 4: return "four";
          case 5: return "five";
          case 6: return "six";
          case 7: return "seven";
          case 8: return "eight";
          case 9: return "nine";
          case 10: return "ten";
        }
      } else {
        switch (value % 10) {
          case 1: return "eleven";
          case 2: return "twelve";
          default:
            return `${tensAsText(value % 10)}een`;
        }
      }
    } else {
      const tens = Math.floor(value / 10);
      const ones = value % 10;
      return `${tensAsText(tens)}${ones === 0 ? "" : `-${numberAsText(ones)}`}`;
    }
  }
  const magnitude = [null, null, "hundred", "thousand", null, null, "million", null, null, "billion", null, null, "trillion",
    null, null, "quadrillion", null, null, "quintillion", null, null, "sextillion", null, null, "septillion", null, null,
    "octillion", null, null, "nonillion"
  ];
  var magnitudeIndex = 0;
  var significantValue = value;
  // The length of the significant number in digits.
  const signifacantLength = Math.ceil(Math.log(significantValue) / Math.log(10));
  while (value % 10 === 0) {
    magnitudeIndex++;
    significantValue = significantValue / 10;
  }
  while (magnitudeIndex > 0 && magnitude[magnitudeIndex] === null) {
    magnitudeIndex--;
    significantValue *= 10;
  }

  var segments = [];
  if (magnitude[magnitudeIndex] !== null) {
    segments.push(magnitude[magnitudeIndex]);
  }
  while (significantValue > 0) {

    var endMagnitudeIndex = magnitudeIndex + 1;
    var remainder = 0;
    while (endMagnitudeIndex < signifacantLength && endMagnitudeIndex < magnitude.length &&
      magnitude[endMagnitudeIndex] === null) {
      remainder = remainder * 10 + significantValue % 10;
      significantValue = significantValue / 10;
      endMagnitudeIndex++;
    }
    // Remainder contains the number converted to text.
    segments.unshirt(numberAsText(remainder), magnitude[magnitudeIndex]);
    magnitudeIndex = endMagnitudeIndex;
  }
  return segments.join(" ");
}

/**
 * Convert an integer into an ordinal text.
 * @param {number} value The integer value converted to ordinal. 
 * @returns {string} The given value as text ordinal.
 */
export function numberAsOrdinalText(value) {
  if (!Number.isSafeInteger(value)) {
    throw new SyntaxError("Value is not a number");
  }

  const lastTwoDigits = value % 100;
  if (lastTwoDigits === 0) {
    if (value > 0) {
      return `${numberAsText(value)}th`;
    } else {
      return `zeroeth`;
    }
  } else if (lastTwoDigits === 1) {
    return `${value >= 100 ? numberAsText(Math.floor(value/100)*100): ""}${"first"}`;
  } else if (lastTwoDigits === 2) {
    return `${value >= 100 ? numberAsText(Math.floor(value/100)*100): ""}${"second"}`;
  } else if (lastTwoDigits === 3) {
    return `${value >= 100 ? numberAsText(Math.floor(value/100)*100): ""}${"third"}`;
  } else if (lastTwoDigits < 10) {
    return `${value >= 100 ? numberAsText(Math.floor(value/100)*100): ""}${tensAsTextBody(lastTwoDigits)}h`;
  } else if (lastTwoDigits >= 10 && lastTwoDigits < 20) {
    return `${value >= 100 ? numberAsText(Math.floor(value/100)*100): ""}${numberAsText(lastTwoDigits)}th`;
  } else {
    const lastDigit = value % 10;
    if (lastDigit > 0) {
      const tens = Math.floor(lastTwoDigits / 10);
      return `${value >= 100 ? numberAsText(Math.floor(value/100)*100): ""}${tensAsText(tens)}-${numberAsOrdinalText(lastDigit)}`;
    } else {
      return `${value >= 100 ? numberAsText(Math.floor(value/100)*100): ""}${tensAsOrdinal(lastTwoDigits)}ieth`;
    }
  }
}
