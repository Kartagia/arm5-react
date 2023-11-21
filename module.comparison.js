


/**
 * @module comparison
 * Module for comparison.
 */

/**
 * Predicate testa a value.
 * @template TYPE
 * @callback Predicate
 * @param {TYPE} value - The tested value.
 * @returns {boolean} True, if and only if the value passes the predicate.
 */

/**
 * A detailed predicate is a predicate with more detailed result. The detailed
 * predicate functions just like a predicate as null and undefined are considered
 * false, but allows recipient to determine the cause of the failure.
 * @template TYPE
 * @callback DetailedPredicate
 * @param {TYPE} value - The tested value.
 * @returns {boolean|null|undefined} True, if and only if the value passes the
 * predicate.
 * - If the value was invalid, a null is returend.
 * - If the test was not performed, returns an undefined value.
 * - If the value was valid, but did not pass the predicate, a false is returned.
 */

/**
 * The comparison result is an error.
 * @typedef {null} ErroneousComparisonResult
 */

/**
 * The undefined comparison result.
 * @typedef {undefined} UndefinedComparisonResult comparison results for
 * the case comparison is not udefiend.
 */

/**
 * The comparison result.
 * - An undefined value indicates the comparison was undefined.
 * - A null value indicates that the comparison failed due an error.
 * - A negative ingeger means the compared was less than the comparee.
 * - A zero means the compared equal to the comparee.
 * - A positivive integer means the compared was greater than comparee.
 * @typedef {CompareResult|ErroneousComparisonResult|UndefinedComparisonResult} ComparisonResult
 */

/**
 * A compare result. 
 * - Compare result < 0, if If compared was less than comparee.
 * - Compare result > 0, if compared was greater than comparee. 
 * - Compare result === 0, if compared was equal to the comparee.
 * @typedef {number} CompareResult
 * 
 */

/**
 * Compare function comparing compared with comparee.
 * Any {@ink Error} is thrown if the comparison is not possible. 
 * @template TYPE
 * @callback CompareFunction
 * @param {TYPE} compared The compared value.
 * @param {TYPE} comparee The value copmared with.
 * @returns {CompareResult} The compare result.
 * @throws {Error} The comparison was not possible
 */

/**
 * Comparator with ability to inform that the comparison is not possible, or that the
 * compared values were invalid.
 * @template TYPE
 * @callback Comparator
 * @param {TYPE} compared The compared value.
 * @param {TYPE} comparee The value compared with.
 * @returns {ComparisonResult} If the compared is less than comparee, returns
 * a negative value. If compared is greater than the comparee, returns positive integer.
 * If compared is equal to the comparee, returns 0.
 * If the comparison is not possible, returns an undefined
 * value. If either compared or comparee is invalid, returns null. 
 */

/**
 * Is the comparion result undefined.
 * @param {ComparisonResult} a The comparison result.
 * @returns {boolean} True, if and only if the comparison result indicates
 * no comparison could be made.
 */
export const isUndefined = (a) => {
  return a === undefined;
}

/**
 * Is the comparion result invalid. 
 * @param {ComparisonResult} a The comparison result.
 * @returns {boolean} True, if and only if the comparison result indicates
 * an invalid compared value.
 */
export const isInvalid = (a) => {
  return a == null;
}

/**
 * Is the comparison result erroneous.
 * @param {ComparisonResult} a The comparison result.
 * @returns {boolean} True, if and only if the comparison result indicates an
 * error during comparison.
 */
export const isErroneous = (a) => {
  return a === null;
}

/**
 * Test validity of the comparison result.
 * The comparison result is valid only if the comparison has defined result.
 * @param {ComparisonResult} a The comparison result 
 * @returns {boolean} True, if and only if the comparison result is valid.
 */
export const isValid = (a) => {
  return a != null;
}

/**
 * Test the comparison result, and throw exception, if it is invalid.
 * @param {ComparisonResult} a The tested comparison result.
 * @returns {CompareResult} The comparison result.
 * @throws {RangeError} An erroneous comparison.
 * @throws {TypeError}  An undefined compariosn.
 */
export const checkResult = (a) => {
  if (isInvalid(a)) {
    throw new RangeError("Invalid comparison participant");
  } else if (isUndefined(a)) {
    throw new TypeError("The comparison is undefined");
  } else {
    return a;
  }
}

/**
 * Test, if the comparison result indicates compared is greater than comparee.
 * @param {ComparisonResult} a The comparison result. 
 * @param {boolean} [throwException=false] Does the comparison test trigger
 * exception tossing. 
 * @returns {boolean|ErroneousComparisonResult|UndefinedComparisonResult} True, if and only if the given comparison
 * result means the compared was greater than comparee.
 * An undefined value indicates an undefiend comparison without exception throwing.
 * A null value indicates an erronoeus comparison withnout exception throwing.
 * @throws {RangeError} An erroneous comparison, and exceptions are tossed..
 * @throws {TYpeError}  An undefined compariosn, and exceptiosn are tossed.
 */
export const greater = (a, throwException) => {
  if (throwException) {
    return checkResult(a) > 0;
  } else {
    return isValid(a) ? a > 0 : a;
  }
}

/**
 * Test, if the comparison result indicates compared is lesser than comparee.
 * @param {ComparisonResult} a The comparison result. 
 * @param {boolean} [throwException=false] Does the comparison test trigger
 * exception tossing. 
 * @returns {boolean|UndefinedComparisonResult|ErroneousComparisonResult} True, if and only if the given comparison
 * result means the compared was lesser than comparee. 
 * An undefined value indicates an undefiend comparison without exception throwing.
 * A null value indicates an erronoeus comparison withnout exception throwing.
 * @throws {RangeError} An erroneous comparison, and exceptions are tossed..
 * @throws {TypeError}  An undefined compariosn, and exceptiosn are tossed.
 */
export const lesser = (a, throwException = false) => {
  if (throwException) {
    return checkResult(a) < 0;
  } else {
    return isValid(a) ? a < 0 : a;
  }
}
/**
 * Test, if the comparison result indicates that the compared was greater than,
 * or equal to the comparee.
 * @param {ComparisonResult} a The comparison result. 
 * @param {boolean} [throwException=false] Does the comparison test trigger
 * exception tossing. 
 * @returns {boolean|undefined|null} True, if and only if the given comparison
 * result means the compared was greater than or equal to comparee.
 * An undefined value indicates an undefiend comparison without exception throwing.
 * A null value indicates an erronoeus comparison withnout exception throwing.
 * @throws {RangeError} An erroneous comparison, and exceptions are tossed..
 * @throws {TypeError}  An undefined compariosn, and exceptiosn are tossed.
 */
export const greaterOrEqual = (a, throwException = false) => {
  if (throwException) {
    return checkResult(a) >= 0;
  } else {
    return isValid(a) ? a >= 0 : a;
  }
}

/**
 * Test, if the comparison result indicates that the compared was lesser than,
 * or equal to the comparee.
 * @param {ComparisonResult} a The comparison result. 
 * @param {boolean} [throwException=false] Does the comparison test trigger
 * exception tossing. 
 * @returns {boolean|UndefinedComparisonResult|ErroneousComparisonResult} True, if and only if the given comparison
 * result means the compared was lesser than or equal to comparee.
 * An undefined value indicates an undefiend comparison without exception throwing.
 * A null value indicates an erronoeus comparison withnout exception throwing.
 * @throws {RangeError} An erroneous comparison, and exceptions are tossed..
 * @throws {TypeError}  An undefined compariosn, and exceptiosn are tossed.
 */
export const lesserOrEqual = (a, throwException = false) => {
  if (throwException) {
    return checkResult(a) <= 0;
  } else {
    return isValid(a) ? a <= 0 : a;
  }
}


/**
 * Test, if the value is undefined.
 * @param {any} v The tested value.
 * @returns {boolean} True, if and only if the value is undefined.
 */
export const isUndefinedValue = (v) => (v === undefined);
/**
 * Test, if the value is null.
 * @param {any} v The tested value.
 * @returns {boolean} True, if and only if the value is null.
 */
export const isNullValue = (v) => (v === null);

/**
 * Test whether valeu is defined.
 * @param {any} v The tested value. 
 * @returns {boolean} True, if and only if the v is defined.
 */
export const isDefinedValue = (v) => (v != null);

/**
 * Create a new comparison. A comparison is a class 
 * @constructor
 * @template TYPE - The compared value type.
 * @param {Comparator<TYPE>|CompareFunction} comparator The comparator performing the comparison. 
 * @param {boolean} [allowNullValues=false] Does the comparison function accept null values.
 * @param {boolean} [allowUndefinedValues=false] Does the comparison funciton accept undefined values.
 * @param {Predicate<TYPE>} [validValue] The function returning true if an only if the value is valid.
 * Defaults to a function always reaturning true. This function is only called with allows null values
 * if null values are allowed, and undefined values if undefined values are allowed.
 */
export function Comparison(comparator, allowNullValues = false, allowUndefinedValues = false,
  validValue = null) {

  return {
    comparator,
    allowNullValues,
    allowUndefinedValues,
    validValue,
    compare(a, b) {
      try {
        if ((!(this.allowNullValues) && (a === null || b === null)) ||
          (!(this.allowUndefinedValues) && (a === null || b === null))) {
          // Null or undefined value is not accepted, and the comparison is undefined.
          return undefined;
        } else if (this.validValue == null || (this.validValue(a) && this.validValue(b))) {
          return this.comparator(a, b);
        } else {
          return null;
        }
      } catch (error) {
        return null;
      }
    },
    reverse() {
      return {
        ...this,
        comparator: (a, b) => (this.comparator(b, a))
      };
    },
    nullsFirst() {
      return {
        ...this,
        comparator: passingFirst(this.comparator, isNullValue)
      }
    },
    nullsLast() {
      return {
        ...this,
        comparator: passingLast(this.comparator, isNullValue)
      }
    },
    undefinedFirst() {
      return {
        ...this,
        comparator: passingFirst(this.comparator, isUndefinedValue)
      }
    },
    undefinedLast() {
      return {
        ...this,
        comparator: passingLast(this.comparator, isUndefinedValue)
      }
    }
  };
}


/**
 * Derive a comparator with undefined values less than any any defined value.
 * @param {Comparator<TYPE>|CompareFunction} comparator The comparator function.
 * @returns {Comparator<TYPE>} The comparator function comparing only defined values with the comparator,
 * and with undefined values less than any defined value.
 */
export function undefinedFirst(comparator) {
  return passingFirst(comparator, isUndefinedValue);
}

/**
 * Derive a comparator with undefined values greater than any any defined value.
 * @param {Comparator<TYPE>|CompareFunction} comparator The comparator function.
 * @returns {Comparator<TYPE>} The comparator function comparing only defined values with the comparator,
 * and with defined values greater than any undefined value.
 */
export function undefinedLast(comparator) {
  return passingLast(comparator, isUndefinedValue);
}



/**
 * Derive a comparator with null values less than any any non-null value.
 * @param {Comparator<TYPE>|CompareFunction} comparator The comparator function.
 * @returns {Comparator<TYPE>} The comparator function comparing only non-null values with the comparator,
 * and with null values less than any non-null value.
 */
export function nullsFirst(comparator) {
  return passingFirst(comparator, isNullValue);
}

/**
 * Derive a comparator with null values greater than any any non-null value.
 * @param {Comparator<TYPE>|CompareFunction} comparator The comparator function.
 * @returns {Comparator<TYPE>} The comparator function comparing only non-null values with the comparator,
 * and with null values greater than any non-null value.
 */
export function nullsLast(comparator) {
  return passingLast(comparator, isNullValue);
}

/**
 * Derive a comparator only comparing values passing a predicate.
 * @param {Comparator<TYPE>|CompareFunction} comparator The comparator function.
 * @param {Predicate<TYPE>} predicate The predicate testing which values are comparable.
 * @returns {Comparator<TYPE>} The comparator function comparing only values passing the predicate
 * with the comparator.
 */
export function validatePassing(comparator, predicate) {
  return (a, b) => (predicate(a) && predicate(b) ? comparator(a, b) : undefined);
}


/**
 * Derive a comparator only comparing values not passing a predicate.
 * @param {Comparator<TYPE>|CompareFunction} comparator The comparator function.
 * @param {Predicate<TYPE>} predicate The predicate testing which values are not comparable.
 * @returns {Comparator<TYPE>} The comparator function comparing only values not passing the predicate
 * with the comparator.
 */
export function invalidatePassing(comparator, predicate) {
  return (a, b) => (predicate(a) || predicate(b) ? undefined : comparator(a, b));
}

/**
 * Derive a comparator with all values passing a predicate before any other valeus. 
 * @param {Comparator<TYPE>|CompareFunction} comparator The comparator function.
 * @param {Predicate<TYPE>} predicate The predicate testing which values are less than any other value and
 * equal to each other.
 * @returns {Comparator<TYPE>} The comparator function comparing only values not passing the predicate
 * with the comparator. Values passing the predicate are less than any value not passing the predicate, and
 * equal to each otehr.
 */
export function passingFirst(comparator, predicate) {
  return (a, b) => (predicate(a) ? (predicate(b) ? 0 : -1) : predicate(b) ? 1 : comparator(a, b));
}

/**
 * Derive a comparator with all values passing a predicate after any other valeus. 
 * @param {Comparator<TYPE>|CompareFunction} comparator The comparator function.
 * @param {Predicate<TYPE>} predicate The predicate testing which values are greater than any other value and
 * equal to each other.
 * @returns {Comparator<TYPE>} The comparator function comparing only values not passing the predicate
 * with the comparator. Values passing the predicate are greater than any value not passing the predicate, and
 * equal to each otehr.
 */
export function passingLast(comparator, predicate) {
  return (a, b) => (predicate(a) ? (predicate(b) ? 0 : 1) : predicate(b) ? -1 : comparator(a, b));
}

/**
 * Create a reverse comparator.
 * @param {Comparator<TYPE>|CompareFunction} comparator The comparator function.
 * @returns {Comparator<TYPE>} The comaprator performing the opposite order than the given comparator.
 */
export function reverse(comparator) {
  return (a, b) => (comparator(b, a));
}


/**
 * Generic comparator using the default < and > operators tor determine the comparison.
 * A value which is neither lesser nor greater than the compared value is considered equal value.
 * @param {any} compared The compared value.
 * @param {any} comparee The value compared with. 
 * @returns {ComparisonResult} The comparison result.
 */
export const GENERIC_COMPARATOR = (compared, comparee) => {
  try {
    return (comparee == null || compared == null ? undefined : compared < comparee ? -1 : compared > comparee ? 1 : 0)
  } catch (error) {
    // Either compared or comparee was invalid.
    return null;
  }
};

/**
 * Get smallest of the values.
 * @template TYPE - The type of the tested values.
 * @param {Comparator<TYPE>} comparator - The comparator used for comparison.
 * @param {TYPE[]} values - The compared values.
 * @param  {TYPE|undefined|null} - The smallest of the values, if all values were comparable.
 * - An undefined value, if any of the values made comparison undeifned, or the values was empty. 
 * - A null, if any comparison was erroneous. 
 */
export function minimal(comparator, ...values) {
  return values.reduce((result, value) => {
    if (result.length === 0) {
      return [value];
    } else if (isErroneous(result) || isUndefined(result)) {
      // Error is propagating.
      return result;
    }

    const cmp = comparator(result[0], value);
    if (isErroneous(cmp) || isUndefined(cmp)) {
      return cmp;
    } else if (greater(cmp)) {
      return [value];
    } else {
      return result;
    }
  }, []).map((result) => (result == null ? result : (result.length === 0 ? undefined : result[0])));
}

/**
 * Get largest of the values.
 * @template TYPE - The type of the tested values.
 * @param {Comparator<TYPE>} comparator - The comparator used for comparison.
 * @param {TYPE[]} values - The compared values.
 * @param  {TYPE|undefined|null} - The largest of the values, if all values were comparable.
 * - An undefined value, if any of the values made comparison undeifned, or the values was empty. 
 * - A null, if any comparison was erroneous. 
 */
export function maximal(comparator, ...values) {
  return values.reduce((result, value) => {
    if (result.length === 0) {
      return [value];
    } else if (isErroneous(result) || isUndefined(result)) {
      // Error is propagating.
      return result;
    }

    const cmp = comparator(result[0], value);
    if (isErroneous(cmp) || isUndefined(cmp)) {
      return cmp;
    } else if (lesser(cmp)) {
      return [value];
    } else {
      return result;
    }
  }, []).map((result) => (result == null ? result : (result.length === 0 ? undefined : result[0])));
}


export default {
  isValid, isInvalid, isUndefined, checkResult, isNullValue, isUndefinedValue, isExistingValue: isDefinedValue,
  greater, greaterOrEqual, lesser, lesserOrEqual,
  minimal, maximal,
  nullsFirst, nullsLast, passingFirst, passingLast, validatePassing, invalidatePassing, reverse,
  GENERIC_COMPARATOR
}