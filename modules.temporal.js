
/**
 * The module of temporal data types and methods.
 * 
 * @module utils/temporal
 */

import { compare, defaultCompare, numberAsOrdinalText, numberAsText, createOrder, createComparisonOrder } from "./module.utils";
import { createRange } from "./modules.range";

/**
 * Get the temporal reckoning with name.
 * @param {string} name The reckoning name.
 * @returns {TemporalReckoning|undefined} The temporal reckoning with given name,
 * or an undefined value. 
 */
export function getReckoning(name) {
    switch (name) {
        case GregorianReckoning.NAME: return new GregorianReckoning();
        case JulianReckoning.NAME: return new JulianReckoning();
        case HermeticRecknoning.NAME: return new HermeticRecknoning();
        default:
            return undefined;
    }
}


//////////////////////////////////////////////////////////////////////////////////////////
// Order
//////////////////////////////////////////////////////////////////////////////////////////

/**
 * Test a value.
 * @template TYPE The tested type.
 * @type {import("./module.utils").Predicate<TYPE>} Predicate
 */


/**
 * Order of intieger values.
 * @param {Object} options The options of the roder.
 * @param {import("./module.utils").Comparator<bigint|number>} [options.compare] Compares values.
 * @param {number|bigint} [options.min] The smallest accepted value.
 * @param {number|bigint} [options.max] The largest accepted value.
 * @param {boolean} [options.undefinedOutsideBoundary=false] Is undefined considered just outside the boundary.
 * @returns {Order<bigint|number>}
 */
export function IntegerOrder(options = {max: Number.MAX_SAFE_INTEGER, min: Number.MIN_SAFE_INTEGER, compare: defaultCompare}) {

    return {
        min: options.min,
        max: options.max,
        compare: options.compare ?? defaultCompare,
        successor(value) {
            switch (typeof value) {
                case undefined: 
                    if (options.undefinedOutsideBoundary) {
                        return this.min;
                    } else {
                        return undefined;
                    }
                case "number":
                    if (this.validValue(value) && value < this.max) {
                        if (this.value < Number.MAX_SAFE_INTEGER && this.value < this.max) {
                            return value +1;
                        } else {
                            return BigInt(value) +1n;
                        }
                    } else {
                        return undefined;
                    }
                case "bigint":
                    if (value < this.max) { return value + 1n; }
                default:
                    return undefined;
            }
        },
        predecessor(value) {
            switch (typeof value) {
                case undefined: 
                    if (options.undefinedOutsideBoundary) {
                        return this.max;
                    } else {
                        return undefined;
                    }
                case "number":
                    if (this.validValue(value) && value > this.min) {
                        if (this.value > Number.MIN_SAFE_INTEGER) {
                            return value -1;
                        } else {
                            return BigInt(value) -1n;
                        }
                    } else {
                        return undefined;
                    }
                case "bigint":
                    if (value > this.min) { return value - 1n; }
                default:
                    return undefined;
            }
        },
        validValue(value) {
            switch (typeof value) {
                case "number":
                case "bigint":
                    return this.compare(this.min, value) <= 0 && this.compare(value, this.max) <= 0;
                default:
                    return false;
            }
        }
    };
}


//////////////////////////////////////////////////////////////////////////////////////////
// The range type. 
//////////////////////////////////////////////////////////////////////////////////////////



/**
 * Test, if a value belongs to range.
 * - The options comparator "compare" takes precedence over the range comparator allowing
 * overriding the range comparison.
 * @template TYPE The type of the value.
 * @param {import("./modules.range").RangePojo<TYPE>} range The range of values.
 * @param {TYPE} value The tested value.
 * @param {import("./module.utils").Comparison<TYPE>} [options] The options for comparison.   
 * @returns {boolean} True, if and only if the value belongs to the range.
 */
function includesRange(range, value, options = undefined) {
    const compare = ( (options?.compare) ?? range.compare) ?? defaultCompare;
    if ("subRanges" in range) {
        return range.subRanges.some( (subRange) => (compare(subRange.min, value) <= 0 && compare(value, subRange.max) <= 0) );
    } else {
        return compare(range.min, value) <= 0 && compare(value, range.max) <= 0;
    }
};

//////////////////////////////////////////////////////////////////////////////////////////////////
// Comparison
//////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @inheritdoc
 * @typedef {import("./module.utils").ComparisonResult} ComparisonResult
 */

//////////////////////////////////////////////////////////////////////////////////////////////////
// Temporal
//////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * The output modes of the temporal stringification.
 * - "brief" mode is numbers.
 * - "standard" uses the ISO standard representation.
 * - "short" is the short form.
 * - "long" is a long format with every number converted to string and field to its 
 * name. 
 * - undefined is a basic default format.
 * @typedef {"brief"|"standard"|"short"|"long"|undefined} TemporalOutputMode
 */

/**
 * The temporal output modes as an array.
 * @type {TemporalOutputMode[]}
 */
export const temporalOutputModes = Object.freeze(["brief", "standard", "short", "long", undefined]);

/**
 * The canonical fields of dates in the order of descending magnitude.
 */
export const canonicalDateFieldNames = Object.freeze("era", "year", "season", "month", "day");

/**
 * The canoncial fields of times in the order of descending magnitude.
 */
export const canonicalTImeFieldNames = Object.freeze(["hour", "minute", "second", "millisecond", "microsecond"]);

/**
 * Canonical fields in the descending order of magnitude.
 */
export const canonicalTemporalFieldNames = Object.freeze([...canonicalDateFieldNames, ...canonicalTImeFieldNames]);

/**
 * Get the default range.
 * @template [CAUSE=any] The cause of the exception.
 * @template [ERROR=UnsupportedTemporalFieldException<CAUSE>] The error thrown in case of the unrecognized field.
 * @param {string} field The field name.
 * @param {(msg : string) => ERROR} [createError] The function creating the error. 
 * @param {Object} [param1] The optoins of the default range.
 * @param {string} [errorMessage] The error message.
 * @returns {Range<number>} The range of hte valid values.
 * @throws {ERROR} The given field is not recognized field.
 * @throws {TypeError} The ifeild was not a string.
 */
export function defaultRange(field, {
    errorMessage = undefined, createError = ((/** @type {string} */ fieldName, /** @type {string} */ message, /** @type {CAUSE|undefined} */ cause = undefined) => (new UnsupportedTemporalFieldException(fieldName, {message, cause})))}={}) {
    if (typeof field !== "string" && !("toString" in field)) {
        throw new TypeError("Invalid field name");
    }
    const fieldName = "toString" in field ? field.toString() : field;
    switch (fieldName) {
        case "day":
            // The default range of day is greater than 1.
            return createRange(1, Number.MAX_SAFE_INTEGER);
        case "year":
            // Day and year does have default range.
            return createRange(MIN_SAFE_INTEGER, MAX_SAFE_INTEGER);
    }
    if (canonicalDateFieldNames.includes(fieldName)) {
        return createRange(1, Number.MAX_SAFE_INTEGER);
    }
    return createError(fieldName, errorMessage);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Exceptions
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * An exception indicating the temporal type is invalid.
 * @template [CAUSE=any] The type of the cause.
 * @abstract
 */
export class UnsupportedTemporalTypeException extends RangeError {

    /**
     * The name of the unsupported field.
     * @type {string}
     */
    #sourceName; 

    /**
     * Create a new unsupported temporal type exception with given source value.
     * @param {string} sourceName The name of the unsupported field or unit.
     * @param {string} [message] The error message of the exception. Defaults to the "Unsupported temporal type" 
     * @param {CAUSE} [cause] The cause of the exception. 
     */
    constructor(sourceName, message="Unsupported temporal type", cause=undefined) {
        super(message, cause);
        this.name = this.constructor.name;
        this.#sourceName = sourceName;
    }

    /**
     * The name of the source of the error.
     */
    get sourceName() {
        return this.#sourceName;
    }
}

/**
 * The default exception options.
 * @template [CAUSE=any] The type of the error cause.
 * @typedef {Object} ExceptionOptions
 * @property {string} [message] The message of the exception.
 * @property {CAUSE} [cause] The cause of the exception.
 */

/**
 * The exception indicating the temporal field is not supported.
 * @template [CAUSE=any] The type of the error cause.
 * @extends {UnsupportedTemporalTypeException<CAUSE>}
 */
export class UnsupportedTemporalFieldException extends UnsupportedTemporalTypeException {

    /**
     * Create a new unsupported temporal field exception.
     * @param {string} fieldName The name of the invalid field.
     * @param {ExceptionOptions<CAUSE>} [options] 
     */
    constructor(fieldName, options={}) {
        super(fieldName, options.message ?? "Unsupported temporal field", options.cause);
    }

    /**
     * The invalid field name.
     */
    get fieldName() {
        return super.sourceName;
    }
}

/**
 * The exception indicating the temporal field is not supported.
 * @template [CAUSE=any] The type of the error cause.
 * @extends {UnsupportedTemporalTypeException<CAUSE>}
 */
export class UnsupportedTemporalUnitException extends UnsupportedTemporalTypeException {

    /**
     * Create a new unsupported temporal field exception.
     * @param {string} unitName The name of the invalid unit.
     * @param {ExceptionOptions<CAUSE>} [options] 
     */
    constructor(unitName, options={}) {
        super(unitName, options.message ?? "Unsupported temporal unit", options.cause);
    }

    /**
     * The invalid unit name.
     */
    get unitName() {
        return super.sourceName;
    }
}


/**
 * Converts the current temporal to its string representation.
 * @callback TemporalStringifier
 * @param {TemporalOutputMode} [mode] The mode of the stringification.
 * @param {string} [locale="en"] The locale of the stringification.
 * @returns {string} The string representation of the temporal.
 */

/**
 * The properties shared by the temporal objects.
 * @typedef {Object} TemporalPOJO 
 * @property {string} [reckoning] The reckoning the temporal uses. Defaults to the default
 * reckoning.
 * @property {boolean} [lenient=false] Is the temporal lenient. Defaults to false.
 * @property {number} [minValue] The smallest allowed value of the field.
 * @property {number} [maxValue] The largest allwoed value of the field.
 * @property {number} value The value of the temporal. This is always an integer. 
 * @property {"boundary"|"normalize"} [lenientStrategy="boundary"] The lenient strategy.
 * - "boundary" interpretes invalid value as closest boundary value without altering it.
 * - "normalize" changes the next more significant fields until the value is legal.
 */

/**
 * Get range of a field.
 * @callback GetRange
 * @param {string} [fieldName] The name of the field, whose valid value range for the temporal
 * is queried.
 * @returns {Range<number>} The range of valid values for the field name.
 * @throws {UnsupportedTemporalFieldException} The temporal field is not supported by the temporal.
 */

/**
 * Get given range refined by the current temporal.
 * @callback RefineRange
 * @param {Range<number>} sourceRange The range, whose boundaries are refined by the current temporal.
 * @param {string} [fieldName] The name of the field, whose valid value range for the temporal
 * is queried.
 * @returns {Range<number>} The range derived by limiting the source range by the limitations of the 
 * current temporal.
 * @throws {UnsupportedTemporalFieldException} The temporal field is not supported by the temporal.
 */

/**
 * The methods shared by the temporal objects.
 * @typedef {Object} TemporalMethods
 * @property {()=>number} valueOf Convert the temporal to its value. This value is the value
 * of the least significant field.
 * @property {TemporalStringifier} toString Convert the temporal to string representation.
 * @property {GetRange} range Get the valid value range.
 * @property {RefineRange} refineRange Get the given range refined by the temporal value.
 */

/**
 * The temporal options.
 * @typedef {TemporalPOJO & TemporalMethods} TemporalOptions
 */

/////////////////////////////////////////////////////////////////////////////////////////////
// Days
/////////////////////////////////////////////////////////////////////////////////////////////

/**
 * The properties specific to days.
 * @typedef {Object} DayProperties
 * @property {number} day the day value. Starts with 1.
 */

/**
 * The temporal value representing a day.
 * @typedef {DayProperties & TemporalMethods} Day
 */


/////////////////////////////////////////////////////////////////////////////////////////////
// Eras
/////////////////////////////////////////////////////////////////////////////////////////////

/**
 * The options of the era.
 * @typedef {Object} EraOptions
 * @property {string} name The name of the era.
 * @property {string} abbreviation The abbreviation of the era. This is used as year suffix.
 */

/**
 * Teh plain old object of the era.
 * @typedef {EraOptions} EraPojo
 */

/**
 * The era of years.
 * The default string representation of an era is its abbreviation.
 * @typedef {EraOptions & TemporalOptions} Era
 */

/**
 * The properties specific to the era.
 * @typedef {Object} TemporalEraOptionProperties
 * @property {readonly number} firstCanonicalYear The first canonical year of the era.
 * @property {readonly number} [lastCanonicalYear] The last canonical year of the era. Defaults to the value
 * calculated from minYear and maxYear.
 * @property {number} maxYear The largest year value of the era.
 * @property {number} [minYear=1] The smallest year value of the era.
 * @property {boolean} [ascendingYears=true] Are years in ascending order. 
 */

/**
 * Methods specific for era.
 * @typedef {Object} TemporalEraOptionMethods
 * @property {Converter<number, YearOfEra, RangeError>} createYear Creates a year of era from canonical year.
 * @property {Converter<number, CanonicalYear, RangeError>} createCanonicalYear Creates a canonical year from year of era.
 */

/**
 * The options of the temporal era. 
 * @typedef {Pick<TemporalPOJO, "reckoning"|"minValue"|"maxValue"> & TemporalEraOptionProperties & TemporalEraOptionMethods} TemporalEraOptions
 */

/**
 * Test the temporal value validity.
 * @param {number} value The tested value.
 * @param {Partial<import("./modules.range").Range<number>>|Pick<TemporalPOJO, "minValue"|"maxValue">} validValues The range f val
 */
function validValue(value, validValues) {
    if (!Number.isSafeInteger(value)) {
        return false;
    }
    if ("includes" in validValues) {
        return validValues.includes(value);
    } else if (["minValue", "maxValue"].some(prop in validValues)) {
        return (validValues.minValue === undefined || validValues.minValue <= value) && 
        (validValues.maxValue === undefined || validValues.maxValue >= value);
    } else {
        return false;
    }
}

/**
 * Create an era.
 * @param {string} name The name of the era.
 * @param {string} abbreviation The abbreviation of the era.
 * @param {number} value The value of the era.  
 * @param {TemporalEraOptions} options The options of the era.
 * @returns {Era} The era created from given values.
 */
export function createEra(name, abbreviation, value, options = {}) {
    if (!Number.isSafeInteger(value)) {
        throw new SyntaxError("Invalid era value");
    }
    if (typeof name !== "string") {
        throw new SyntaxError("Invalid era name");
    }
    if (typeof abbreviation !== "string") {
        throw new SyntaxError("Invalid era abbreviation");
    }
    if (options.lastCanonicalYear !== undefined && options.firstCanonicalYear !== undefined
        && options.minYear !== undefined && options.maxYear !== undefined
        && (BigInt(options.lastCanonicalYear) - BigInt(options.firstCanonicalYear) + 1n) !== (BigInt(options.minYear) - BigInt(options.maxYear) + 1n)) {
            throw new RangeError("Option lastCanonicalYear must comply with given firstCanonicalYear, minYear, and maxYear");
    }
    if (options.minValue !== undefined && value < options.minValue) {

    } else if (options.maxValue !== undefined && value > options.maxValue) {
        throw new RangeError("Invalid value of era");
    }

    return {
        name,
        abbreviation,
        value,
        get reckoning() {
            return options.reckoning;
        },
        get minValue() {
            return options.minValue ?? Number.MIN_SAFE_INTEGER;
        },
        get maxValue() {
            return options.maxValue ?? Number.MAX_SAFE_INTEGER;
        },
        get firstCanonicalYear() {
            return options.firstCanonicalYear ?? undefined;
        },
        get lastCanonicalYear() {
            return options.lastCanonicalYear === undefined
            ? this.firstCanonicalYear === undefined ? undefined : Math.min(Number.MAX_SAFE_INTEGER, BigInt(this.firstCanonicalYear) + BigInt(this.maxValue()) - BigInt(this.minValue()) +1n).valueOf()
            : options.lastCanonicalYear;
        },
        range(/** @type {Temporal|string} */ type) {
            const objectType = type instanceof Object;
            const typeName = objectType ? type.type : type;
            const minField = `min${typeName}`;
            const maxField = `max${typeName}`;
            return {
                min: options[minField] ?? Number.MIN_SAFE_INTEGER,
                max: options[maxField] ?? Number.MAX_SAFE_INTEGER,
                includes(value) {
                    return Number.isSafeInteger(value) && value >= this.min && value <= this.max;
                },
                refine(range) {

                }
            };
        },
        valueOf() {
            return this.value;
        },
        toString(mode = undefined) {
            switch (mode) {
                case "brief":
                case "standard":
                    return `${this.valueOf()}`;
                case "long":
                    return this.name;
                case "short":
                default:
                    return this.abbreviation;
            }
        }
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////
// Years
/////////////////////////////////////////////////////////////////////////////////////////////


/**
 * The type of a year.
 * @typedef {Object} YearOptions The year.
 * @property {Readonly<Era>} [era] The era of the year. If era does not
 * exist, the value is a canonical year.
 * @property {Readonly<number>} [canonicalYear] The canonical
 * year of the year. If this value is undefined, the year cannot be converted
 * to the canonical year. 
 * @property {Readonly<number>} year The year of era.
 */

/**
 * The type of a year.
 * @typedef {YearOptions & TemporalOptions} Year
 */

/**
 * The year of era.
 * @typedef {Required<YearOptions> & TemporalOptions} YearOfEra
 */

/**
 * The year representing a canonical year.
 * @typedef {Omit<YearOptions, "era"|"canonicalYear"> & { get cannonicalYear():number }} CanonicalYear
 */

/**
 * 
 * @param {number|Year|YearOfEra} year 
 * @param {*} options 
 * @param {Era} [options.era] The era of the year.
 * @returns 
 */
export function createYear(year, options={}) {
    if (options.era) {
        return /** @type {YearOfEra} */ era.createYear(year);
    } else if ("era" in year) {
        return /** @type {YearOfEra} */ {
            get era() {
                return year.era
            },
            get year() {
                return year.year;
            },
            get canonicalYear() {
                return year.CanonicalYear;
            }
        };
    } else {
        return createCanonicalYear(year);
    }
}

/**
 * Create a canonical year.
 * @param {number|Year|YearOfEra} year The source year.
 * @param {*} options 
 * @param {Era} [era] The era of the given source year.
 * @returns {CanonicalYear}
 */
export function createCanonicalYear(year, options={}) {
    const era = typeof year === "object" ? ("era" in year ? year.era : (options.era)) : options.era;
    const yearRange = (era?.range("year") ?? defaultRange("year"));
    const canonicalYear = (era == null ? (year.canonicalYear ?? year.year) : era.canonicalYear(year));
    switch (typeof year) {
        
        case "number":
            return {
                min: yearRange.min,
                max: yearRange.max,
                get year() {
                    return canonicalYear;
                }, 
                get cannonicalYear() {
                    return canonicalYear;
                },
                range(field="year") {
                    switch (fieldName) {
                        case "era":
                            if (era) {
                                return era.range();
                            } else {
                                break;
                            }
                        case "year":
                            return createRange(this.min, this.max);
                    }
                },
                refineRange(range, fieldName = "year") {
                    switch (fieldName) {
                        case "year":
                            return range.createRange(Math.max(this.year, range.min), Math.min(this.year, range.max));
                        default:
                            if (canonicalTemporalFieldNames.includes(fieldName)) {
                                return range;
                            } else {
                                throw new UnsupportedTemporalFieldException(fieldName);
                            }
                    }
                }
            }
        default:
    }
}

/**
 * @typedef {Object} CreateYearOptions
 * @property {string} [reckoning] The reckoning of the year. Defaults
 * to the reckoning of the era.
 * @property {Era} [era] The era of the year.
 */

/**
 * @typedef {Object} DayOfYearProperties
 * @property {Day} day The day of the year.
 * @property {Year|YearOfEra} year The year of the day.
 */

/**
 * Create a new year.
 * @param {number} value The value of the year. 
 * @param {CreateYearOptions} [options] The creation options. 
 * @returns {Year} The created year.
 * @throws {SyntaxError} Any option or value was invalid.
 */
export function createYear(value, options = {}) {
    if (typeof value === "number" && Number.isSafeInteger(value)) {
        if (options.era !== undefined) {
            const yearRange = options.era.range("Year");
            if (yearRange.includes(value)) {
                // The year value is invalid.
                if (options.lenient) {
                    if (options.lenientStrategy === "boundary") {
                        // Limiting the value to the boundary without changing it.
                        return {
                            get era() {
                                return options.era;
                            },
                            get value() {
                                return Math.min(Math.max(yearRange.min, value), yearRange.max);
                            },
                            get canonicalValue() {
                                return value;
                            },
                            valueOf() {
                                return this.value;
                            },
                            toString() {
                                return `${this.value}${this.era}`
                            }
                        }
                    } else {
                        // Strategy is normalization.

                    }
                } else {
                    // Invalid era.
                    throw new SyntaxError("Invalid year for era");
                }
            }
        } else {
            // The era does not exist.
            return {
                canonicalValue: value,
                get value() {
                    return this.canonicalYear;
                },
                toString(mode = undefined) {
                    return `${this.value < 1 ? `${1 - this.value}BCE` : `${this.value}CE`}`
                }
            }
        }
    } else {
        throw new SyntaxError("Invalid year value");
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Seasons
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @typedef {Object} SeasonOptions
 * @property {string} name The name of the season.
 * @property {string} [abbrev] The abbreviation of the season (if any)
 * @property {number} daysOfSeason The number of days the season contains.
 * @property {number} monthsOfSeason The number of months the season contains.
 * @property {Month[]} months The months of the season.
 */

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Months 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * A month. 
 * @typedef {Object} MonthOptions
 * @property {string} name The name of the month.
 * @property {number} [firstDay=1] The first day of month.
 * @property {number} daysOfMonth The number of days in the month.
 */

/**
 * The temporal representig a month.
 * @typedef {TemporalOptions & MonthOptions} Month
 */

/**
 * The options of the month creation.
 * @typedef {Object} CreateMonthOptions
 * @property {number} [shortLength=3] The number of characters the short format has.
 */

/**
 * Create a month.
 * @param {string} name The name of the month.
 * @param {number} value The value of the month.
 * @param {number} [daysOfMonth] The number of days of month.
 * @param {number} [shortLength=3] The number of characters the short format has. 
 * @param {Partial<Omit<TemporalOptions, KeysOf<TemporalMethods>>> & CreateMonthOptions} [options] The temporal options. 
 * @returns {Month} The created month.
 */
export function createMonth(name, value, daysOfMonth, shortLength = 3, options = {}) {
    const actualOptions = { shortLength: 3, ...options };
    if (actualOptions.minValue != null && actualOptions.minValue > value) {
        /**
         * @todo Add leniency handling.
         */
        throw new SyntaxError("Value beyond the minimal value");
    } else if (actualOptions.maxValue != null && value > actualOptions.maxValue) {
        /**
         * @todo Add leniency handling.
         */
        throw new SyntaxError("Value beyond the maximal value");
    }

    return {
        name,
        value,
        daysOfMonth,
        get recknoning() {
            return actualOptions.reckoning;
        },
        valueOf() {
            return this.value;
        },
        toString(mode = undefined) {
            switch (mode) {
                case "standard":
                case "brief":
                    return `${this.valueOf()}`;
                case "short":
                    return this.name.substring(shortLength);
                case "long":
                default:
                    return this.name;
            }
        },
        range(type) {
            const typeName = (type instanceof Object ? type.type : type);

            switch (typeName) {
                case "day":
                case "dayOfMonth":
                    return createRange(1, this.daysOfMonth);
                default:
                    return (typeName in actualOptions.fields ? actualOptions.fields[typeName] : undefined);
            }
        }
    }
}

/**
 * The options specific to the month of a specific year.
 * @typedef {Object} MonthOfYearOptions 
 * @property {Year} year The year of the month.
 * @property {Month} month The month of year.
 */

/**
 * The temporal representing a month of a year.
 * @typedef {TemporalOptions & MonthOfYearOptions} MonthOfYear
 */



/**
 * The properties specific to the days.
 * @typedef {Object} DayPOJO
 * @property {number} day The day value.
 */

/**
 * The options specific to the days.
 * @typedef {DayPOJO} DayOptions
 */

/**
 * The temporal representing a day.
 * @typedef {TemporalOptions & DayOptions} Day
 */

/**
 * 
 */
function ordinalSuffix(value) {
    if (value < 0) {
        return ordinalSuffix(-value);
    }
    const remainder = value % 100;
    if (remainder > 10 && remainder < 20) {
        return "th";
    } else {
        switch (remainder % 10) {
            case 1:
                return "st";
            case 2:
                return "nd";
            case 3:
                return "rd";
            default:
                return "th";
        }
    }
}

/**
 * Create a day.
 * @param {number} day The day of the created day.
 * @param {Partial<TemporalPOJO> & DayPOJO} [options] The day options.
 * @returns {Day}
 */
export function createDay(day, options = {}) {

    return {
        day,
        get reckoning() {
            return options.reckoning;
        },
        valueOf() {
            return day;
        },
        toString(mode = undefined) {
            switch (mode) {
                case "long":
                    return numberAsOrdinalText(this.day);
                case "normal":
                    return `${this.day}${ordinalSuffix(this.day)}`;
                default:
                    return `${this.day}`;
            }
        }
    };
}

/**
 * The options of the day of a year.
 * @typedef {Object} DayOfYearProperties
 * @property {Year} year The year the day belongs to.
 * @property {Day} day The day of the year.
 */

/**
 * The temporal representing a day of year.
 * @typedef {TemporalOptions & DayOfYearProperties} DayOfYear
 */

/**
 * The options specifir for day of months.
 * @typedef {Object} DayOfMonthProperties
 * @property {Month|MonthOfYear} month The month of the temporal.
 * @property {Day} day The day of the temporal.
 */

/**
 * The temporal representing a day of month.
 * @typedef {TemporalOptions & DayOfMonthProperties} DayOfMonth
 */

/**
 * The properties specific to the day of month of a year.
 * @typedef {Object} DayOfMonthOfYearProperties
 * @property {MonthOfYear} month The month of year.
 * @property {Day} day The day of month.
 */

/**
 * The day of month of a year.
 * @typedef {TemporalOptions & DayOfMonthOfYearProperties} DayOfMonthOfYear
 */

/**
 * The temporal interfaces for dates.
 * @typedef {Year|Month|Day|MonthOfYear|DayOfYear|DayOfMonth|DayOfMonthOfYear} DateTemporal
 */

/////////////////////////////////////////////////////////////////////////////
// Time of day
/////////////////////////////////////////////////////////////////////////////

/**
 * The era of day.
 * @typedef {Era} DayEra 
 */

/**
 * The eras of day.
 * @type {DayEra[]}
 */
export const dayEras = Object.freeze([createEra("Night", "am", 1, {
    minHour: 0, maxHour: 11
}), createEra("Day", "pm", 2)]);

/**
 * The hour specific properties.
 * @typedef {Object} HourProperties
 * @property {Era} [dayEra] The day era of the hour. Defaults to no day era, but 
 * whole 24h day.
 */

/**
 * A hour represents a single hour.
 * @typedef {TemporalOptions & HourProperties} Hour
 */

/**
 * 
 * @param {number} value The value of hour. 
 * @param {HourProperties & Pick<TemporalOptions, "reckoning">} [options] The hour options.
 */
export function createHour(value, options = {}) {

    return {
        value: options.era ? value % 12 : value % 24,
        get reckoning() {
            return options.reckoning;
        },
        valueOf() {
            return this.value;
        },
        toString(mode = undefined) {
            switch (mode) {
                case "brief":
                case "standard":
                    return `${options.era && this.value === 0 ? 12 : this.value}`;
                case "long":
                    return numberAsText(options.era && this.value === 0 ? 12 : this.value);
                default:
                    if (options.era) {
                        return `${this.value === 0 ? 12 : this.value} ${options.era.toString()}`
                    } else {
                        return `${this.value}`;
                    }
            }
        },

    };
}

/**
 * The temporal representing a temporal time.
 * @typedef {Object} TemporalTime
 * @property {DayEra} [dayEra] The era of the day.
 * @property {number|Hour} [hour=0] The hour. 
 * @property {number|Minute} [minute=0] The minute.
 * @property {number|Second} [second=0] The second.
 * @property {number|Millisecond} [millisecond=0] The milliseconds.
 * @property {number|Nanosecond} [nanosecond=0] The nanoseconds.
 */

/**
 * The local time zone properties.
 * @typedef {Object} LocalTimeProperties
 * @property {string} [localTimeZone] The local timezone name. If this value
 * is undefined, the local time cannot be converted to UTC time.  
 */

/**
 * @typedef {TemporalTime & LocalTimeProperties} LocalTime
 */

/**
 * The properties of a timezone determined by an offset time.
 * @typedef {Object} OffsetProperties
 * @property {number} hours
 * @property {number} [minutes=0]
 */

/**
 * The time zone properties.
 * @typedef {Object} ZonedTimeProperties
 * @property {string} timeZone The name of the time zone.
 * @property {string} abbreviation The abbreviation of the time zone.
 * @property {boolean} [daylightSaving] The daylight saving.
 * @property {OffsetProperties} offset The offset of the time zone.
 */

/**
 * @typedef {OffsetProperties|ZonedTimeProperties} ZonedTimeProperties
 */

/**
 * @typedef {TemporalTime & ZonedTimeProperties} ZonedTime
 */

/**
 * Create a temporal time.
 * @todo Parameters for the temporal time creation
 */
export function createTemporalTime() {
    /**
     * @todo Create the temporal time value.
     */
}

/**
 * A temporal having both date and time.
 * @typedef {DateTemporal & TemporalTime} TemporalDateTime
 */

/////////////////////////////////////////////////////////////////////////
// Generic temporals and reckonings
/////////////////////////////////////////////////////////////////////////

/**
 * The temporal data types.
 * @typedef {DateTemporal| TemporalTime | TemporalDateTime} Temporal
 */

/**
 * A temporal reckoning combines operations shared by the temporal reckonings allowing
 * easier implementation of reckonings.
 * @abstract
 */
export class TemporalReckoning {


    /**
     * The month names.
     * @type {string[]} The month names. If leap months exists, they are listed
     * after the normal year in the order of possible appearance. 
     */
    get monthNames() {
        throw new TypeError("Abstract property monthNames not implemented");
    }

    /**
     * The name of the reckoning.
     * @type {string} The name of the reckoning.
     */
    #reckoning = undefined;

    /**
     * The parent reckoning.
     * @type {TemporalReckoning}
     */
    #parent;

    /**
     * The start of year.
     */
    #startOfYear;

    /**
     * The leap day.
     */
    #leapDay;

    /**
     * The reckoning name.
     * @param {string} name The name of the reckoning.
     * @param {Object} [options] The options of the  temporal reckoning.
     * @param {TemporalReckoning} [options.parent] The parent reckoning used for base values.
     * @param {DayOfYear|number|DayOfMonthOfYear|Day} [options.startOfYear=1] The start of year.
     * @param {Day} [options.leapDay] The leap day of the year. Defaults to the last day of year.
     */
    constructor(name, options = {}) {
        this.#reckoning = name;
        this.#parent = options.parent;
        this.#leapDay = options.leapDay ?? (this.getMonthsOfYear("normal").reduce((result, month) => {
            result.value += month.daysOfMonth;
            return result;
        }, { value: 0 }).value);
        this.#startOfYear = (typeof options.startOfYear === "number"
            ? this.createDay(options.startOfYear)
            : this.convertToYearDay(options.startOfYear) ?? this.createDay(1));
    }

    /**
     * The leap day of year.
     * @type {Day}
     */
    get leapDay() {
        if (this.#leapDay != null) {
            // The leap day is given.
            return this.#leapDay;
        } else {
            // Calculating the leap day.
            const months = this.getMonthsOfYear("normal");
            return this.createDay(months[0].daysOfMonth + months[1].daysOfMonth);
        }
    }

    /**
     * Get the day of year.
     * @param {DayOfMonthOfYear|DayOfYear|Day|DayOfMonth} value The converted value.
     * @returns {Day} The day of year as a day.
     */
    convertToYearDay(value) {
        const countSumIf = (list, condition, evaluator = ((item) => (item.value)), baseValue = 0) => (list.reduce((result, item) => {
            if (condition(item)) {
                result.value += evaluator(item);
            }
            return result;
        }, { value: baseValue }).value);
        if ("year" in value) {
            if ("season" in value) {
                // The season of year or month of season or day of season.
                return countSumIf(
                    this.getSeasonsOfYear(this.getTypeOfCanonicalYear(value.year.canonicalYear)),
                    (season) => (season.valueOf() < value.season.valueOf()),
                    (season) => (season.daysOfSeason),
                    countSumIf(
                        this.getMonthsOfSeason(value.season),
                        (month) => (month.valueOf() < value.month?.valueOf() ?? 1),
                        (month) => (month.daysOfMonth),
                        value.day?.valueOf() ?? 1
                    )
                );
            } else if ("month" in value) {
                // THe month of year
                return this.createDay(
                    countSumIf(
                        this.getMonthsOfYear(this.getTypeOfYear(year.canonicalValue)),
                        ( /** @type {Month} */ item) => (item.valueOf() < value.month.valueOf()),
                        ( /** @type {Month} */ item) => (item.daysOfMonth), value.day.valueOf() ?? 1)
                );
            } else if ("day" in value) {
                return this.createDay(value.day?.valueOf() ?? 1);
            }
        } else if ("season" in value) {
            /**
             * @todo Season support.
             */
        } else if ("month" in value) {
            return this.createDay(
                countSumIf(
                    this.getMonthsOfYear("year" in value.month ? this.getTypeOfYear(value.month.year.canonicalYear) : undefined),
                    ( /** @type {Month} */ item) => (item.valueOf() < value.month.valueOf()),
                    ( /** @type {Month} */ item) => (item.daysOfMonth), value.day.valueOf() ?? 1)
            );
        } else if ("day" in value) {
            return this.createDay(value.day);
        }
        throw new SyntaxError("Cannot convert value to day of year");
    }

    /**
     * The reckoning of the temporal reckoning.
     */
    get reckoning() {
        if (this.#reckoning) {
            return this.#reckoning;
        } else if (this.#parent) {
            return this.#parent.reckoning;
        } else {
            throw new TypeError("Abstract property reckoning not implemented");
        }
    }

    /**
     * Get the first canonical day of year.
     * @returns {Day} The first canonical day of a normal day.
     */
    get firstCanonicalDayOfYear() {
        return this.#startOfYear;
    }

    /**
     * The first canonical day of year of the actual day of year of the reckoning.
     * @returns {Day} The first day of year. 
     */
    get startOfYear() {
        return this.#startOfYear;
    }

    /**
     * Create a new era of the reckoning.
     * @param {string} name The name of the era.
     * @param {string} abbrev The abbreviation of the era.
     * @param {number} value The value of the era.
     * @param {Omit<TemporalEraOptions, "reckoning">} [options] 
     * @returns {Era} The era created with given values.
     */
    createEra(name, abbrev, value, options = {}) {
        return createEra(name, abbrev, value, { ...options, reckoning: this.reckoning });
    }

    /**
     * Create a new year of reckoning
     * @param {number|Year} year The created year.
     */
    createYear(year, options = {}) {
        return createYear(year, { ...options, reckoning: this.reckoning });
    }

    /**
     * Create a month of the reckoning.
     * @param {string} name The name of the month.
     * @param {number} value The value of the month.
     * @param {number} daysOfMonth The number of days in the month.
     * @param {Omit<CreateMonthOptions, "reckoning">} options The options of the month.
     * @returns {Month}
     */
    createMonth(name, value, daysOfMonth, options = {}) {
        return createMonth(name, value, daysOfMonth, undefined, { ...options, reckoning: this.reckoning });
    }

    /**
     * Create a day of the reckoning.
     * @param {number} day The day value.
     * @returns {Day} The day of the current reckoning.
     */
    createDay(day) {
        return createDay(day, { reckoning: this.reckoning });
    }

    /**
     * Is a canonical year a leap year.
     * @param {number} year The canonical year of the calendar.
     * @returns {boolean} True, if and only if the year is a leap year.
     */
    isLeapYear(year) {
        if (this.startOfYear.value > this.leapDay) {
            return this.getTypeOfCanonicalYear(year + 1) === "leap";
        } else {
            return this.getTypeOfCanonicalYear(year) === "leap";
        }
    }

    /**
     * Get the type of a canonical year.
     * @param {number} year The canonical year.
     * @returns {string} The type of the year.
     */
    getTypeOfCanonicalYear(year) {
        throw new Error("Abstract method getTypeOfYear not implemented");
    }

    /**
     * Get type of a year reckoning.
     * @param {number} year The year of the reckoning.
     */
    getTypeOfYear(year) {
        return this.getTypeOfCanonicalYear(year + (this.#startOfYear >= this.leapDay))
    }

    /**
     * Get months of year.
     * @param {string} [yearType] The year type. Defaults to the default year type of the reckoning.
     * @returns {Month[]|undefined} The months of the year of the type, or an undefined
     * value for an unknown year type.
     * @abstract
     */
    getMonthsOfYear(yearType = undefined) {
        throw new Error("Abstract method getMonthsOfYear not implemented");
    }
}

/**
 * A class representing a Gregorian reckoning.
 */
export class GregorianReckoning extends TemporalReckoning {

    /**
     * The name of the reckoning.
     */
    static NAME = "Gregorian";

    /**
     * The months of the normal year. 
     */
    static months = [
        ["January", 31], ["February", 28], ["March", 31], ["April", 30], ["May", 31], ["June", 30], ["July", 31],
        ["August", 31], ["September", 30], ["October", 31], ["November", 30], ["December", 31]].map(
            ([name, daysOfMonth], index) => createMonth(name, index + 1, daysOfMonth)
        );

    static monthNames = GregorianReckoning.months.map(month => (month.name));

    /**
     * The year types of the reckoning.
     */
    static yearTypes = ["normal", "leap"];

    /**
     * The months of year of year types. 
     * @type {Record<"normal"|"leap", Month[]>}
     */
    static monthsOfYear = {
        get normal() {
            return GregorianReckoning.months;
        },
        leap: GregorianReckoning.months.map(month => (month.value === 2 ? createMonth(month.name, month.value, month.daysOfMonth + 1) : month))
    }

    /**
     * Is the given year a leap year.
     * @param {number} year The year value.
     * @returns {boolean} True, if and only if the given year is a leap year.
     */
    static isLeapYear(year) {
        return typeof year === "number" && Number.isSafeInteger(year) &&
            (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0));
    }

    /**
     * Create new Gregorian Reckoning.
     * @param {Object} param0 The construction options.
     * @param {string} [param0.reckoning] THe name of the reckoning. Defalts to the Gregorian Reckoning name.
     * @param {DayOfYear|number|DayOfMonthOfYear|Day} [param0.startOfYear=1] The start of year.
     * @param {Day} [param0.leapDay] The leap day as day of the year withut linking to year. The
     * default value is the first day of the third month (1st of March).
     */
    constructor({ startOfYear = 1, leapDay = undefined, reckoning = GregorianReckoning.NAME }) {
        super(reckoning, { startOfYear, leapDay: leapDay ?? (31 + 28) });
    }

    get monthNames() {
        return GregorianReckoning.monthNames;
    }

    /**
     * Get the months of the year of the given type.
     * @param {"normal"|"leap"} [yearType] The year type. Defaults to "normal".
     * @returns {Month[]|undefined} 
     */
    getMonthsOfYear(yearType = "normal") {
        return Object.getOwnPropertyNames(GregorianReckoning.monthsOfYear).includes(yearType) ?
            GregorianReckoning[yearType] : undefined;
    }

    /**
     * Get the type of the year for Julian Calendar.
     * @param {number} year The canonical Julian year. 
     * @returns {"normal"|"leap"} The type of the year. 
     */
    static getTypeOfYear(year) {
        return GregorianReckoning.isLeapYear(year) ? "leap" : "normal";
    }

    getTypeOfCanonicalYear(year) {
        return GregorianReckoning.getTypeOfYear(year);
    }
}

/**
 * Is the given year a leap year for gregorian recknoning.
 * @param {number} year The year value.
 * @returns {boolean} True, if and only if the given year is a Gregorian leap year.
 */
export function isGregorianLeapYear(value) {
    return GregorianReckoning.isLeapYear(value);
}

/**
 * The julian reckoning.
 */
export class JulianReckoning extends GregorianReckoning {
    /**
      * The name of the reckoning.
      */
    static NAME = "Julian";

    /**
     * Create a new Julian reckoning with given start of year, reckoning name, and leap day.
     * 
     * @param {Object} param0 The construction options.
     * @param {string} [param0.reckoning] THe name of the reckoning. Defalts to the Gregorian Reckoning name.
     * @param {DayOfYear|number|DayOfMonthOfYear|Day} [param0.startOfYear=1] The start of year.
     * @param {Day} [param0.leapDay] The leap day as day of the year withut linking to year. The
     * default value is the first day of the third month (1st of March).
     */
    constructor({ startOfYear = 1, reckoning = JulianReckoning.NAME, leapDay = undefined }) {
        super({ reckoning, startOfYear, leapDay });
    }

    /**
     * Get the type of the year for Julian Calendar.
     * @param {number} year The canonical Julian year. 
     * @returns {"normal"|"leap"} The type of the year. 
     */
    static getTypeOfYear(year) {
        return JulianReckoning.isLeapYear(year) ? "leap" : "normal";
    }
    /**
     * Is a year a leap year.
     * @param {number} year The canonical year of the reckoning.
     * @returns {boolean} True, if and only if the year is a leap year.
     */
    static isLeapYear(year) {
        if (+(this.startOfYear) > +(this.leapDay)) {
            return (year + 1) % 4 === 0;
        } else {
            return (year % 4) === 0;
        }
    }

    getTypeOfCanonicalYear(year) {
        return JulianReckoning.getTypeOfYear(year);
    }
}

/**
 * The hermetic reckoning using Ariesian Years.
 */
export class HermeticRecknoning {

    /**
     * The name of the Hermetic recknoning.
     */
    static NAME = "Hermetic";

    /**
     * The names of the Zodiac calendar months starting from the Spring equinox.
     */
    static monthNames = [
        "Aries", "Taurus", "Gemini",
        "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius",
        "Capricorn", "Aquarius", "Pisces"];

    /**
     * Create a Hermetic Era.
     * @param {number} value The era value. The era 1AD is value 0. 
     * @returns {Era} The hermetic era.
     */
    static createEra(value) {
        const eraLength = 2150;
        const monthCount = this.monthNames.length;
        const nameIndex = (monthCount + (value % monthCount)) % monthCount;
        return createEra(HermeticRecknoning.monthNames[nameIndex],
            `${HermeticRecknoning.monthNames[nameIndex]}${value > 0 && value <= monthCount ? "" : `(${Math.floor(value / monthCount)})`}`, value, {
            reckoning: HermeticRecknoning.NAME,
            minYear: 1, maxYear: eraLength
        });
    }

    /**
     * The ariesian year monhts.
     */
    static months = Object.freeze([
        19 + 31 - 21 + 1, // Aries
        20 + 30 - 20 + 1, // Taurus
        20 + 31 - 21 + 1, // Gemini
        22 + 30 - 21 + 1, // Cancer
        22 + 31 - 23 + 1, // Leo
        22 + 31 - 23 + 1, // Virgo
        22 + 30 - 23 + 1, // Libra
        21 + 31 - 23 + 1, // Scorpius
        21 + 30 - 22 + 1, // Sagittarius
        19 + 31 - 22 + 1, // Capricorn
        18 + 28 - 20 + 1, // Aquarius
        20 + 31 - 19 + 1 // Pisces

    ].map(
        (daysOfMonth, index) => (createMonth(ariesianMonthNames[index], index + 1, daysOfMonth))
    ));

    /**
     * The months of years.
     * @type {Record<"normal"|"leap", Month[]>}
     */
    static monthsOfYears = Object.freeze({
        get normal() {
            return HermeticRecknoning.months;
        },
        leap: Object.freeze(ariesianMonths.map(month => (month.value === 12 ? createMonth(
            month.name, month.value, month.daysOfMonth + 1, 3, {
            recknoning: "Hermetic"
        }
        ) : month)))
    });


}
/**
 * The gregorian normal year months. 
 */
const gregorianMonths = [
    ["January", 31], ["February", 28], ["March", 31], ["April", 30], ["May", 31], ["June", 30], ["July", 31],
    ["August", 31], ["September", 30], ["October", 31], ["November", 30], ["December", 31]].map(
        ([name, daysOfMonth], index) => createMonth(name, index + 1, daysOfMonth)
    );


/**
 * The gregorian leap year month.s
 */
const gregorianLeapMonths = gregorianMonths.map(
    month => (month.value === 2 ? createMonth(month.name, month.value, month.daysOfMonth + 1) : month));



