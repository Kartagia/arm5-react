
/**
 * The module containing utilities related to ranges, and intervals.
 * 
 * @module utils/range
 */

import { defaultCompare } from "./module.utils";

///////////////////////////////////////////////////////////////////////////////////////////////////
// Ranges
///////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * The properties of the range. This is also a range POJO.
 * @template TYPE The type of the range values.
 * @typedef {Object} RangeProperties The range properties.
 * @property {TYPE} min The minimum value of the range.
 * @property {TYPE} max The maximum value of the range.
 * @property {number} [length] The number of elements of the range.
 * @property {RangeProperties<TYPE>} [subRanges] The sub ranges of the range.
 */

/**
 * @template TYPE The type of hte range values.
 * @typedef {Object} CompoundRangeProperties
 * @property {RangeProperties<TYPE>} subRanges The ranges composing the range.
 */

/**
 * A range without number of elements.
 * @template TYPE The type of the range values.
 * @typedef {Omit<RangeProperties<TYPE>, "length">} InfiniteRangeProperties
 */

/**
 * A continuous range without sub ranges.
 * @template TYPE The type of the range valeus.
 * @typedef {Omti<RangeProperties<TYPE>, "subRanges"} AtomicRangeProperties
 */

/**
 * The range POJO.
 * @template TYPE The type of the range values.
 * @typedef {RangeProperties<TYPE>} RangePojo
 */
/**
 * A range containing minimum, maximum, and every value between them.
 * @template TYPE The type of hte range values.
 * @typedef {Object} ContinousRangeProperties
 * @property {number} length The number of elements of the range.
 * @property {Range<TYPE>[]} [subRanges] The sub ranges of the continous range.
 */

/**
 * @template TYPE The valeu type of the range.
 * @typedef {Object} CreateRangeOptions
 * @property {import("./module.utils").Order<TYPE>} [order] The order of the values.
 * @property {import("./module.utils").Comparator<TYPE>} [compare] The comparator used to compare
 * values.
 */

/**
 * 
 * @template TYPE The value type of the range.
 * @param {TYPE} min The smallest value in range.
 * @param {TYPE} max The largest valeu in range.
 * @param {CreateRangeOptions<TYPE>} options The creation optiosn.
 * @returns {ContinousRangeProperties<TYPE> & RangeMethods<TYPE>}
 */
export function createContinuousRange(min, max, options={}) {

    return {
        min,
        max,
        compare: ((options.order?.compare) ?? options.compare) ?? defaultCompare,
        includes(value) {
            return this.compare(this.min, value) <= 0 && this.compare(value, this.max) <= 0;
        }
    };
}

/**
 * @template TYPE The type of the range values.
 * @typedef {Omit<RangeProperties<TYPE>, keyof ContinousRangeProperties> & ContinousRangeProperties<TYPE>} RangePojo
 */
/**
 * The range methods.
 * @template TYPE The type of the range values.
 * @typedef {Object} RangeMethods
 * @property {import("./module.utils").Predicate<TYPE>} includes Does the range
 * include given value.
 * @property {import("./module.utils").Comparator<TYPE>} compare The comparator of the
 * given type.
 * @property {(range: Range<TYPE>) => Range<TYPE>} intersect Get the intersection of the
 * current range and the given range using the compare of the current range.
 * @property {(range: Range<TYPE>) => Range<TYPE>} continousUnion Get the continuous union.
 * @property {(range: Range<TYPE>) => Range<TYPE>} union Get the union of two ranges.
 * @property {(range: Range<TYPE>) => Range<TYPE>} difference Get the range created by removing
 * the given range from the current range.
 */
/**
 * Range of values. The range does not need to be a continous range.
 * @template TYPE
 * @typedef {RangeProperties<TYPE> & RangeMethods<TYPE>} Range
 */
/**
 * A range whose values can be compared with default comparison.
 * @typedef {RangeProperties & Omit<Range, "compare">} NaturalRange
 */
/**
 * Create a continuous range of values.
 * @template [TYPE=any] The type of the range boundaries.
 * @param {TYPE} min The lower boundary of the range.
 * @param {TYPE} max The upper boundary of the range.
 * @param {import("./module.utils").Comparator<TYPE>} comparator The comparator of the range
 * values.
 * @returns {Range<TYPE>} The range of hte given type.
 * @throws {SyntaxError} The minimum and maximum was not comparable.
 */
export function createRange(min, max, comparator = defaultCompare) {
    if (comparator(min, max) === undefined) {
        throw new SyntaxError("Incompatible minimum and maximum of the range");
    }
    return {
        min,
        max,
        compare: comparator,
        get isEmpty() {
            return this.compare(this.min, this.max) > 0;
        },
        /**
         * Is the range single singleton with same minimum and maximum.
         * @type {boolean}
         */
        get isSingleton() {
            return this.compare(this.min, this.max) === 0;
        },
        includes(value) {
            return this.compare(value, this.min) >= 0 && this.compare(this.max, value) <= 1;
        },
        refine(range) {
            const minCmp = this.compare(this.min, range.min);
            const maxCmp = this.compare(this.max, range.max);
            return createRange(
                minCmp < 0 ? range.min : this.min,
                maxCmp > 0 ? range.max : this.max,
                this.compare);
        },
        continousUnion(range) {
            if (this.isEmpty) {
                return createRange(range.min, range.max, this.compare);
            } else if (this.compare(range.min, range.max) > 0) {
                return this;
            } else if (this.compare(range.max, this.min) < 0 || this.compare(range.min, this.max > 0)) {
                throw new SyntaxError("Union is not a continuous range");
            }
            return createRange(
                this.compare(this.min, range.min) > 0 ? range.min : this.min,
                this.compare(this.max, range.max) < 0 ? range.max : this.max,
                this.compare
            );
        },
        union(range) {
            if (this.isEmpty()) {
                // The current range is empty.
                return [createRange(range.min, range.max, this.compare)];
            } else if (this.compare(range.min, range.max) > 0) {
                // Given range is empty.
                return [this];
            }
            const minCmp = this.compare(this.min, range.max);
            const maxCmp = this.compare(this.max, range.min);
            if (minCmp === undefined || maxCmp === undefined) {
                throw new SyntaxError("Incompatible range");
            }
            if (minCmp > 0) {
                return [createRange(range.min, range.max, this.compare), this];
            } else if (maxCmp < 0) {
                return [this, createRange(range.min, range.max, this.compare)];
            } else {
                return [this.continousUnion(range)];
            }
        }
    };
}
//////////////////////////////////////////////////////////////////////////////////////////////////
// Interval - a continuous range
//////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * A converter converts a value to another value.
 * @template SOURCE THe Source value.
 * @template [RESULT=SOURCE] The result type. Defauls to the source type.
 * @template [EXCEPTION=void] The value throwns on invalid source. Defaults to no exception thrown.
 * @callback Converter
 * @param {SOURCE} source The converted value.
 * @returns {RESULT} The result of the conversion.
 * @throws {EXCEPTION} The source could not be converted.
 */
/**
 * The properties specific to intervals.
 * @template TYPE The value type of the interval value.
 * @typedef {Object} IntervalProperties
 * @property {number} length The number of values within the interval.
 * @property {Range<TYPE>[]} subRanges The sub ranges the interval contains.
 * @property {number} subRangeCount The sub range count is fixed to 1.
 */
/**
 * The methods specific to intervals.
 * @template TYPE The value type of the interval value.
 * @typedef {Object} IntervalMethods
 * @property {Converter<TYPE, TYPE|undefined>} successorOf Get the successor of a value.
 * @property {Converter<TYPE, TYPE|undefined>} predecessorOf Get the predecessor of a value.
 * @property {Converter<Range<TYPE>|Interval<TYPE>, Interval<TYPE>>} continousUnion Create a continuous union, which is always an interval.
 * @property {Converter<Range<TYPE>|Interval<TYPE>, Range<TYPE>|Interval<TYPE>>} union Get the union with other range.
 *
 */
/**
 * @template TYPE The value type of the interval value.
 * @typedef {Omit<Range<TYPE>, (keyof IntervalProperties<TYPE>)|(keyof IntervalMethods<TYPE>)> & IntervalProperties<TYPE> & IntervalMethods<TYPE>} Interval
 */
/**
 * The construction options for an interval with type convertible to a number.
 * @template TYPE The value type of the interval contents.
 * @typedef {Object} EnumeratedIntervalOptions
 * @property {Converter<number, TYPE, TypeError|SyntaxError|RangeError>} fromNumber Converting value from number.
 * @property {Converter<number, number|undefined>} successor The successor of a value function returning a number.
 * @property {Converter<number, number|undefined>} predecessor The predecessor of a value function returning a number.
 */
/**
 * An instance of enumerated itnerval options.
 * @template TYPE The value type of the interval contents.
 * @extends {EnumeratedIntervalOptions<TYPE>}
 */

export class EnumeratedIntervalOptionsInstance {

    /**
     * Create enumerated interval options.
     * @param {EnumeratedIntervalOptions<TYPE>} options The source options of the enumarted interval.
     * @throws {SyntaxError} The options was invalid.
     */
    constructor(options = {}) {
        if (isEnumeratedIntervalOptions(options)) {
            /** @type {Converter<number, number|undefined>} */
            this.successor = options.successor;
            /** @type {Converter<number, number|undefined>} */
            this.predecessor = options.predecessor;
            /** @type {Converter<number, TYPE, SyntaxError|TypeError|RangeError} */
            this.fromNumber = options.fromNumber;
        } else {
            throw new SyntaxError("Invalid options");
        }
    }

    /**
     * The function determining the predecessor.
     * @type {(value: TYPE) => (TYPE|undefined)}
     */
    get successorFn() {
        return (/** @type {TYPE} */ value) => {
            try {
                const result = options.successor(+value);
                return result === undefined ? undefined : options.fromNumber(result);
            } catch (error) {
                return undefined;
            }
        };
    }

    /**
     * The function determining the predecessor.
     * @type {(value: TYPE) => (TYPE|undefined)}
     */
    get predecessorFn() {
        return (/** @type {TYPE} */ value) => {
            try {
                const result = options.predecessor(+value);
                return result === undefined ? undefined : options.fromNumber(result);
            } catch (error) {
                return undefined;
            }
        };

    }
}

/**
 * @template TYPE The value type of the interval contents.
 * @extends {ObjectValuedIntervalOptions<TYPE>}
 */
export class ObjectValuedIntervalOptionsInstance {

    /**
     * @type {ObjectValuedIntervalOptions<TYPE>}
     */
    #options;

    /**
     * Create a new object value dinterval options instance.
     * @param {ObjectValuedIntervalOptions<TYPE>} options The definition of the properties.
     * @throws {SyntaxError} The options was invalid.
     */
    constructor(options) {
        if (isObjectValuedIntervalOptions(options)) {
            this.#options = { ...options };
        } else {
            throw new SyntaxError("Invalid options");
        }
    }

    /**
     * @type {import("./module.utils").Comparator<TYPE>}
     */
    comparator(compared, comparee) {
        return this.#options.comparator(compared, comparee);
    }

    /**
     * Getter of a successor of a value.
     * @param {TYPE} value The original value.
     * @returns {TYPE|undefined} The successor, if any exists.
     */
    successor(value) {
        return this.#options.successor(value);
    }

    /**
     * Getter of a predecessor of a value.
     * @param {TYPE} value The original value.
     * @returns {TYPE|undefined} The predecessor, if any exists.
     */
    predecessor(value) {
        return this.#options.predecessor(value);
    }
}

/**
 * The construction options for an interval with type requiring user defined comparator.
 * @template TYPE The value type of the interval contents.
 * @typedef {Object} ObjectValuedIntervalOptions
 * @property {import("./module.utils").Comparator<TYPE>} comparator The comparator used to compare the values.
 * @property {Converter<TYPE, TYPE|undefined>} successor The successor of a value function.
 * @property {Converter<TYPE, TYPE|undefined>} predecessor The predecessor of a value function.
 */

/**
 * Check, if a value is an object valued interval options.
 * @param {*} value The tested value.
 * @returns {boolean} True, if the value can be an object valued option. The test is fallible, as functions cannot
 * be checked for thier parameters or return values.
 */
export function isObjectValuedIntervalOptions(value) {
    return typeof value === "object" && value !== null && [
        ["comparator", (value) => (value instanceof Function && value.length === 2)],
        ["successor", (value) => (value instanceof Function && value.length === 1)],
        ["predecessor", (value) => (value instanceof Function && value.length === 1)]
    ].every((prop, validator) => (prop in value && validator(value[prop])));
}

/**
 * Check if a value is a valid object interval options.
 * @template TYPE The type of the interval members.
 * @template [EXCEPTION=void] The thrown exception type. Defaults to no exception.
 * @param {*} value The checked value.
 * @param {Object} param1 The options of the check.
 * @param {boolean} [param1.throwOnFailure=false] Does the check throw an exception on failure.
 * @param {string} [param1.message] The error message, if the exception is thrown.
 * @param {Converter<string, EXCEPTION>} [param1.exceptionSupplier] The exception supplier.
 * @returns {ObjectValuedIntervalOptions<TYPE>|undefined} A valid options, or an undefined value.
 * @throws {EXCEPTION} The value was not a valid value, and the failure causes throwing of an exception.
 */
export function checkObjectValuedOptions(value, {
    throwOnFailure = false, message = "Invalid object valued interval options", exceptionSupplier = ((message) => (new SyntaxError(message)))
}) {
    if (isObjectValuedIntervalOptions(value)) {
        return /** @type {ObjectValuedIntervalOptions<TYPE>} */ value;
    } else if (throwOnFailure) {
        throw exceptionSupplier(message);
    } else {
        return undefined;
    }
}
/**
 * Check, if a value is an enumerated interval options.
 * @param {*} value The tested value.
 * @returns {boolean} True, if the value can be an enumerated option. The test is fallible, as functions cannot
 * be checked for thier parameters or return values.
 */
export function isEnumeratedIntervalOptions(value) {
    return typeof value === "object" && value !== null && [
        ["fromNumber", (value) => (value instanceof Function && value.length === 1)],
        ["successor", (value) => (value instanceof Function && value.length === 1)],
        ["predecessor", (value) => (value instanceof Function && value.length === 1)]
    ].every((prop, validator) => (prop in value && validator(value[prop])));
}
/**
 * Check if a value is a valid object interval options.
 * @template TYPE The type of the interval members.
 * @template [EXCEPTION=void] The thrown exception type. Defaults to no exception.
 * @param {*} value The checked value.
 * @param {Object} param1 The options of the check.
 * @param {boolean} [param1.throwOnFailure=false] Does the check throw an exception on failure.
 * @param {string} [param1.message] The error message, if the exception is thrown.
 * @param {Converter<string, EXCEPTION>} [param1.exceptionSupplier] The exception supplier.
 * @returns {EnumeratedIntervalOptions<TYPE>|undefined} A valid options, or an undefined value.
 * @throws {EXCEPTION} The value was not a valid value, and the failure causes throwing of an exception.
 */
export function checkEnumeratedIntervalOptions(value, {
    throwOnFailure = false, message = "Invalid object valued interval options", exceptionSupplier = ((message) => (new SyntaxError(message)))
}) {
    if (isObjectValuedIntervalOptions(value)) {
        return /** @type {EnumeratedIntervalOptions<TYPE>} */ value;
    } else if (throwOnFailure) {
        throw exceptionSupplier(message);
    } else {
        return undefined;
    }
}
/**
 * The interval creation options.
 * @template TYPE The value type of the interval contents.
 * @typedef {(ObjectValuedIntervalOptions<TYPE> | EnumeratedIntervalOptions<TYPE>)} CreateIntervalOptions
 */
/**
 * Create a new interval.
 * @template [TYPE=number] The value type of the interval value.
 * @param {TYPE} start The start of the interval.
 * @param {TYPE} end The end of the interval.
 * @param {CreateIntervalOptions<TYPE>} options The options of the interval creation.
 * @returns {Interval<TYPE>} The interval created with given start and end.
 * @throws {TypeError} The start or end was of invalid type.
 * @throws {RangeError} THe start or end was an invalid value.
 */
export function createInterval(start, end,
    options = /** @type {EnumeratedIntervalOptions<number>} */ {
        fromNumber: (/** @type {number} */ value) => {
            if (Number.isSafeInteger(value)) return value;
            throw (typeof value === "number" ? RangeError("Not an integer value") : TypeError("Not a number"));
        },
        successor: ((value) => (Number.isSafeInteger(value) && value < Number.MAX_SAFE_INTEGER ? value + 1 : undefined)),
        predecessor: ((value) => (Number.isSafeInteger(value) && value > Number.MIN_SAFE_INTEGER ? value - 1 : undefined))
    }
) {
    const enumeratedOptions = isEnumeratedIntervalOptions(options) ? new EnumeratedIntervalOptionsInstance(options) : undefined;
    const objectOptions = isObjectValuedIntervalOptions(options) ? new ObjectValuedIntervalOptionsInstance(options) : undefined;
    const successorFn = (enumeratedOptions
        ? ((/** @type {TYPE} */ value) => {
            try {
                const successor = enumeratedOptions.successor(+value);
                return successor === undefined ? undefined : enumeratedOptions.fromValue(successor);
            } catch (error) {
                return undefined;
            }
        })
        : objectOptions.successor
    );
    if (successorFn === undefined) {
        throw new SyntaxError("Invalid options");
    }
    const predecessorFn = (enumeratedOptions
        ? ((/** @type {TYPE} */ value) => {
            const predecessor = enumeratedOptions.predecessor(+value);
            return predecessor === undefined ? undefined : enumeratedOptions.fromValue(predecessor);
        })
        : objectOptions.predecessor
    );
    if (predecessorFn === undefined) {
        throw new SyntaxError("Invalid options");
    }
    const compareFn = objectOptions ? objectOptions.comparator : (/** @type {TYPE} */ compared, /** @type {TYPE} */ comparee) => (defaultCompare(+compared, +comparee));

    return {
        successorOf: successorFn,
        predecessorOf: predecessorFn,
        compare: compareFn,

        get subRanges() { return 1; },

        get min() {
            return start;
        },
        get max() {
            return end;
        },
        includes(value) {
            return this.compare(this.min, value) <= 0 && this.compare(value.this.max) <= 0;
        },
        union(value) {
        },
        continousUnion(value) {
            const compare = this.compare.bind(this);
            var continuesBoundaries = {
                min: undefined,
                max: undefined,
                get isEmpty() {
                    return this.min !== undefined && this.max !== undefined && compare(this.min, this.max) <= 0;
                }
            };
            if (value.subRanges !== undefined && value.subRangeCount >= 1 && value.subRanges.reduce(
                (/** @type { min: TYPE|undefined, max|undefined: TYPE, +readonly isEmpty: boolean } */ result, /** @type {Range<TYPE>} */ range) => {
                    if (result.result && this.compare(range.min, range.max) <= 0) {
                        if (result.min !== undefined && result.max !== undefined) {
                            if (this.compare(this.successorOf(result.previous.max), range.min) === 0) {
                                result.previous.max = range.max;
                            } else {
                                result.result = false;
                            }
                            if (this.compare(range.max, this.predecessorOf(result.previous.min)) === 0) {
                                // The range is continous.
                                result.previous.min = range.min;
                            } else {
                                result.result = false;
                            }
                        } else {
                            result.min = range.min;
                            result.max = range.max;
                        }
                    }
                    return result;
                }, continuesBoundaries).isEmpty) {
                throw new RangeError("There is no continous union");
            } else {
                return /** @type {Interval<TYPE>} */ createInterval(range.min, range.max, this.#options);
            }
        }
    };
}

