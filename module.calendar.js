
import JsonMap from "./module.JsonMap.js";
import { Calendar } from "./module.calendar.common.js";
import {
  greater, isValid, lesser, lesserOrEqual, greaterOrEqual,
  minimal, maximal,
  GENERIC_COMPARATOR
} from "./module.comparison.js";

/**
 * @typedef {import("./module.boundary.virtual.js").Boundary} Boundary
 */

// import { JulianCalendar } from "./module.calendar.julian.js";

/**
 * @namespace calendar
 * 
 * @module Calendar
 * @description Module handling Calendars and times. This is
 * similar to the expirimental Temporal, but as Temporal is not
 * usable in producetion, a temporary solution is rquired.
 */

/**
 * A function deriving a field value from a list of field values.
 * @callback FieldValueFunction
 * @param {number[]} values The field values the function is derived from.
 * @returns {number} The value of the field.
 * @throws {TypeError} The type or the number of the values was invalid.
 * @throws {RangeError} The field values were invalid. 
 */

/**
 * A fucntion deriving a field map from a list of field values. 
 * @callback FieldValueMapFunction
 * @param {number[]} values The feild values the value is derived from.
 * @returns {Map<string, number>} THe field value map.
*/

/**
 * A function converting a field map to a list of field values. The conversion
 * may derive the field values from the map.
 * @callback FieldMapToArrayFunction
 * @param {Map<string, (number|number[])>} valueMap The mapping from field names to field values.
 * @returns {number[]}} The resulting field value map.
 */

/**
 * A function 
 * @callback FieldMapOperation 
 * @param {Map<string, (number|number[])>} valueMap The mapping from field names to field values.
 * @returns {Map<string, nubmer>}} The resulting field value map.
 */

/**
 * An object determining a derivation of a function value.
 * @typedef {Object} FieldDerivation
 * @property {string[]} derivedFrom - The list of field names. This also determines
 * the number of requried parameter for the derive valeu function.
 * @property {string[]} prohibtedFields - Teh list of fields not allowed.
 * @property {FieldValueFunction} deriveValue - The function deriving the value of the field.
 */

/**
 * Test whether the given source fields, or fields of the given source field value map
 * is derivable from the derivation.
 * @param {FieldDerivation} derivation The derivation 
 * @param {Set<string>|Map<string, number>} sourceFields The source fields.
 * @returns {boolean} True, if and only if the derivation may derive value from the given source fields.
 */
export function derivableFrom(derivation, sourceFields) {
  if (validFieldDerivation(derivation)) {
    if (sourceFields instanceof Set || sourceFields instanceof Map) {
      if (derivation.derivedfrom.every((fieldName) => (sourceFields.has(fieldName)))
        || (derivation.prohibitedFields == null
          || derivation.prohibitedFields.some((fieldName) => (sourceFields.has(fieldName)))));
    } else {
      return false;
    }
  } else {
    return false;
  }
}

/**
 * Test validity of a field name.
 * @param {any} tested tested name. 
 * @returns {boolean} True, if and only if the given field name is valid.
 */
export function validFieldName(tested) {
  return typeof tested === "string" && tested.length > 0 && tested.trim() == tested;
}

/**
 * Test validity of a field value function.
 * @param {any} tested The tested function.
 * @returns {boolean} True, if and only if the given value is valid function.
 */
export function validFieldValueFunction(tested) {
  return tested instanceof Function;
}

/**
 * Test validity of hte field derivation.
 * @param {FieldDerivation} derivation The tested derivation.
 * @returns {boolean} True, if and only if the derivation is a valid derivation.
 */
export function validFieldDerivation(derivation) {
  return derivation instanceof Object &&
    derivation.derivedFrom instanceof Array && derivation.derivedFrom.every(validFieldName)
    && (derivation.requiredFields == null ||
      (derivation.requiredFields instanceof Array && derivation.requiredFields.every(validFieldName)))
    && validFieldValueFunction(derivation.deriveValue);
}

/**
 * Definition of an assinged field definition.
 * @typedef {Object} FieldDefinition_AssignedField 
 * @property {string} fieldName The field name. If not given, the definition uses the 
 * current field name.
 * @property {number} [minValue=1] The minimum value of the field.
 * @property {number} [maxValue] The maximum value of hte field.
 */

/**
 * Test validity of an assigneld field definition.
 * @param {Object} tested Tested field definition. 
 * @returns {boolean} True, if and only if the given feild definition is true.
 */
export function validAssignedFieldDefinition(tested) {
  return tested instanceof Object && validFieldName(tested.fieldName);
}

/**
 * Definition of a derived field.
 * @typedef {Object} FieldValueDefinition_CurrentFieldDerivedField
 * @property {string} fieldName The name of the derived field.
 * @property {FieldValueFunction} valueFunction The value function determining the
 * value from the current field value.
 */

/**
 * Definition of a derived field.
 * @typedef {Object} FieldDefinition_MapDerivedField
 * @property {string} [fieldName] The name of the derived field.
 * @property {number} [minValue=1] The smallest allowed value.
 * @property {number} [maxValue] The largest allowed value.
 * @property {(Map<string[], FieldValueFunction>)} derivedFrom The mapping
 * from field name sets to the deriving function taking the deriving fields. 
 */

/**
 * Definition of a derived field by using list of field derivations.
 * @typedef {Object} FieldDefinition_ArrayDerivedField
 * @property {string} [fieldName] The name of the derived field.
 * @property {number} [minValue=1] The smallest allowed value.
 * @property {number} [maxValue] The largest allowed value.
 * @property {(Array<FieldDerivation>)} derivedFrom The derivation by using
 * the given field derivations.
 */

/**
 * Test validity of the given feild definition.
 * @param {FieldDefinition} tested The tested field definition.
 * @returns {boolean} True, if and only if the given field is a derived field.
 */
function validDerivedFieldDefinition(tested) {
  return (tested instanceof Object &&
    (
      (tested.derivedFrom instanceof Map && [...(tested.derivedFrom.entries())].every(
        ([fieldNames, valueFunction]) => (
          (fieldNames instanceof Array && fieldNames.every(validFieldName)) &&
          (validFieldValueFunction(valueFunction)))))
      ||
      (tested.derivedFrom instanceof Array && tested.every(validFieldDerivation))
      ||
      (validFieldName(tested.fieldName) && validFieldValueFunction(tested.valueFunction))
    ));
}

/**
 * The definition of an assigned fields.
 * @typedef {FieldDefinition_AssignedField} AssignedFieldDefinition
 */

/**
 * Teh definitions of the derived field values.
 * @typedef {(FieldDefinition_AssignedField|
 * FieldValueDefinition_CurrentFieldDerivedField|FieldDefinition_ArrayDerivedField
 * |FieldDefinition_MapDerivedField)} DerivedFieldDefinition
 */

/**
 * The definition of a field. The field definition without field name defiens
 * a value construction option for the field.
 * @typedef {AssignedFieldDefinition|DerivedFieldDefinition} FieldDefinition
 */

/**
 * Test if hte field definition is a valid field definition.
 * @param {FieldDefinition} tested The field definition.
 * @returns {boolean} True, if and only if the given tested is not a valid feild defintion.
 */
export function validFieldDefinition(tested) {
  if (tested instanceof Object) {
    return ("derifedFrom" in tested ? validDerivedFieldDefinition(tested) : validAssignedFieldDefinition(tested));
  } else {
    return false;
  }
}

/**
 * Generates the field support object to be used as prototype. 
 * @param {FieldDefinition[]} fieldDefinitions...
 */
export function CalendarSupport(...fieldDefinitions) {
  const supportedFields = []; // The supported fields in the order.
  /**
   * The mapping from field list to the function determining the current field value.
   * @type {JsonMap<string[], FieldValueFunction>} 
   */
  const derivedFrom = new JsonMap();
  /**
   * The mapping from supported field names to the derivation of the field value.
   * @type {string[], FieldDerivation}
   */
  const supportedFieldMap = new JsonMap();
  [fieldDefinitions].filter((fieldDef) => (fieldDef != null && fieldDef instanceof Object)).forEach((fieldDef) => {
    if (fieldDef.fieldName) {
      // Subfield definition as the field has name.
      if (supportedFieldMap.has(fieldDef.fieldName)) {
        throw new RangeError("Duplicate field definition is not allowed!");
      }

      const adHocField = {
      };

      if (fieldDef.derivedFrom) {
        if (fieldDef.derivedFrom instanceof Array && fieldDef.derivedFrom.every(validFieldDerivation)) {
          fieldDef.derivedFrom.forEach((fieldDerivation) => {
            if (supportedFieldMap.has(fieldDerivation.derivedFrom)) {
              // The field already has derived field using given combination.
              throw new RangeError("Duplicate field derivaiton is not allowed!");
            } else if (fieldDef.deriveValue instanceof Function) {
              // The field may be supported.
              adHocField.derivedFrom = fieldDef.deriveFrom;
              adHocField.fieldValeuFunction = fieldDef.fieldValueFunction;
            } else {
              throw new TypeError("Invalid value funciton.")
            }
            // Field is not derived from any field value.
          })
        } else if (fieldDef.derivedFrom instanceof Map &&
          [...(fieldDef.derivedFrom.entries())].every(([fieldNames, valueFunction]) => (
            (fieldNames instanceof Array && fieldNames.every((fieldName) => (typeof fieldName === "string")))
            && valueFunction instanceof Function
          ))) {
          adHocField.fieldValeuMap.set()
        } else {
          // Invalid value.
          throw new TypeError("Invalid field definition - derived from neither map nor array");
        }
      }
      supportedFieldMap.set(fieldDef.fieldName, adHocField);
      supportedFields.push(fieldDef.fieldName);
    } else {
      // Construction definition for the current field as no field name is given.
      if (fieldDef.derivedFrom) {
        if (fieldDef.derivedFrom instanceof Array) {
          // Single field derivation.
          if (fieldDef.deriveFrom.every((field) => (typeof field === "string")) &&
            (fieldDef.dreiveFunction instanceof Function)) {
            derivedFrom.set(fieldDef.derivedFrom, fieldDef.deriveFunction);
          }
        } else if (fieldDef.derivedFrom instanceof Map) {
          [...(fieldDef.derivedFrom.entries())].filter(([fieldNames, deriveFunction]) => (
            (typeof fieldNames === "string"
              || (fieldNames instanceof Array && fieldNames.every((fieldName) => (typeof fieldName === "string"))
                && (deriveFunction instanceof Function)
              )
            ))).forEach(([fieldNames, deriveFunction]) => {
              derivedFrom.set((typeof fieldNames === "string" ? [fieldNames] : fieldNames), deriveFunction);
            });
        } else if (fieldDef.derivedFrom instanceof Object) {
          // TODO: add support  
          return undefined;
        }
      }
    }
  });

  return {
    validField(field) {
      switch (typeof field) {
        case "string":
          // Field name.
          return this.supportedFieldMap.has(field);
        case "object":
          // Possible object.
          if (field instanceof CalendarSupport || "fieldName" in field) {
            return this.supportedFieldMap.has(field.fieldName);
          }
        // eslint-disable-next-line no-fallthrough
        default:
          return false;
      }
    },
    getField(field) {
      if (this.validField(field)) {
        this.supportedFields.getField(field);
      } else {
        return undefined;
      }
    },
    withValue(value) {
      if (!this.validValue(value)) {
        throw (typeof value === "number" && Number.isInteger(value)
          ? new RangeError("Invalid value") : new TypeError("Invalid type of value")
        );
      }
      return {
        fieldName: this.fieldName,
        fieldValue: value
      }
    },
    withValeus(values) {
      if (values instanceof Array) {
        // Using array.
        throw new TypeError("Array values not yet supported");
      } else if (values instanceof Map) {
        // Using map.

      } else if (values instanceof Object) {
        // Trying to get the values from object.
        throw new TypeError("Object values not yet supported");
      } else {
        // Unknown field
        throw new TypeError("Invalid type of values");
      }
    }
  }
}

/* Include-Start: module.boundary.js {Boundary, upperBoundaryComparison, lowerBoundaryComparison, EmptyBoundary, GenericBoudnary, WellFormedBoundary}*/



/**
 * Get the comparator shared by both one and another.
 * @param {import("./module.comparison.js").Comparator<TYPE>|null|undefined} one The first comparator.
 * @param {import("./module.comparison.js").Comparator<TYPE>|null|undefined} another The second comparator.
 * @returns {import("./module.comparison.js").Comparator<TYPE>|null|undefined} The comparator. If the result is null, the comparator
 * does nto exist. If the result is undefined, there is no comparator. A defined value indicates
 * that comparator should be used.
 */
export const getComparisonComparator = (one, another) => {
  if (one === undefined || another === undefined) return undefined;
  return (one === null ? another : (another === null || another === one ? one : undefined));
}

/**
 * Get comparison with an upper boundary. An unbounded values are considered greater than any
 * other value and equal to each other.
 * @template TYPE
 * @param {import("./module.comparison.js").Comparator<TYPE>} comparator The comparator used for comparison with defined boundaries.
 * @param {boolean} [nullsAreUnbounded=false] Are also nulls considered unbounded. Defaults to false.
 * @returns {import("./module.comparison.js").Comparator<TYPE>} The comparator comparing values as
 * upper boundary.
 */
export const upperBoundaryComparison = (comparator, nullsAreUnbounded = false, undefinedAreUnbounded = true) => {
  // The undefined or null comparator always returns an undefined result.
  if (comparator == null) {
    return () => (undefined);
  }

  if (nullsAreUnbounded && undefinedAreUnbounded) {
    // Both the null and undefined value are considered unbounded.
    return (compared, comparee) => {
      if (comparee == null) {
        return compared == null ? 0 : -1;
      } else if (compared == null) {
        return 1;
      } else {
        return comparator(compared, comparee);
      }
    }

  } else if (nullsAreUnbounded) {
    // Both the null and undefined value are considered unbounded.
    return (compared, comparee) => {
      if (comparee === null) {
        return compared === null ? 0 : -1;
      } else if (compared === null) {
        return 1;
      } else {
        return comparator(compared, comparee);
      }
    }
  } else if (undefinedAreUnbounded) {
    // Only the undefined value is considered unbounded.
    return (compared, comparee) => {
      if (comparee === undefined) {
        return compared === undefined ? 0 : -1;
      } else if (compared === undefined) {
        return 1;
      } else {
        return comparator(compared, comparee);
      }
    };
  } else {
    return (compared, comparee) => comparator(compared, comparee);
  }
}
/**
 * Get comparison with a lower boundary.
 * @template TYPE
 * @param {import("./module.comparison.js").Comparator<TYPE>} comparator The comparator used for comparison with defined boundaries.
 * @param {boolean} [nullsAreUnbounded=false] Are nulls also considered unbounded.
 * @returns {import("./module.comparison.js").Comparator<TYPE>} The upper boundary ussuming the comparee to be upper boundary.
 */
export const lowerBoundaryComparison = (comparator, nullsAreUnbounded = false, undefinedAreUnbounded = true) => {
  // The undefined or null comparator always returns an undefined result.
  if (comparator == null) {
    return () => (undefined);
  }

  if (nullsAreUnbounded && undefinedAreUnbounded) {
    // Both the null and undefined value are considered unbounded.
    return (compared, comparee) => {
      if (comparee == null) {
        return compared == null ? 0 : 1;
      } else if (compared == null) {
        return -1;
      } else {
        return comparator(compared, comparee);
      }
    }
  } else if (nullsAreUnbounded) {
    // Both the null and undefined value are considered unbounded.
    return (compared, comparee) => {
      if (comparee === null) {
        return compared === null ? 0 : 1;
      } else if (compared === null) {
        return -1;
      } else {
        return comparator(compared, comparee);
      }
    }
  } else if (undefinedAreUnbounded) {
    // Only the undefined value is considered unbounded.
    return (compared, comparee) => {
      if (comparee === undefined) {
        return compared === undefined ? 0 : 1;
      } else if (compared === undefined) {
        return -1;
      } else {
        return comparator(compared, comparee);
      }
    };
  } else {
    return (compared, comparee) => comparator(compared, comparee);
  }
}

/**
 * Create an empty boundary.
 * @class
 * @template TYPE - The type of the compared value
 * @implements {Boundary<TYPE>}
 * @param {import("./module.comparison.js").Comparator<TYPE>} [comparator] The comparator of the boundary.
 * By default this is a generic boundary without 
 * @param {TYPE} [minimum] The minimum value of the empty value.
 * @param {TYPE} [maximum] The maximum value of the empty value.
 * @returns {EmptyBoundary<TYPE>} An empty boundary of the given type.
 * @throws {RangeError} The minimum not greater than the maximum with the given comparator.
 * (A null or undefined comparator would cause this, if minimum or maximum was defined)
 */
export const EmptyBoundary = (comparator = null, minimum = undefined, maximum = undefined) => {
  if (minimum !== undefined || maximum !== undefined) {
    if (comparator == null) {
      throw RangeError("The boundary does not support minimum or maximum values without comparator");
    } else if (!greater(comparator(minimum, maximum))) {
      throw RangeError("The given minimum and maximum does not create an empty boundary with given comparator");
    }
  }

  return {
    comparator,
    get lowerBoundary() {
      if (minimum === undefined) {
        throw Error("Empty boundary has no lower boundary value");
      } else {
        return minimum;
      }
    },
    get upperBoundary() {
      if (maximum === undefined) {
        throw Error("Empty boundary has no lower boundary value")
      } else {
        return maximum;
      }
    },
    get isUpperUnbounded() {
      return false;
    },
    get isLowerUnbounded() {
      return false;
    },
    /**
     * @inheritdoc
     */
    isEmpty() {
      return true;
    },
    /**
     * @inheritdoc
     */
    overlaps(other, baseComparator = this.comaparator) {
      const comparator = getComparisonComparator(getComparisonComparator(this.comparator, baseComparator), other.comparator);
      if (comparator == null) return undefined;
      return false;
    },
    /**
     * @inheritdoc
     */
    withinBounds(value, baseComparator = this.comparator) {
      const comparator = getComparisonComparator(baseComparator, this.comparator);
      if (comparator == null) return undefined;
      return false;
    },

    /**
     * @inheritdoc
     * @param {Boundary<TYPE>} other The other boudnary. 
     * @param {import("./module.comparison.js").Comparator<TYPE>} [baseComparator] The comparator performing the comparison.
     * Defaults to a null value indicating the shared comparator of this and base comparator is used.
     * @returns {Boundary<TYPE>[]|import("./module.comparison.js").UndefinedComparisonResult|import("./module.comparison.js").ErroneousComparisonResult}
     * - The list containing the resulting non-empty boundaries, if the union exists.
     * - {@link ErroneousComparisonResult}, if the comparison failed due an error.
     * - {@link UndefinedComparisonResult}, if the comparison failed due incompatible comparators.
     */
    union(other, baseComparator = null) {
      const comparator = getComparisonComparator(getComparisonComparator(this.comparator, baseComparator), other.comparator);
      if (comparator == null) return undefined;
      // Both comparators are not null - it is dealed above.
      return (other.isEmpty() ? (this.comparator !== null ? this : other)
        : (other.comparator !== null ? other : GenericBoundary(other.minimum, other.maximum, comparator)));
    },
    /**
     * @inheritdoc
     */
    intersection(other, baseComparator = this.comparator) {
      const comparator = getComparisonComparator(baseComparator, other.comparator);
      if (comparator == null) return undefined;
      return (this.comparator === null ? other : this);
    },
    /**
     * @inheritdoc
     */
    difference(other, baseComparator = this.comparator) {
      const comparator = getComparisonComparator(baseComparator, other.comparator);
      if (comparator == null) return undefined;
      return (this.comparator === null ? new EmptyBoundary(comparator) : this);
    }

  }
}

/**
 * A generic implementation of a boundary.
 * @constructor
 * @template TYPE - The value type of the boundary.
 * @param {TYPE} [lowerBoundary] The lower boundary of the boundary. Defaults to the undefined
 * value.
 * @param {TYPE} [upperBoundary] The largest allowed value of the boundary. Defaults to the
 * undefined value.
 * @param {import("./module.comparison.js").Comparator<TYPE>} [comparator] The comparator comparing values. The comparator defaults
 * to a lenient comparator defining the order with operator < and >. 
 * @extends Boundary<TYPE>
 */
export const GenericBoundary = (
  lowerBoundary = undefined, upperBoundary = undefined,
  comparator = GENERIC_COMPARATOR, isLowerUnbounded = (lowerBoundary === undefined), isUpperUnbounded = (upperBoundary === undefined)) => {


  return {
    comparator,
    lowerBoundary,
    upperBoundary,
    isLowerUnbounded,
    isUpperUnbounded,
    lowerBoundaryComparison: lowerBoundaryComparison(comparator),
    upperBoundaryComparison: upperBoundaryComparison(comparator),
    isEmpty() {
      if (this.isLowerUnbounded || this.isUpperUnbounded) return false;
      if (this.comparator == null) return undefined;
      const comparison = this.comparator(lowerBoundary, upperBoundary);
      return comparison != null && comparison > 0;
    },
    /**
     * @inheritdoc
     */
    withinBounds(value, comparator = this.comparator) {
      const lowerBounded = comparator ? lowerBoundaryComparison(comparator) : this.lowerBoundaryComparison;
      const upperBounded = comparator ? upperBoundaryComparison(comparator) : this.upperBoundaryComparison;
      return (this.isLowerUnbounded || greaterOrEqual(lowerBounded(value, this.lowerBoundary))) &&
        (this.isUpperUnbounded || lesserOrEqual(upperBounded(value, this.upperBoundary)));
    },
    overlaps(other, baseComparator = this.comparator) {
      if (other == null || this.isEmpty() || other.isEmpty()) return false;
      const comparator = getComparisonComparator(baseComparator, other.comparator);
      if (comparator == null) return false;
      const lowerBounded = lowerBoundaryComparison(comparator);
      const upperBounded = lowerBoundaryComparison(comparator);

      return (
        (this.isLowerUnbounded || other.isUpperUnbounded || greaterOrEqual(lowerBounded(other.maximum, this.lowerBoundary))) &&
        (this.isUpperUnbounded || other.isLowerUnbounded || lesserOrEqual(upperBounded(other.minimum, this.maximus))));
    },
    /**
     * Get the union of the current and given.
     * @param {Boundary<TYPE>} other - The other boundary.
     * @param {import("./module.comparison.js").Comparator<TYPE>} [baseComparator] The comparator used for union.
     * Defaults to the current comparator. 
     * @returns {Boundary|Boundary[]|import("./module.comparison.js").UndefinedComparisonResult|import("./module.comparison.js").ErroneousComparisonResult}
     * - {@link Boundary}, if the union forms a single boundary.
     * - {@link Boundary[]}, if the union forms two separate boundaries.
     * - {@link UndefinedComparisonResult}, if the boundaries were not comparable. 
     * - {@link ErroneousComparisonResult}, if the boundary values were erroneous for the comparison.
     */
    union(other, baseComparator = this.comparator) {
      const comparator = getComparisonComparator(getComparisonComparator(baseComparator), other.comparator);
      if (comparator == null) return undefined;
      if (this.isEmpty()) {
        return GenericBoundary(other.minimum, other.maximum, comparator); // Simple case- the union did not cause anything.
      }
      if (other.isEmpty()) {
        return GenericBoundary(this.lowerBoundary, this.upperBoundary, comparator); // Simple case- the union did not cause anything.
      }
      const lowerBounded = lowerBoundaryComparison(comparator);
      const upperBounded = lowerBoundaryComparison(comparator);
      if (this.withinBounds(other.minimum, lowerBounded) && this.withinBounds(other.maximum, upperBounded)) {
        // The other is within the bounds of the current - the reuslt is current, but with given comparator
        return GenericBoundary(this.lowerBoundary, this.upperBoundary, comparator);
      }
      // Single union only exists, if either minimum or maximum is within bounds, or the current
      // is subset of the given other.
      if (other.withinBounds(this.lowerBoundary, lowerBounded) || other.withinBounds(this.upperBoundary, upperBounded)) {
        return GenericBoundary(
          minimal(lowerBounded, this.lowerBoundary, other.minimum),
          maximal(upperBounded, this.upperBoundary, other.maximum),
          comparator);
      } else {
        // The union consists the given two boundaries separately.
        return [GenericBoundary(this.lowerBoundary, this.upperBoundary, comparator), GenericBoundary(other.minimum, other.maximum, comparator)]
      }
    },
    intersetion(other, baseComparator = this.comparator) {
      const comparator = getComparisonComparator(baseComparator, other.comparator);
      if (comparator == null) return undefined;
      if (this.overlaps(other, comparator)) {
        // the difference is not the current object.
      } else {
        // the difference is an empty boundary.
        return null;
      }

    },
    difference(other, baseComparator = this.comparator) {
      const comparator = getComparisonComparator(baseComparator, other.comparator);
      if (comparator == null) return undefined;
      if (this.overlaps(other, comparator)) {
        // the difference is not the current object.
      } else {
        // the difference is the current boundary with given comparator.
        return GenericBoundary(this.lowerBoundary, this.upperBoundary, comparator);
      }
    },
    unions(...others) {
      const comparator = others.reduce((result, other) => (getComparisonComparator(result, other == null ? undefined : other.comprator)), this.comparator);
      if (comparator == null) {
        // There is no shared comparator.
        return undefined;
      }
      const lowerBounded = lowerBoundaryComparison(comparator);
      const upperBounded = lowerBoundaryComparison(comparator);
      /**
       * Binary search.
       * @template TYPE
       * @param {Array<TYPE>} list A list ordered in ascending order with given comparator.
       * @param {TYPE} value The sought value.
       * @param {import("./module.comparison.js").Comparator<TYPE>} comparator The comparator used to order the list.
       * @param {number} [start=0] The starting index of the search. 
       * @param {number} [end=list.length] The first indx not sought.
       * @returns {number} Positive index containing the sought value. A negative index indicates
       * insertion index of the value. The insertion index is caculated with <coce>-1 - result</coce>.
       */
      const binarySearch = (list, value, comparator, start = 0, end = list.length) => {
        if (!(list instanceof Array)) throw new TypeError("Invalid list");
        if (comparator == null) throw new TypeError("Invalid comparator");
        if (!Number.isInteger(start) || !Number.isInteger(end)
          || start < 0 || start > list.length || end < 0 || end > list.length) {
          // Any parameter was invalid.
          return null;
        }
        let cursor;
        while (start < end) {
          cursor = Math.floor((start + end) / 2);
          let result = comparator(value, list[cursor]);
          if (isValid(result)) {
            if (result === 0) {
              return cursor;
            } else if (result < 0) {
              end = cursor - 1;
            } else if (result > 0) {
              start = cursor + 1;
            }
          } else {
            // The comparison fails.
            return result;
          }
          return -1 - start;
        }
      }
      return others.reduce(
        (result, other) => {
          if (other.isEmpty()) return [];
          if (result instanceof Array) {
            // If the result is empty, it indicates the result is empty list - no further checks is performed.
            // we do have multiple boundaries in ascending order of values.
            if (result.length === 0) return result;

            // Seeking the result containing the start index.
            // - The result does not contain any empty lists.
            const minIndex = binarySearch(result, [other.minimum], ((a, b) => {
              if (a instanceof Array) {
                // The b is the seeked value.
                if (b.withinBounds(a[0])) {
                  return 0;
                } else if (lesser(comparator(a[0], b.minimum))) {
                  return -1;
                } else {
                  return 1;
                }
              } else if (b instanceof Array) {
                // The b is the seeked value.
                if (a.withinBounds(b[0])) {
                  return 0;
                } else if (lesser(comparator(a.minimum, b[0]))) {
                  return -1;
                } else {
                  return 1;
                }
              } else {
                // Both are objects.
                if (a.withinBounds(b.minimum, comparator)) {
                  // The boundaries are equals.
                  return 0;
                } else if (b.withinBounds(a.maximum, comparator)) {
                  // The minimum is less than the 
                  return -1;
                } else {
                  return 1;
                }
              }
            }));
            const maxIndex = binarySearch(result, [other.maximum], (a, b) => {
              if (a instanceof Array) {
                // The b is the seeked value.
                if (b.withinBounds(a[0])) {
                  return 0;
                } else if (lesser(comparator(a[0], b.maximum))) {
                  return -1;
                } else {
                  return 1;
                }
              } else if (b instanceof Array) {
                // The b is the seeked value.
                if (a.withinBounds(b[0])) {
                  return 0;
                } else if (lesser(comparator(a.maximum, b[0]))) {
                  return -1;
                } else {
                  return 1;
                }
              } else {
                // Both are objects.
                if (a.withinBounds(b.maximum, comparator)) {
                  // The boundaries are equals.
                  return 0;
                } else if (b.withinBounds(a.minimum, comparator)) {
                  // The minimum is less than the 
                  return 1;
                } else {
                  return -1;
                }
              }

            });
            if (isValid(minIndex) && isValid(maxIndex)) {
              const minInsertIndex = (minIndex < 0 ? -1 - minIndex : minIndex);
              const maxInsertIndex = (maxIndex < 0 ? -1 - maxIndex : maxIndex);

              // Replacing the boundaries with new boundary.
              if (minInsertIndex === result.length) {
                result.push(other);
              } else if (minInsertIndex === maxInsertIndex && minIndex < 0 && maxIndex < 0) {
                // The insertion happens without overlap.
                result.splice(minInsertIndex, 0, other);
              } else if (minInsertIndex !== maxInsertIndex || minIndex < 0 || maxIndex < 0) {
                // Dealing with the overlapping situation replacing all overlapping boundaries.
                const newMinimum = (minIndex < 0 || lesserOrEqual(lowerBounded(other.minimum, result[minInsertIndex].minimum)) ? other.minimum : result[minInsertIndex].minimum);
                const newMaximum = (maxIndex < 0 || greaterOrEqual(upperBounded(other.maximum, result[maxInsertIndex].maximum)) ? other.maximum : result[maxInsertIndex].maximum);
                result.splice(minInsertIndex, maxInsertIndex - minInsertIndex + (minIndex < 0 || maxIndex < 0 ? 0 : 1),
                  GenericBoundary(newMinimum, newMaximum, comparator));

              } else {
                // The last situation is the case both upper and lower boundary are withing the element at
                // insertion index.
                /*
                Testing the algorithm: 
                list=[[1,2], [3,4]], insert [1, 3]. minIndex = 0, maxIndex = 1
                splice(list, 0, 1-0+1, [1, 4]) => [[1, 4]]
 
                list=[[1,2], [5,6]], insert [0, 4]. minIndex = -1, maxIndex = -2, minInsertIndex=0, maxInsertIndex=1
                splice(list, 0, 1-0, [0, 4]) => [[0,4], [5,6]]
 
                list=[[1,3], [5,6]] insert [2,3]. minIndex = 0, maxIndex 0, nothing to do
 
                list[[1,2], [5,6]], insert [4, 8]. minIndex = -2, maxIndex = -3, minInsertInsertIndex = 1, maxInsertIndex=2
                splice(list, 1, 2-1, [4, 8]) => [[1,2], [4,8]]
                */
              }
              return result;
            } else {
              // We have a problem.
              return null;
            }
          } else {
            // we do have an invalid value.
            return result;
          }
        }, (this.isEmpty() ? [] : [this])
      );
    },
    intersections(...others) {
      const comparator = others.reduce((result, other) => (getComparisonComparator(result, other == null ? undefined : other.comprator)), this.comparator);
      if (comparator == null) {
        // There is no shared comparator.
        console.log(`Intersection without comparator`)
        return undefined;
      } else {
        console.log("Intersection with shared comparator");
      }
      const lowerBounded = lowerBoundaryComparison(comparator);
      const upperBounded = lowerBoundaryComparison(comparator);
      return others.reduce((result, other) => {
        console.log(`Handling intersection with [${other.minimum}, ${other.maximum}]`)
        if (result.length == 0) return result;
        if (other.isEmpty()) {
          return [];
        }
        // If the inserction reduces the result, create a new boundary with reduced bounds.
        if (lesser(lowerBounded(result[0].minimum, other.minimum)) ||
          greater(upperBounded(result[0].maximum, other.maximum))) {
          const newEntry = GenericBoundary(
            greater(lowerBounded(result[0].minimum, other.minimum)) ? result[0].minimum : other.minimum,
            lesser(upperBounded(result[0].maximum, other.maximum)) ? result[0].maximum : other.maximum,
            comparator);
          if (newEntry.isEmpty()) {
            return [];
          } else {
            return [result];
          }
        } else {
          return result;
        }
      }, (this.isEmpty() ? [] : [this]));
    },
    differences(...others) {
      const comparator = others.reduce((result, other) => (getComparisonComparator(result, other == null ? undefined : other.comprator)), this.comparator);
      if (comparator == null) {
        // There is no shared comparator.
        return undefined;
      }
      const lowerBounded = lowerBoundaryComparison(comparator);
      const upperBounded = lowerBoundaryComparison(comparator);

      return others.reduce(
        (result, other) => {
          if (result.length == 0) return result;
          if (other.isEmpty()) return result; // The empty result does not affect the result.

          // TODO: The difference splitting the result into the result.
          if (result instanceof Array) {
            return result.reduce((accumulator, resultBoundary) => {
              if (resultBoundary.overlaps(other, comparator)) {
                // The difference makes a difference.
                if (other.withinBounds(resultBoundary.minimum, comparator)
                  && other.withingBounds(resultBoundary.maximum, comparator)) {
                  // The other totally overlaps with the current value - this eliminates the 
                  // curretn element from result.
                  return accumulator;
                } else {
                  // The other 
                  const newMinimum = (greater(lowerBounded(other.minimum, resultBoundary.minimum)) ? other.minimum : resultBoundary.minimum);
                  const newMaximum = (lesser(upperBounded(other.maximum, resultBoundary.maximum)) ? other.maximum : resultBoundary.maximum);
                  if (greater(lowerBounded(newMinimum, resultBoundary.minimum))) {
                    accumulator.push(GenericBoundary(resultBoundary.minimum, this.predecessor(newMinimum)), comparator)
                  }
                  if (lesser(upperBounded(newMaximum, resultBoundary.maximum))) {
                    // A new group is created from the tail.
                    accumulator.push(GenericBoundary(this.successor(newMaximum), resultBoundary.maximum, comparator));
                  }
                }
              } else {
                // difference changes nothing in the current boundary.
                accumulator.push(resultBoundary);
              }
              return accumulator;
            }, []);
          }
          return result;
        },
        (this.isEmpty() ? [] : [this])
      )
    }
  }
}

/**
 * Create a well formed boundary.
 * @param {number} boundary The boundary value.
 * @returns {FieldBoundary} The well formed boundary with
 * ginve boundary value. 
 */
export function WellFormedBoundary(boundary) {
  return new FieldBoundary(boundary, boundary);
}

/* Include-End: module.boundary.js */


/**
 * Create a field boundary. 
 * @constructor
 * @extends Boundary<number>
 * @param {number} [minimum] The smallest valid boundary value.
 * @param {number} [maximum] The largest valid boundary value.
 */
export function FieldBoundary(minimum, maximum) {
  if (minimum != null && !(Number.isInteger(minimum)))
    throw new RangeError("Invalid minimum value");
  if (maximum != null && !(Number.isInteger(maximum)))
    throw new RangeError("Invalid maximum value");

  return {
    minimum: minimum == null ? Number.NEGATIVE_INFINITY : minimum,
    maximum: maximum == null ? Number.POSITIVE_INFINITY : maximum,
    /**
     * The length of the flexible boundary.
     * The value is never negative, but may be infinite.
     * @type {number}
     */
    get length() {
      return (Number.isFinite(this.minimum) && Number.isFinite(this.maximum)
        ? Math.min(0, this.maximum - this.minimum + 1) : Number.POSITIVE_INFINITY);
    },
    /**
     * Is the field boundary well defined.
     * @returns {boolean} True, if and only if the field boundary is well defined.
     */
    isWellDefined() {
      return this.minimum === this.maximum;
    },
    /**
     * Is the field boudnary empty.
     * @returns {boolean} True, if and only if the field boundary contains
     * no values.
     */
    isEmpty() {
      return this.length == 0;
    },
    /**
     * Is the given value within strict lower boundary.
     * @param {number} value The tested value
     * @returns {boolean} True, if and only if the value
     * is within strict lower boundary.
     */
    isStrictLowerBounded(value) {
      return Number.isFinite(value) && value >= this.maximum;
    },
    /**
     * Is the given value within strict upper boundary.
     * @param {number} value The tested value
     * @returns {boolean} Ture, if and only if the value
     * is within strict upper boundary.
     */
    isStrictUpperBounded(value) {
      return Number.isFinite(value) && value <= this.minimum;
    },
    /**
     * Is the given value within loose upper boundary.
     * @param {number} value The tested value
     * @returns {boolean} True, if and only if the value
     * is within loose upper boundary.
     */
    isUpperBounded(value) {
      return Number.isFinite(value) && value <= this.maximum;
    },
    /**
     * Is the given value within loose lower boundary.
     * @param {number} value The tested value
     * @returns {boolean} True, if and only if the value
     * is within loose upper boundary.
     */
    isLowerBounded(value) {
      return Number.isFinite(value) && value >= this.minimum;
    },
    /**
     * Refines the boundary into a smaller boundary by moving minimum and maximum towards each other.
     * Returns a new BoundaryValue with given refinement.
     * @param {number} [minimum] The new refined minimum, if it is greater than the current minimum.
     * An undefined value defaults to the current minimum.
     * @param {number?} [maximum] The new refiend maximum, if it is less than the current maximum.
     * An undefined value defaults to the current maximum.
     * @returns {FieldBoundary} The feild boundary by refining the lower boundary.
     * @throws {RangeError} The refiend values would cause an empty boundary.
     * @throws {TypeError} The type of the minimum or the maximum was invalid.
     */
    refine(minimum = undefined, maximum = undefined) {
      if (this.isWellDefined()) {
        return new FieldBoundary(this.minimum, this.maximum);
      }
      if ((minimum === undefined || Number.isInteger(minimum)) && (maximum === undefined || Number.isInteger(maximum))) {
        const refiningMinimum = minimum ? Math.max(this.minimum, Math.min(this.maximum, minimum)) : this.minimum;
        const refiningMaximum = maximum ? Math.min(this.maximum, Math.max(this.minimum, maximum)) : this.maximum;
        if (refiningMinimum > refiningMaximum) {
          throw new RangeError("Cannot refine into an empty boundary");
        }
        return new FieldBoundary(refiningMinimum, refiningMaximum);
      } else {
        throw new TypeError("Invalid refine boundary");
      }
    },
    /**
     * Refining an upper boundary allows reducing the boundary into a value smaller than
     * the minimum, and reducing a well defined boundary.
     * @param {number?} [minimum] The new lesser upper boundary, if it is smaller than the current minimum.
     * @param {number?} [maximum] The new greater upper boundary, if it is smaller than teh current maximum.
     * @returns {FieldBoundary} The new field boundary generated by refining the current boundary.
     * @throws {RangeError} The refiend values would cause an empty boundary.
     * @throws {TypeError} The type of the minimum or the maximum was invalid.
     */
    refineUpperBoundary(minimum = undefined, maximum = undefined) {
      if ((minimum === undefined || Number.isFinite(minimum)) && (maximum === undefined || Number.isFinite(maximum))) {
        const refiningMinimum = minimum ? Math.min(this.minimum, minimum) : this.minimum;
        const refiningMaximum = maximum ? Math.min(this.maximum, maximum) : this.maximum;
        if (refiningMinimum > refiningMaximum) {
          throw new RangeError("Cannot refine into an empty boundary");
        }
        return new FieldBoundary(refiningMinimum, refiningMaximum);
      } else {
        throw new TypeError("Invalid refine boundary");
      }

    },
    /**
     * Refining an lower boundary allows reducing the boundary into a value greater than
     * the maximum, and reducing a well defined boundary.
     * @param {number?} [minimum] The new lesser lower boundary, if it is greater than the current minimum.
     * @param {number?} [maximum] The new greater lower boundary, if it is greater than teh current maximum.
     * @returns {FieldBoundary} The new field boundary generated by refining the current boundary.
     * @throws {RangeError} The refiend values would cause an empty boundary.
     * @throws {TypeError} The type of the minimum or the maximum was invalid.
     */
    refineLowerBoundary(minimum = undefined, maximum = undefined) {
      if ((minimum === undefined || Number.isFinite(minimum)) && (maximum === undefined || Number.isFinite(maximum))) {
        const refiningMinimum = minimum ? Math.max(this.minimum, minimum) : this.minimum;
        const refiningMaximum = maximum ? Math.max(this.maximum, maximum) : this.maximum;
        if (refiningMinimum > refiningMaximum) {
          throw new RangeError("Cannot refine into an empty boundary");
        }
        return new FieldBoundary(refiningMinimum, refiningMaximum);
      } else {
        throw new TypeError("Invalid refine boundary");
      }

    }
  }
}

/**
 * The field derivation defining a field derivation
 * @param {string} fieldName The name of the derived field.
 * @param {string[]|Set<string>} requiredFields The required fields.
 * @param {*} prohibitedFields 
 * @param {*} fieldValueFunction 
 * @param {*} fieldValueCount 
 * @returns 
 */
export function FieldDerivation(fieldName, requiredFields, prohibitedFields, fieldValueFunction, fieldValueCount = 1) {

  return {
    fieldName,
    requiredFields,
    prohibitedFields,
    fieldValueFunction,
    fieldValueCount,
    getFieldValue(fieldValues) {
      if (this.fieldValueCount != 1) return undefined;
      if (fieldValues instanceof Map) {
        if (this.prohibitedFields.some((field) => (fieldValues.has(field)))) {
          return null;
        } else if (this.requiredFields.every((field) => (fieldValues.has(field)))) {
          return {
            fieldName: fieldName,
            valueValue: fieldValueFunction(fieldValues.map)
          }
        } else {
          return undefined;
        }
      }
    },
    getFieldValues(fieldValues) {
      if (fieldValues instanceof Map) {
        if (this.prohibitedFields.some((field) => (fieldValues.has(field)))) {
          return null;
        } else if (this.requiredFields.every((field) => (fieldValues.has(field)))) {
          const fieldValue = fieldValueFunction(fieldValues);
          if (fieldValue.length != this.fieldValueCount) {
            return undefined;
          }
          return {
            fieldName: fieldName,
            valueValue: fieldValueFunction(fieldValues.map)
          }
        } else {
          return undefined;
        }
      }
    }
  }
}


/**
 * Gregojulian calendar.
 * @member calendar
 */
export class GregorianCalendar {

  static supporteFieldsMap() {
    return new Map([
      ["Day", {
        fieldName: "Day",
        minValue() {
          return 1;
        },
        maxValue(fieldName) {
          if (fieldName === "Day") {
            return this.daysOfMonths.entires().reduce(
              // eslint-disable-next-line no-unused-vars
              (result, [_, daysOfMonths]) => {
                return daysOfMonths.reduce((subResult, days) => {
                  return Math.max(subResult, days);
                }, result)
              },
              0
            )
          }
        }
      }],
      ["Month", {
        fieldName: "Month",
        minValue(fieldName) {
          if (["Month", "MonthOfYear", "DayOfMonth"].find((field) => (fieldName === field)) != null) {
            return 1;
          } else {
            return undefined;
          }
        },
        maxValue(fieldName) {
          if (fieldName === "Month") {
            return this.daysOfMonths.entires().reduce(
              // eslint-disable-next-line no-unused-vars
              (result, [_, daysOfMonths]) => {
                return Math.max(daysOfMonths.length, result);
              },
              0
            )
          } else {
            return undefined;
          }
        },
        validValue(fieldName, fieldValue) {
          const [minValue, maxValue] = [this.minValue(fieldName), this.maxValue(fieldName)];
          if (minValue === null || maxValue === null) {
            return null;
          }
          return (minValue === undefined || fieldValue >= minValue) && (maxValue === undefined || fieldValue <= maxValue);
        },
        validValues(fieldName, fieldValues) {
          if (fieldName === "Month") { this.validValue(fieldName, fieldValues.get(fieldName)); }
          if (fieldName === "MonthOfYear") {
            return this.validDateValue(
              (fieldValues.has("CanonicalYear") ? fieldValues.get("CanonicalYear") : fieldValues.get("Year")),
              (fieldValues.has("MonthOfYear") ? fieldValues.get("MonthOfYear") : fieldValues.get("Month")),
              1)
          }
          if (fieldName === "Date") {
            return this.validDateValue(
              (fieldValues.has("CanonicalYear") ? fieldValues.get("CanonicalYear") : fieldValues.get("Year")),
              (fieldValues.has("MonthOfYear") ? fieldValues.get("MonthOfYear") : fieldValues.get("Month")),
              (fieldValues.has("DayOfMonth") ? fieldValues.get("DayOfMonth") : fieldValues.get("Day"))
            )
          }
          if (fieldName === "DayofMonth") {
            if (fieldValues.has("CanonicalYear") || fieldValues.has("Year")) {
              return this.validValues("Date", fieldValues);
            } else {
              const month = (fieldValues.has("MonthOfYear") ? fieldValues.get("MonthOfYear") : fieldValues.get("Month"));
              if (Number.isInteger(month) && month > 0) {
                GregorianCalendar.daysOfMonths.normal.daysOfMonths.length
              }
            }
          }
        }
      }],



    ]);
  }

  /**
   * The days of months for gregorian calendar.
   */
  static daysOfMonths = {
    /**
     * The days of months for a normal year.
     * @type {Array<number>} - The days of months using month value as
     * index. The first zero for calculating the first day of year for
     * each month.
     */
    normal: [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    /**
     * The days of months for a leap year.
     * @type {Array<number>} - The days of months using month value as
     * index. The first zero for calculating the first day of year for
     * each month.
     */
    leap: [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
  }

  /**
   * The days of year at the end of the month for all year types.
   * @type {Object.<string.Array<number>>}
   */
  static daysOfYearsOfMonths = Object.entries(this.daysOfMonths).reduce((result, [yearType, daysOfMonths]) => {
    result[yearType] = daysOfMonths.reduce((days, daysInPreviousMonth, index) => {
      days.push(daysInPreviousMonth + (index === 0 ? 0 : days[index - 1]));
      return days;
    }, []);
    return result;
  }, {});


  /**
   * Get the upper boundary of the days of years.
   * @param {number} [year] The year of the wanted upper boundary. 
   * @returns {FieldBoundary} The field boundary defining the upper boundary of the days in year.
   */
  static getDaysOfYearUpperbBoundary(year = undefined) {
    if (year) {
      if (this.isLeapYear(year)) {
        return WellFormedBoundary(this.daysOfYearsOfMonths.leap[this.daysOfYearsOfMonths.leap.length - 1]);
      } else {
        return WellFormedBoundary(this.daysOfYearsOfMonths.normal[this.daysOfYearsOfMonths.normal.length - 1]);
      }
    } else {
      return new FieldBoundary(
        this.daysOfYearsOfMonths.reduce(
          // eslint-disable-next-line no-unused-vars
          (result, [yearType, daysOfYears]) => (result == null
            || result > daysOfYears[daysOfYears.lenth - 1] ? daysOfYears[daysOfYears.length - 1] : result), null),
        this.daysOfYearsOfMonths.reduce(
          // eslint-disable-next-line no-unused-vars
          (result, [yearType, daysOfYears]) => (result == null
            || result < daysOfYears[daysOfYears.lenth - 1] ? daysOfYears[daysOfYears.length - 1] : result), null)
      );
    }
  }

  /**
   * Get the  upper boundary of the months of years.
   * @param {number} [_year] The year of the boundary. 
   * @returns {FieldBoundary} The lower boudnary of a months of year.
   */
  // eslint-disable-next-line no-unused-vars
  static getMonthsOfYearUpperBoundary(_year = undefined) {
    return FieldBoundary(12, 12);
  }


  /**
   * Get the  lower boundary of the months of years.
   * @param {number} [_year] The year of the boundary. 
   * @returns {FieldBoundary} The lower boudnary of a months of year.
   */
  // eslint-disable-next-line no-unused-vars
  static getMonthsOfYearLowerBoundary(_year = undefined) {
    return FieldBoundary(1, 1);
  }

  /**
     * Get the lower boundary of days of months.
     * @param {number} [month] The month of the boundary, if specific month is queried. 
     * @returns {FieldBoundary} The upper boundary of a month value.
     */
  // eslint-disable-next-line no-unused-vars
  static getDaysOfMonthLowerBoundary(_month = undefined, _year = undefined) {
    return new FieldBoundary(1, 1);
  }


  /**
   * Get the upper boundary of days of months.
   * @param {number} [month] The month of the boundary, if specific month is queried. 
   * @returns {FieldBoundary} The upper boundary of a month value.
   */
  static getDaysOfMonthUpperBoundary(month = undefined) {
    let result = new FieldBoundary(
      this.daysOfMonths.reduce(
        // eslint-disable-next-line no-unused-vars
        (result, [_, daysInMonths]) => {
          const minimum = daysInMonths.slice(1).reduce((result, daysInMonth) => (
            (result == null || result > daysInMonth ? daysInMonths : result)
          ))
          return result == null || minimum > result ? minimum : result;
        }
        , null
      ),
      this.daysOfMonths.reduce(
        // eslint-disable-next-line no-unused-vars
        (result, [_, daysInMonths]) => {
          const maximum = daysInMonths.slice(1).reduce((result, daysInMonth) => (
            (result == null || result > daysInMonth ? daysInMonths : result)
          ))
          return result == null || maximum > result ? maximum : result;
        }
        , null
      ));
    if (month == undefined) {
      return result;
    } else if (Number.isInteger(month)) {
      // Month is given.
      return result.refine(
        // eslint-disable-next-line no-unused-vars
        this.daysInMonths.reduce((result, [_, daysInMonths]) => {
          const minimum = daysInMonths.find((_, index) => (index === month));
          return (result == null || minimum == null || result > minimum ? minimum : result);
        }, null),
        // eslint-disable-next-line no-unused-vars
        this.daysInMonths.reduce((result, [_, daysInMonths]) => {
          const maximum = daysInMonths.find((_, index) => (index === month));
          return (result == null || maximum == null || result < maximum ? maximum : result);
        }, null)
      );
    } else {
      throw new TypeError("Invalid month value");
    }
  }

  /**
   * The supported fields set.
   * @returns {Set<string>} The set of the supported fields. 
   */
  static getSupportedFields() {
    return [...(this.supportedFieldMap.keys())];
  }

  /**
   * Test, if s year is a canonical year.
   * @param {number} canonicalYear The tested canonical year.
   * @returns {boolean} True, if and only if a year starting at 28.2. or earlier is a leap year.
   */
  static isLeapYear(canonicalYear) {
    return Number.isInteger(canonicalYear)
      && (canonicalYear % 4 === 0 && (canonicalYear % 100 !== 0 || canonicalYear % 400 === 0));
  }

  /**
   * Test the validity of the date.
   * @param {number} canonicalYear - The canonical year. 
   * @param {number} monthOfYear - The month of year.
   * @param {number} dayOfMonth - The day of month. 
   * @returns {boolean} True, if and only if the given date is valid.
   */
  static validDateValue(canonicalYear, monthOfYear, dayOfMonth) {
    return ( // validCanonicalYear
      Number.isInteger(canonicalYear)
      && ( // validMonthOfYearValue
        Number.isInteger(monthOfYear) && monthOfYear >= 1 && monthOfYear <= 12
        && ( // validDayOfMonthOfYearValue
          Number.isInteger(dayOfMonth) && dayOfMonth >= 1
          && (dayOfMonth <= (this.daysOfMonths[(this.isLeapYear(canonicalYear) ? "leap" : "normal")])[monthOfYear])
        )
      )
    );
  }



  /**
   * The start of year. 
   * @type {import("./module.calendar.common.js").StartOfYear}
   */
  #startOfYear = { day: 1, month: 1 };

  /**
   * Does the calendar support the given field.
   * @param {string} fieldName The tested field name.
   * @returns {boolean} True, if and only if the calendar supports the field.
   */
  validField(fieldName) {
    if (typeof fieldName === "string") {
      return this.supportedFieldsMap.has(fieldName);
    } else {
      return false;
    }
  }

  getField(fieldName) {
    return this.supportedFieldMap.get(fieldName);
  }

  /**
   * Is the given feild and field values valid. 
   * @param {string} fieldName The name of the field.
   * @param {Map<string, number>|Object.<string, number>} dateFields - Either a 
   * mappign from field names to field values, or an object having own properties
   * from strings to numbers. 
   * @returns {boolean|null|undefined} True, onöly if the given field can be derived
   * from the given date fields. A null indicates that the field cannot be derived due
   * invalid values, and an undefined value indicates the field is uknown. 
   */
  validFieldValue(fieldName, dateFields) {
    try {
      return this.validField(fieldName) && this.getFieldValues(dateFields) != null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get e field value from the date fields.
   * @param {string} fieldName 
   * @param {Map<string, number>|Object.<string, number>} dateFields 
   * @returns {number|undefined|null} The field value, a null indicating the
   * field value cannnot be generated from given field values, and an undefined
   * value, if the field value is not supported with given fields.
   */
  getFieldValue(fieldName, dateFields) {
    return this.getField(fieldName)?.withValues(dateFields);
  }

  /**
   * Create a new Gregorian Calendar with start of year.
   * @param {import("./module.calendar.common.js").StartOfYear} [startOfYear] The start of year defaults to the
   * first of January. 
   */
  constructor(startOfYear = { day: 1, month: 1 }) {
    if (this.validDayOfMonth(startOfYear.month, startOfYear.day)) {
      this.#startOfYear = startOfYear;
    } else {
      throw new RangeError(`Invalid start date: ${startOfYear.day}.${startOfYear.month}.`);
    }
  }

  validEra(era) {
    switch (typeof era) {
      case "string":
        return ["BC", "BCE", "AD", "CE", ""].find((eraAbbrev) => (era === eraAbbrev)) != null;
      case "number":
        return era == 0 || era == 1 || era == 2;
      default:
        return false;
    }
  }

  validEraDate(era, dateObject) {
    if (this.validEra(era)) {
      switch (era) {
        case 0:
        case "BC":
        case "BCE":
          // The Before Common Era or Before Christ
          if (dateObject.has("CanonicalYear")) {
            return this.constructor.validDate(dateObject.get("CanonicalYear"), dateObject.get("MonthOfYear"), dateObject("DayOfMonth"))
          } else if (dateObject.has("Year")) {
            return this.constructor.validDate(1 - dateObject.get("Year"), dateObject.get("MonthOfYear"), dateObject("DayOfMonth"))
          } else if (dateObject.has("YearOfEra")) {
            return this.constructor.validDate(1 - dateObject.get("YearOfEra"), dateObject.get("MonthOfYear"), dateObject("DayOfMonth"))
          } else {
            return false;
          }
        case 1:
        case "AD":
        case "CE":
          // The Common Era or Anno Domini
          if (dateObject.has("CanonicalYear")) {
            return this.constructor.validDate(dateObject.get("CanonicalYear"), dateObject.get("MonthOfYear"), dateObject("DayOfMonth"))
          } else if (dateObject.has("Year")) {
            return this.constructor.validDate(dateObject.get("Year"), dateObject.get("MonthOfYear"), dateObject("DayOfMonth"))
          } else if (dateObject.has("YearOfEra")) {
            return this.constructor.validDate(dateObject.get("YearOfEra"), dateObject.get("MonthOfYear"), dateObject("DayOfMonth"))
          } else {
            return false;
          }
        case 2:
        case "":
          // The computer era.
          if (dateObject.has("CanonicalYear")) {
            return this.constructor.validDate(dateObject.get("CanonicalYear"), dateObject.get("MonthOfYear"), dateObject("DayOfMonth"))
          } else if (dateObject.has("Year")) {
            return this.constructor.validDate(dateObject.get("Year"), dateObject.get("MonthOfYear"), dateObject("DayOfMonth"))
          } else if (dateObject.has("YearOfEra")) {
            return this.constructor.validDate(dateObject.get("YearOfEra") + 1969, dateObject.get("MonthOfYear"), dateObject("DayOfMonth"))
          } else {
            return false;
          }
        default:
          return false;
      }
    } else {
      return false;
    }
  }

  validDateValue(year, month, day) {
    return this.constructor.validDateValue(year, month, day);
  }

  validDayOfYear(year, day) {
    return this.constructor.validDayOfYear(year, day);
  }

  get daysOfMonths() {
    return GregorianCalendar.daysOfMonths;
  }

  get daysOfYearsOfMonths() {
    return GregorianCalendar.daysOfYearsOfMonths;
  }

  /**
   * Test validity of the month.
   * @param {number|null} year The canonical year. If undefined, the normal year is used.
   * @param {number} month The month of year. 
   */
  validMonthOfYear(year, month) {
    return (month >= 1 && month <= this.daysOfMonths[year != null && this.isLeapYear(year) ? "leap" : "normal"].length);
  }

  /**
   * Test validity of the day of the month.
   * @param {number} month The month of year. 
   * @param {number} day The day of month
   * @returns {boolean} True, if and only if the day is possibly valid day for the month.
   */
  validDayOfMonth(month, day) {
    return this.validMonthOfYear(null, month) && day >= 1 &&
      day <= (this.daysOfMonths.normal[month]);
  }

  /**
   * Test validity of the day of the month of the year.
   * @param {number} year The canonical year.
   * @param {number} month The month of the year.
   * @param {number} day The day of the monht.
   * @returns {boolean} True, if and only if the given date is valid.
   */
  validDateOfMonth(year, month, day) {
    return this.validMonthOfYear(year, month) && day >= 1 &&
      day <= (this.daysOfMonths[this.isLeapYear(year) ? "leap" : "normal"][month]);
  }

  /**
   * Test validity of the day of the year.
   * @param {number} year The canonical year.
   * @param {number} day The day of year.
   * @returns {boolean} True, if and only if the given date is valid.
   */
  validDateOfYear(year, day) {
    return day >= 1 && day <= this.daysOfYearsOfMonths[(this.isLeapYear(year) ? "leap" : "normal")][12];
  }

  validDate(dateObject) {
    if (dateObject instanceof Map) {
      if (dateObject.has("Era")) {
        return (this.validEra(dateObject.get("Era")) &&
          this.validEraDate(dateObject.get("Era"), dateObject));
      } else {
        const year = ["Year", "CanonicalYear"].find((fieldName) => (dateObject.has(fieldName)));
        if (year != null) {
          if (dateObject.has("Year") && (year < 1)) {
            // Year cannot be negative.
            return false;
          }
          const month = ["MonthOfYear", "Month"].find((fieldName) => (dateObject.has(fieldName)));
          if (month != null) {
            const day = ["DayOfMonth", "Day"].find((fieldName) => (dateObject.has(fieldName)));
            return this.validDateValue(year, month, day == null ? 1 : day);
          } else {
            // Possible day of year.
            const day = ["DayOfYear", "Day"].find((fieldName) => (dateObject.has(fieldName)));
            return day == null || this.validDayOfYear(year, day);
          }

        } else if (dateObject.has("Month")) {
          const day = ["DayOfMonth", "Day"].find((fieldName) => (dateObject.has(fieldName)));
          if (day == null) {
            return this.validMonth(dateObject.get("Month"))
          } else {
            return this.validDayOfMonth(dateObject.get("Month"), day);
          }
        } else {
          return false;
        }
      }
    } else if (dateObject instanceof Object) {
      if (dateObject.calendar === this.name) {
        if (dateObject instanceof CalendarSupport) {
          // The object has calendar support.
          const dateFieldName = ["Date", "DayOfYear", "MonthOfYear", "YearOfEra", "Year", "CanonicalYear"].find((fieldName) => (dateObject.validField(fieldName)));
          if (dateFieldName) {
            return this.validFieldValues(dateFieldName, dateObject.getFieldValues(dateFieldName));
          }
        } else {
          // 
        }
      }
    }
    return false;
  }

  /**
   * Is the given canonical year of the calendar a leap year.
   * @param {number} canonicalYear The canonical gregorian year.
   * @returns {boolean} True, if and only if the given year is a leap year.
   */
  isLeapYear(canonicalYear) {
    if (this.#startOfYear.month >= 3) {
      return GregorianCalendar.isLeapYear(canonicalYear + 1);
    } else {
      return GregorianCalendar.isLeapYear(canonicalYear);
    }
  }
}

/**
 * An immutable gregorian calendar instance.
 */
export const gregorianCalendar = new GregorianCalendar();
Object.freeze(gregorianCalendar);

const supportedCalendars = new JsonMap([["gregorian", gregorianCalendar]]);

/**
 * A generic date.
 * @param {number} year The year of the date.
 * @param {number} month The month of the date.
 * @param {number} day The day of the date.
 * @param {string} [calendar] The calendar of the date.
 * @returns {Date} 
 */
export function TemporalDate(year, month, day, calendar = "gregorian") {
  return {
    year: year,
    month: month,
    day: day,
    calendar: calendar
  };
}

/**
 * Remove a calendar from supported calendars.
 * @param {Calendar} calendar The removed calendar.
 * @returns {boolean} Was the calendar removed.
 */
export function unregisterCalendar(calendar) {
  return calendar instanceof Object && "calendarName" in calendar
    && this.supportedCalendars.delete(calendar.calendarName);
}

/**
 * Removes a calendar from the supported calendars.
 * @param {string} calendarName The name o fhte removed calendar. 
 * @returns {boolean} Was the calendar removed.
 */
export function unregisterCalendarByName(calendarName) {
  return this.supportedCalendars.delete(calendarName);
}

export function registerCalendar(calendar, calendarName = undefined) {
  if (calendar != null && calendar instanceof Calendar) {
    this.supportedCalendars.set((calendarName ? calendarName : calendar.calendarName), calendar);
  }
}

/**
 * Create a new calendar date.
 * @param {number} [year=1970] The year of the date. 
 * @param {number} [month=1] The month of year of the date.
 * @param {number} [day=1] The day of the month of the date.
 * @param {number} [calendar="gregorian"] The calendar of the date.
 * @returns 
 */
export function CalendarDate(year = 1970, month = 1, day = 1, calendar = "gregorian", additionalFields = null,
  calendarSupport = false) {

  if (!supportedCalendars.has(calendar)) {
    throw new TypeError("The given calendar is not supported");
  }

  /**
   * create the resulting date.
   */
  const result = {
    year: year,
    month: month,
    day: day,
    calendar: calendar
  };

  if (calendarSupport) {
    // Adding the calendar support to the date.
    /**
     * Create the map from supported field names to the functions getting the field values.
     * @param {CalendarDate} dateObject The date, whose supported fields is generated.
     * @param {Map<string, Function>} [additionalFields] The mapping from additional field values
     * to the function generating the field value from CalendarDate.
     * @returns {Map<string, Function>} The mapping from supported field names to the functions
     * getting the value of the field from the CalendarDate.
     */
    const supportedFieldMap = (dateObject, additionalFields = null) => {
      const result = new Map((additionalFields instanceof Map ? additionalFields.entries() : []));
      [
        ...(Number.isInteger(dateObject.day) ? [["Day", (date) => (new Map[["Day", date.day]])]] : []),
        ...(Number.isInteger(dateObject.day) && Number.isInteger(dateObject.month)
          ? [["DayOfMonth", (date) => (new Map([
            ["DayOfMonth", date.day, "Month", date.month]
          ]))]] : []),
        ...(Number.isInteger(dateObject.day) && Number.isInteger(dateObject.year)
          ? [["DayOfYear", (date) => (new Map([
            ["DayOfYear", date.day], ["MonthOfYear", date.month],
            [(date.year > 0 ? "Year" : "CanonicalYear"), date.year]]))]] : []),
        ...(Number.isInteger(dateObject.day) && Number.isInteger(dateObject.month && Number.isInteger(dateObject.year))
          ? [["Date", (date) => (new Map([["DayOfMonth", date.day], ["MonthOfYear", date.month],
          [(date.year > 0 ? "Year" : "CanonicalYear"), date.year]]))]] : []),
        ...(Number.isInteger(dateObject.month) ? [
          ["Month", (date) => (new Map([["Month", date.month]]))
          ]] : []),
        ...(Number.isInteger(dateObject.month) && Number.isInteger(dateObject.year) ?
          [["MonthOfYear", (date) => (new Map([["MonthOfYear", date.month],
          [(date.year > 0 ? "Year" : "CanonicalYear"), date.year]]))]] : []),
        ...(Number.isInteger(dateObject.year) && dateObject.year > 0 ?
          [["Year", (date) => (new Map([["Year", date.year]]))]] : []),
        ...(Number.isInteger(dateObject.year) ? [["CanonicalYear", (date) => (new Map([["CanonicalYear", date.year]]))]] : [])
      ].forEach(([fieldName, fieldValueFunction]) => {
        result.set(fieldName, fieldValueFunction);
      });

      return result;
    }

    const calendarSupport = {
      calendarImplementation: () => (supportedCalendars.get(this.calendar)),
      supportedFieldMap: () => supportedFieldMap(this, additionalFields),
      validField(fieldName) {
        return supportedCalendars.has(this.calendar) && supportedCalendars.get(this.calendar).validField(fieldName) &&
          supportedFieldMap().has(fieldName)
      },
      /**
       * Get the field value.
       * @param {string} fieldName The queried field value.
       * @returns {number|null|undefined} The value of hte given field.
       */
      getFieldValue(fieldName) {
        if (this.validField(fieldName)) {
          return this.calendarImplementation.getFieldValue(fieldName, supportedFieldMap().get(fieldName)(this));
        } else {
          return undefined;
        }
      },
      /**
       * Get the field values of the given field.
       * @param {string} fieldName The queried field value.
       * @returns {Map<string, number>?} The field map of the wanted field values.
       */
      getFieldValues(fieldName) {
        if (validFieldName(fieldName)) {
          return this.calendarImplementation.getFieldValues(fieldName, supportedFieldMap().get(fieldName)(this));
        } else {
          return undefined;
        }
      }
    };
    if (calendarSupport) {
      Object.setPrototypeOf(result, calendarSupport);
    }
  }
  return result;
}

/**
 * Does the date map have some of the fields.
 * @param {Map<string,number>} dateMap The map from date fields to their valeus.
 * @param {string[]} fields... The list of tested fields.
 * @returns {boolean} True, if and only if the date map has some of the fields.
 */
export function hasSomeField(dateMap, ...fields) {
  return dateMap instanceof Map && fields.some((fieldName) => (dateMap.has(fieldName)));
}

/**
 * Get the first field the date map has.
 * @param {Map<string,number>} dateMap The map from date fields to their valeus.
 * @param {string[]} fields... The list of tested fields.
 * @returns {string|undefined} The name of the first field of the list the date map
 * has, or an undefined valeu, if it had none of the fields.
 */
export function getSomeField(dateMap, ...fields) {
  return dateMap instanceof Map ? fields.find((fieldName) => (dateMap.has(fieldName))) : undefined;
}

/**
 * Get the value of the first field the date map has.
 * @param {Map<string,number>} dateMap The map from date fields to their valeus.
 * @param {string[]} fields... The list of tested fields.
 * @returns {number|undefined} The value of hte first field of the list the date map
 * has, or an undefined valeu, if it had none of the fields.
 */
export function getSomeFieldValue(dateMap, ...fields) {
  const field = getSomeField(dateMap, ...fields);
  return field == null ? undefined : dateMap.get(field);
}

/**
 * Does the date map have every one of the fields.
 * @param {Map<string,number>} dateMap The map from date fields to their valeus.
 * @param {string[]} fields... The list of tested fields.
 * @returns {boolean} True, if and only if the date map has all of the fieilds.
 */
export function hasEveryField(dateMap, ...fields) {
  return dateMap instanceof Map && fields.every((fieldName) => (dateMap.has(fieldName) && dateMap.get(fieldName) != null));
}

/**
 * The field requiremetn consisting either
 * @typedef {Array.<Array<string>, Array<string>?>} ArrayFieldRequirement
 * @property {Array<string>} 0 The allowed fields.
 * @property {Array<string>} 1 The prohibited fields.
 */

/**
 * Teh object requirement map.
 * @typedef {Object} ObjectFieldRequirement 
 * @property {Set<string>} optional The set of allowed names.
 * @property {Set<string>} required The set of required names.
 * @property {Set<string>} prohibited The set of prohibited field names.
 * @function test - Test whether a field value map fulfils the requirement.
 * @param {Map<string, number>} dateMap The mapping from field names to field values.
 * @returns {boolean} True, if and only if the given date map passes the requirement.
 * @function [getFieldValue] - Get the value of the field. 
 * @param {Map<string, number>} dateMap The mapping from field naems to field values.
 * @returns {number|undefined} The value of the field, or an undefined value, if the value
 * cannot be determiend.
 */

/**
 * The field requirement can be either a string, a array field requirement, or
 * an object field requirement.
 * @typedef {string|ArrayFieldRequirement|ObjectFieldRequirement} FieldRequirement
 * The name of a requirement, or array of possible requirements.
 */

/**
 * Requirement builder allows building of the field requirement.
 * @returns 
 */
export function RequirementBuilder() {
  return {
    /**
     * The optional fields, whose value is taken into the 
     * date map of the value generation. None of these is
     * required.
     * @type {Set<string>}
     */
    optional: new Set(),
    /**
     * The rqeuired fields which the date map has to have.
     * @type {Set<string>}
     */
    required: new Set(),
    /**
     * The prohibited fields which the date map cannnot have.
     * @type {Set<string>}
     */
    prohibited: new Set(),

    /**
     * The function returning the value of the field when 
     * given the date map containing the required fields, and all
     * allowed fields.
     * @type {Function}
     * @default Function An anonymous function returing frist existing optional
     * field value, or an undefined value.
     */
    valueFunc: (dateMap) => (getSomeFieldValue(dateMap, ...this.optional)),

    /**
     * Sets 
     * @param {Function} func The function determining the value of the fields.
     * @returns {RequirementBuilder} The requirement builder with given
     * refused fields added.
     * @throws {TypeError} The given new value function was invalid.
     */
    valueFunction(func) {
      if (func instanceof Function) {
        this.valueFunc = func;
      } else {
        throw TypeError("Invalid value function - not a function");
      }
      return this;
    },

    /**
     * Refuse one or more field names.
     * @param {string} fieldName The refused field name. 
     * @returns {RequirementBuilder} The requirement builder with given
     * refused fields added.
     * @throws {TypeError} Any field name was invalid.
     */
    prohibit(fieldName) {
      switch (typeof fieldName) {
        case "string":
          if (!this.optional.has(fieldName)) {
            this.optional.delete(fieldName);
          }
          if (!this.required.has(fieldName)) {
            this.required.delete(fieldName);
          }
          if (!this.prohibited.has(fieldName)) {
            // 
            this.prohibited.add(fieldName);
          }
          return this;
        case "object":
          if (fieldName instanceof String) {
            return this.reject(fieldName.toString());
          } else if (fieldName instanceof Set || fieldName instanceof Array) {
            if ([...(fieldName.entries())].every((tested) => (typeof tested === "string"))) {
              [...(fieldName.entries())].reduce((result, added) => (result.refuse(added)), this);
            } else {
              throw new TypeError("Invalid field name list");
            }
          }
        // eslint-disable-next-line no-fallthrough
        default:
          throw new TypeError("Invalid field name");
      }
    },
    require(fieldName) {
      switch (typeof fieldName) {
        case "string":
          if (!this.required.has(fieldName)) {
            // Duplicate fields are ignored.
            this.required.add(fieldName);
          }
          return this;
        case "object":
          if (fieldName instanceof String) {
            return this.require(fieldName.toString());
          } else if (fieldName instanceof Set || fieldName instanceof Array) {
            if ([...(fieldName.entries())].every((tested) => (typeof tested === "string"))) {
              [...(fieldName.entries())].reduce((result, added) => (result.require(added)), this);
            } else {
              throw new TypeError("Invalid field name list");
            }
          }
        // eslint-disable-next-line no-fallthrough
        default:
          throw new TypeError("Invalid field name");
      }
    },
    test(dateMap) {
      return hasSomeField(dateMap, ...(this.optional.entries())) &&
        (this.required.length == 0 || hasEveryField(dateMap, ...(this.required.entries()))) &&
        !(hasSomeField(dateMap, ...(this.refused.entries())))
    },
    /**
     * Build the array requirement.
     * @returns {ArrayFieldRequirement} The array field requiemnt crated from the builder.
     */
    buildArray() {
      return [
        [
          // The refused fields.
          ...(this.required),
          // The allowed fields
          ...(this.optional.length > 0 ? [[...(this.optional)]] : [])
        ],
        // The prohibited fields.
        ...(this.prohibited.length > 0 ? [[...(this.prohibited)]] : [])
      ];
    },
    /**
     * Build the requirement.
     * @param {boolean} [wantArray=false] Do the caller want required and prohibited array representation. 
     * @returns {ObjectFieldRequirement} The created 
     */
    build() {
      if (this.valueFunc.length > 1 && this.valueFunc.length > this.optional.size) {
        throw new TypeError("Value function cannot handle required number of values");
      }
      return {
        required: this.required,
        optional: this.optional,
        prohibited: this.prohibited,
        /**
         * Get the field value of the date. 
         * @param {Map<string, number>} dateMap The date field map
         * @returns {number|undefined} The value of the field, or an undefined value, if the
         * field does not have the value.
         */
        getFieldValue: (dateMap) => {
          if (this.test(dateMap)) {
            if (this.valueFunc.length > 1) {
              // Calling with parameter values.
              const param = [
                ...(this.required.keys()),
                ...(hasSomeField(dateMap, ...(this.optional.keys())) ? [getSomeField(dateMap, ...(this.optional.keys()))] : [])
              ].map((fieldName) => (dateMap.get(fieldName)));
              return this.valueFunc(...param);
            } else {
              // Called with value map.
              return this.valueFunc(getEveryFieldValue(dateMap, this));
            }
          }
          return undefined;
        },
        /**
         * Does a date map fulfil the requirement.
         * @param {Map<string, number>} dateMap The date field map from field names to field values.
         * @returns {boolean} True, if and only if the given date map fulfils the requirement.
         */
        test(dateMap) {
          return (this.required.length == 0 || hasEveryField(dateMap, ...(this.required.entries()))) &&
            !(hasSomeField(dateMap, ...(this.refused.entries())))
        }
      }
    }
  }
}

/**
 * Does the date map have every one of the required fields, and none o fhte prohibited
 * fields.
 * @param {Map<string,number>} dateMap The map from date fields to their valeus.
 * @param {FieldRequirement[]} requiredFields The list of the required fields. The lists of
 * requirements are considered set of possible requirements of field requirements.
 * @param {string[]} [prohibitedFields=[]] The list of tested fields.
 * @returns {boolean} True, if and only if the date map has all of the required fields, but
 * none of the prohibited fields.
 */
export function fulfilsRequirements(dateMap, requiredFields, prohibitedFields = null) {
  return hasEveryField(dateMap, ...((requiredFields).map(
    (requirement) => (requirement instanceof Object ? requirement.entryId : requirement)).filter((requirement) => (typeof requirement === "string"))))
    && (prohibitedFields == null || !hasSomeField(dateMap, ...prohibitedFields));
}

/**
 * Get the date mapping of specified fields.
 * @param {Map<string, number>} dateMap The mapping from calendar field names to their values.
 * @param  {...(FieldRequirement)} fields The list of the selected fields.
 * @returns {Map<string, number>} The mapping from listends with defined value to their values 
 * in the date map.
 * @throws {Error} One of the fields was invalid.
 */
export function getEveryFieldValue(dateMap, ...fields) {
  return fields.reduce((map, field) => {
    if (field instanceof Array) {
      // Arrays are interpreted as sets of optional fields. 
      field.forEach((optionalField) => {
        const fieldValue = dateMap.get(optionalField);
        if (Number.isInteger(fieldValue)) {
          map.set(optionalField, fieldValue);
        }
      });
    } else if (field instanceof Object) {
      // The field is a FieldRequirement object.

      // Adding all existing optional fields.
      if (field.optional instanceof Set) {
        field.optional.keys().forEach((fieldName) => {
          const fieldValue = dateMap.get(fieldName);
          if (Number.isInteger(fieldValue)) {
            map.set(fieldName, fieldValue);
          }
        });
      }
      // Ensuring all required keys has a value.
      if (field.required instanceof Set) {
        field.required.keys().forEach((fieldName) => {
          const fieldValue = dateMap.get(fieldName);
          if (Number.isInteger(fieldValue)) {
            map.set(fieldName, fieldValue);
          } else {
            throw Error(`Missing required field ${fieldName}`);
          }
        });
      }
      // Removing all prohibited keys.
      if (field.prohibited instanceof Set) {
        field.prohibited.forEach((fieldName) => {
          map.delete(fieldName);
        });
      }
    } else {
      const fieldValue = dateMap.get(field);
      if (Number.isInteger(fieldValue)) {
        map.set(field, fieldValue)
      } else {
        throw Error(`Missing required field ${field}`);
      }
    }
    return map;
  }, new Map());
}

/**
 * Does the date map have some of the field requirements.
 * @param {Map<string, number>} dateMap The mapping from calendar field names to their values.
 * @param {Array<Array.<Array<string>, (Array<string>|undefined)>} fieldRequirements The list of the
 * field requirements, which contains required fields list as first argumetn, and optional prohibited
 * field list as second argument.
 */
export function hasSomeFields(dateMap, fieldRequirements) {
  return getSomeFields(dateMap, fieldRequirements) != null;
}
/**
 * Get the first field requirement the date map has.
 * @param {Map<string, number>} dateMap The mapping from calendar field names to their values.
 * @param {Array<Array.<Array<string>, (Array<string>|undefined)>} fieldRequirements The list of the
 * field requirements, which contains required fields list as first argumetn, and optional prohibited
 * field list as second argument.
 * @returns {Array<string>|undefined} The first required date fields of hte requirement the date map had.
 */
export function getSomeFields(dateMap, fieldRequirements) {
  return fieldRequirements.find(([requiredFields, prohibitedFields = []]) => {
    return fulfilsRequirements(dateMap, requiredFields, prohibitedFields);
  }).map((result) => (result ? result[0] : result));
}

/**
 * Get field values of the first matching requirement.
 * @param {Map<string, number>} dateMap The mapping from calendar field names to their values.
 * @param {Array<Array.<Array<string>, (Array<string>|undefined)>} fieldRequirements The list of the
 * field requirements, which contains required fields list as first argumetn, and optional prohibited
 * field list as second argument.
 * @returns {Map<string, number>} The values of the first matching field requirement, or an empty list
 * if none matched.
 */
export function getSomeFieldsValues(dateMap, fieldRequirements) {
  const fields = getSomeFields(dateMap, fieldRequirements);
  if (fields) {
    return getEveryFieldValue(dateMap, fields);
  } else {
    return new Map();
  }
}

/**
 * Ariesian calendar is a version of the Zodiac calendar the Hermetic Order uses.
 * It uses Age of Aries due miscalculation of the introducer of the calendar even if the 
 * real Zodiac era is Pisces, not Aries.
 */
export class AriesianCalendar {

  /**
   * The month names of the Ariesian months.
   */
  static MONTH_NAMES = [
    "Aries", "Taurus", "Gemini",
    "Cander", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius",
    "Capricorn", "Aquarius", "Pisces"
  ];

  /**
   * The mapping from base fields other fields derive their values from.
   */
  static baseFieldMap = new Map([
    ["Day",
      (dateMap) => (getSomeFieldValue(dateMap, ...["DayOfYear", "DayOfSeason", "DayOfMonth", "DayOfWeek", "Day"]))
    ],
    ["Month",
      (dateMap) => (getSomeFieldValue(dateMap, ...["MonthOfYear", "MonthOfSeason", "Month"]))
    ],
    ["Year",
      (dateMap) => (getSomeFieldValue(dateMap, ["CanonicalYear", "YearOfEra", "Year"]))
    ],
    ["DayOfMonth", (dateMap) => (getSomeFieldValue(getSomeFieldsValues(dateMap, [
      [["DayOfMonth"]], [["Month", "Day"], ["Season"]]
    ]), "DayOfMonth", "Day"))],
    ["DayOfYear", (dateMap) => (getSomeFieldValue(getSomeFieldsValues(dateMap, [
      [["DayOfYear"]], [[["CanonicalYear", "YearOfEra", "Year"], "Day"], ["Season", "Month"]]
    ]), "DayOfMonth", "Day"))],
    ["DayOfYear",
      (dateMap) => (getSomeFieldValue(dateMap, ["DayOfYear", "Day"]))
    ],
    ["MonthOfYear", (dateMap) => (getSomeFieldValue(getEveryFieldValue(dateMap, ...([
      ["CanonicalYear", "MonthOfYear"], ["CanonicalYear", "Month"],
      ["Era", "YearOfEra", "MonthOfYear"], ["Era", "YearOfEra", "Month"],
      ["Era", "Year", "MonthOfYear"], ["Era", "Year", "Month"],
      ["Year", "MonthOfYear"], ["Year", "Month"],
      ["Year", "Season", "MonthOfSeason"], ["Year", "Season", "Month"],

    ].find(
      (fieldList) => (hasEveryField(dateMap, fieldList))) || []))), "MonthOfYear", "Month")
    ],

  ]);

  /**
   * Mapping from derived field values to the derived field value acquisition from date map.
   */
  static derivedFieldMap = new Map([
    ["Season",
      (dateMap) => (getSomeFieldValue(dateMap, ["SeasonOfYear", "Season"]))
    ],

    ["SeasonFields", (dateMap) => {
      return getEveryFieldValue(dateMap, ...([
        ["CanonicalYear", "SeasonOfYear", "MonthOfSeason", "DayOfSeasonOfMonth"],
        ["CanonicalYear", "Season", "MonthOfSeason", "DayOfSeasonOfMonth"],
        ["CanonicalYear", "SeasonOfYear", "MonthOfSeason", "DayOfMonth"],
        ["CanonicalYear", "Season", "MonthOfSeason", "DayOfMonth"],
        ["CanonicalYear", "SeasonOfYear", "MonthOfSeason", "Day"],
        ["CanonicalYear", "Season", "MonthOfSeason", "Day"],
        ["CanonicalYear", "SeasonOfYear", "Month", "DayOfMonth"],
        ["CanonicalYear", "Season", "Month", "DayOfMonth"],
        ["CanonicalYear", "SeasonOfYear", "Month", "Day"],
        ["CanonicalYear", "Season", "Month", "Day"],
        ["CanonicalYear", "SeasonOfYear", "MonthOfSeason"],
        ["CanonicalYear", "Season", "MonthOfSeason"],
        ["CanonicalYear", "SeasonOfYear", "Month"],
        ["CanonicalYear", "Season", "Month"],
        ["Year", "SeasonOfYear", "MonthOfSeason", "DayOfMonth"],
        ["Year", "Season", "Month", "Day"],
      ])).find((fieldList) => (hasEveryField(dateMap, fieldList)));
    }
    ],
    ["SeasonOfYear", (dateMap) => {
      // Get the season o fyear, or calculate the season from month of year.
      const seasonalFields = this.derivedFieldsMap.get("SeasonalFields")(dateMap);
      if (seasonalFields) {
        return getSomeFieldValue(seasonalFields, "SeasonOfYear", "Season");
      } else {
        const fieldList = [[["MonthOfYear"]],
        [["Year", "Month"], ["SeasonOfYear", "Season"]]].find(
          ([requiredFieldList = [], prohibitedFieldList = []]) => (
            hasEveryField((dateMap, requiredFieldList)) && !hasSomeField(dateMap(prohibitedFieldList))));
        if (fieldList) {
          return 1 + Math.floor((getSomeFieldValue(dateMap, ["MonthOfYear", "Month"]) - 1) / 3);
        } else {
          return undefined;
        }
      }
    }],
    ["MonthOfSeason", (dateMap) => {
      const seasonalFields = this.derivedFieldMap.get("SeasonalFields")(dateMap);
      if (seasonalFields) {
        return getSomeFieldValue(seasonalFields, "SeasonOfYear", "Season") * 3 +
          getSomeFieldValue(dateMap, "MonthOfSeason", "Month");
      } else {
        return undefined;
      }
    }
    ],
    ["DayOfMonthOfSeason", (dateMap) => {
      const seasonalFields = this.derivedFieldMap.get("SeasonalFields")(dateMap);
      if (seasonalFields && hasSomeField(dateMap, "DayOfMonthOfSeason", "DayOfMonth", "Day")) {
        return getSomeFieldValue(seasonalFields, "DayOfMonthOfSeason", "DayOfMonth", "Day");
      } else {
        return undefined;
      }
    }
    ]


  ]);

  /**
   * The mapping from supported fields.
   */
  static supportedFieldMap = new Map([
    ...(this.baseFieldMap.entries()),
    ...(this.derivedFieldMap.entries())
  ]);

  static daysOfMonths = {
    /**
     * The days of months for a normal year.
     * @type {Array<number>} - The days of months using month value as
     * index. The first zero for calculating the first day of year for
     * each month.
     */
    normal: [0, 31, 31, 30, 31, 31, 30, 32, 29, 30, 31, 28, 31],
    /**
     * The days of months for a leap year.
     * @type {Array<number>} - The days of months using month value as
     * index. The first zero for calculating the first day of year for
     * each month.
     */
    leap: [0, 31, 31, 30, 31, 31, 30, 32, 29, 30, 31, 28, 32],
  };

  /**
   * The days of year at the end of the month for all year types.
   * @type {Object.<string.Array<number>>}
   */
  static yearDaysOfMonths = Object.entries(this.daysOfMonths).reduce((result, [type, daysInMonths]) => {
    if (result.length === 0) {
      result[type] = daysInMonths.reduce((yearDays, daysInMonth) => {
        yearDays.push((yearDays.length ? yearDays[result.length - 1] : 0) + daysInMonth);
        return yearDays;
      }, [])
    }
    return result;
  }, {})

  static validField(fieldName) {
    this.constructor.supportedFieldsMap.has(fieldName);
  }

  static validDate(date) {
    if (date instanceof Map) {
      // Date-field map.
    }
  }
}

export default {
  GregorianCalendar, gregorianCalendar
  // Calendar, CalendarField, CalendarFieldValue, CalendarDate
  // JulianCalendar, 
};
