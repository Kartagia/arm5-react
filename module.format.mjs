
/**
 * The module containing formatting related typedefs and utility functions.
 * @module utils/format
 */

/**
 * The type of the formatting. 
 * @typedef {"short"|"medium"|"long"|"full"} FormatType
 */

/**
 * The formatting options.
 * @typedef {Object} FormattingOptions
 * @property {FormatType} [format="long"] The format type.
 */

export const PLACEHOLDER_REGEX = {
    /**
     * The Python regular rexpression for placeholders with single capturing group selecting the placeholder.
     */
    get Python() {
        return new RegExp("(\\{(?:(?:\\d+)|(?:\\w+))?(?::(?:[^\\d\\}\\.]+)?(?:(?:\\d+)?\\.(?:\\d+)?)?)?\\})");
    },
    /**
     * The python regular expresison for placeholders with capturing groups.
     * The optional capturing groups:
     * - index: The placeholder index.
     * - field: The placeholder field.
     * - options: The formatting options.
     * - length: The length of the format.
     * - precision: The precision of the format.
     */
    get PythonPlaceholderSegment() {
        return new RegExp("\\{(?:(?<index>\\d+)|(?<field>\\w+))?(?::(?<options>[^\\d\}\\.]+)?(?:(?<length>\\d+)?\\.(?<precision>\d+)?)?)?\\}");
    }
};

export const PYTHON_PLACEHOLDER_REGEX = () => {

};

/**
 * @callback FormatMethod
 * @param {...TYPE} values The values of the placeholders.
 * @returns {string} The formatted string.
 * @throws {SyntaxError} Any value was invalid for the placeholders.
 */

/**
 * Format with object properties.
 * @template {TYPE extends Object} TYPE The formatted type.
 * @callback ObjectFormatMethod 
 * @param {TYPE} value The formatted value.
 * @returns {string} The formatted string.
 * @throws {SyntaxError} Any property of the object was invalid.
 * @throws {TypeError} The value was not of proper type.
 */

/**
 * @template {T extends Object} [T=Object] 
 * @typedef {Object} MessageFormat
 * @property {FormatMethod<any>} format The values of the placeholders.
 * @property {ObjectFormatMethod<T>} formatObject Formats with object properties.
 */

/**
 * Test a value.
 * @template TYPE
 * @callback Predicate
 * @param {TYPE} tested The tested value.
 * @returns {boolean} True, if and only if the tested fulfils the predicate.
 */

/**
 * Format positional parameters.
 * @template TYPE The value type of the positional parameters.
 * @callback FormatMethod
 * @param {...TYPE} values The values of the placeholders.
 * @returns {string|Placeholder<Object>} The formatted string.
 * @throws {SyntaxError} Any value was invalid for the placeholders.
 */

/**
 * Format with object properties and positional parameters.
 * The object is used as source of the named fields. 
 * @template {TYPE extends Object} TYPE The formatted type.
 * @callback ObjectFormatMethod
 * @param {TYPE} value The formatted value object. 
 * @param {...any} positional The positional values. 
 * @returns {string|Placeholder<Partial<TYPE>>} The formatted string or a placeholder
 * with remaining placeholders.
 * @throws {SyntaxError} Any property of the object was invalid.
 * @throws {SyntaxError} Any positional value was invalid.
 * @throws {TypeError} The type or class of the object was invalid.
 */
/**
 * A message format represents a format.
 * @template {T extends Object} [T=Object]
 * @typedef {Object} MessageFormat
 * @property {FormatMethod<any>} format The values of the placeholders.
 * @property {ObjectFormatMethod<T>} formatObject Formats with object properties.
 */

/**
 * The integer checking options.
 * @typedef {Object} CheckIntegerOptions
 * @property {Predicate<number>} [validator] The validator of the value.
 * @property {boolean} [allowNegative=true] Does the check allow negative values.
 * @property {boolean} [allowPositive=true] Does the check allow positive values.
 * @property {boolean} [allowZero=true] Does the check allow zero.
 * @property {boolean} [allowUnsafe=false] Does the check allow unsafe integers.
 */

/**
 * Check an optional integer.
 * @param {any} value 
 * @param {CheckIntegerOptions} [options] The options of the check. 
 * @returns {number|undefined} An undefined value, if the value was undefined. Otherwise the safe
 * integer. 
 * @throws {SyntaxError} The value was not an integer.
 */
export function checkOptionalInteger(value, options = {}) {
    const { validator = () => (true), allowNegative = true, allowPositive = true, allowZero = true, allowUnsafe = false } = options;

    switch (typeof value) {
        case "undefined":
            return undefined;
        case "string":
            value = Number(value);
        case "number":
            if (!(allowUnsafe ? Number.isInteger(value) : Number.isSafeInteger(value))) {
                throw new SyntaxError(`The value was not a${allowUnsafe ? "n" : " safe"} integer`);
            } else if (!allowNegative && value < 0) {
                throw new SyntaxError("Negative integers not allowed");
            } else if (!allowZero && value === 0) {
                throw new SyntaxError("Zero is not allowed");
            } else if (!allowPositive && value > 0) {
                throw new SyntaxError("Positive values are not allowed");
            } else if (!validator(value)) {
                throw new SyntaxError("Invalid value");
            } else {
                return value;
            }
        case "object":
            if (value === null) {
                throw new SyntaxError(`The null cannot be converted to an integer`);
            } else if (value instanceof String) {
                return checkOptionalInteger(value.toString(), options);
            } else if (value instanceof Number) {
                return checkOptionalInteger(value.valueOf(), options);
            } else if ("valueOf" in value) {
                try {
                    return checkOptionalInteger(Number(value.valueOf()), options);
                } catch (error) {
                    // The value of does not produce result.
                    throw new SyntaxError(`The class of ${value.constructor.name} does not have suitable numeric value`, { cause: error });
                }
            }
        default:
            throw new SyntaxError(`The type of ${typeof value} cannot be converted to an integer`);
    }
}

/**
 * Get a valid integer value of the parameter.
 * The strings are converted to numbers, and object valueOf is converted to number before
 * checking validity as a number.
 * @param {any} value The value converted to an integer.
 * @param {CheckIntegerOptions} options 
 * @returns {number} The valid integer passing the check.
 * @throws {SyntaxError} The value was not a valid integer.
 */
export function checkInteger(value, options = {}) {
    if (value === undefined) throw new SyntaxError("An undefined value not allowed");
    else return checkOptionalInteger(value, options);
}

/**
 * A placeholder value given later.
 * @template {TYPE} [TYPE = any] The type of the placeheld value. 
 */
export class Placeholder {

    /**
     * Parse option string.
     * @param {string} options The options.
     * @returns {Map<string, boolean>} The record from option code points to boolean value.
     * @throws {TypeError} The options was not a string, a String, nor an object JSONifiable to
     * a JSON string.
     * @throws {SyntaxError} The options contained a duplicate option code point.
     */
    static parseOptions(options) {
        /**
         * The record options.
         * @type {Map<string, boolean>}
         */
        const result = new Map();
        let source;
        switch (typeof options) {
            case "string":
                source = options;
                break;
            case "object":
                if (options != null) {
                    if (options instanceof String) {
                        // The sourse can be conerted to string.
                        source = options.toString();
                    } else if (toJSON in options && /^\"(?:[^\\"]+|\\.)*\"$/.test(options.toJSON())) {
                        // Object converted to a JSON string.
                        source = JSON.parse(options.toJSON());
                    }
                }
            default:
                // Invalid options structure.
                throw new TypeError("Invalid options source");
        }
        source.split(/(?:)/u).forEach((codePoint, index) => {
            const key = String.fromCodePoint(codePoint);
            if (result.has(key)) {
                throw new SyntaxError(`Duplicate option ${key}`);
            } else {
                result.set(key, true);
            }
        });
        return result;
    }

    /**
     * Create a new placeholder.
     * @param {Record<string, string|number>} param0
     * @param {number} [parma0.index] The index of the placeholder.
     * @param {string} [param0.field] The field name of the placeholder.
     * @param {number} [length] The maximum length of the formatted value.
     * @param {number} [precision] The maximum precision of the formatted value.
     * @param {Map<string, Predicate<any>>} [knownOptions] The mapping from known option names to the 
     * option value validator function.
     * @param {string|Map<string, any>} [options] The options of the placeholder.
     */
    constructor({
        /** @type {string|number|undefined}*/ index = undefined,
        /** @type {string|undefined}*/ field = undefined,
        /** @type {string|number|undefined}*/ length = undefined,
        /** @type {string|number|undefined}*/ precision = undefined,
        /** @type {string}*/ type = "general",
        /** @type {string|undefined}*/ options = undefined },
        knownOptions = undefined) {
        /**
         * The index of the placeholder value.
         * @type {number|undefined}
         */
        this.index = checkOptionalInteger(index);

        /**
         * The field name of the named placeholder.
         */
        this.field = field;

        /**
         * The lenght of the placeholder value.
         * @type {number|undefined}
         */
        this.length = checkOptionalInteger(length);
        /**
         * The precision of the placeholder value.
         * @type {number|undefined}
         */
        this.precision = checkOptionalInteger(precision);
        [[index, "index"], [precision, "precision"], [length, "length"]].forEach(
            ([value, property]) => {
                if (value != undefined) {
                    this[property] = Number(value);
                    if (!Number.isSafeInteger(this[property])) {
                        throw new RangeError(`The ${property} must be a safe integer`);
                    } else if (this[property] < 0) {
                        throw new RangeError(`The ${property} must be a non-zero integer`);
                    }
                }
            }
        );
        /**
         * The mapping from known option names to the option value validators.
         * @type {Map<string, Predicate<any>>}
         */
        this.knownOptions = knownOptions === undefined ? null : knownOptions;

        /**
         * The options of the placeholder.
         * @type {Map<string, any>}
         */
        this._options = new Map();

        /**
         * The otions of the placeholder.
         * @type {Map<string, any>}
         */
        this.options = options === undefined ? /** @type {Map<string, any>} */ new Map() : options;
        return this;
    }

    /**
     * Parse option string.
     * @param {string} options The options.
     * @returns {Map<string, any>} The record from options to option values.
     * @throws {TypeError} The options was not a string, a String, nor an object JSONifiable to
     * a JSON string.
     * @throws {SyntaxError} The options contained a duplicate option.
     */
    parseOptions(options) {
        return Placeholder.parseOptions(options);
    }

    /**
     * Does the placeholder allow unknown options.
     * @type {boolean}
     */
    get allowUnknownOptions() {
        return this.knownOptions === null;
    }

    /**
     * Get a valid option mapping.
     * @param {Map<string, any>} optionMap The checked option map.
     * @returns {Map<string, any>} The valid option mapping derived from the option map.
     * @throws {SyntaxError} The option map contained an invalid option or value.
     * @throws {TypeError} The type of the option map was invalid.
     */
    checkOptions(optionMap) {
        if (typeof optionMap === "object" && optionMap !== null && optionMap instanceof Map) {
            return ([...optionMap.entries()].reduce((result, [option, value], index) => {
                if (typeof option !== "string") {
                    throw new SyntaxError(`Non-string option at index ${index}`);
                } else if (option.trim().length === 0) {
                    throw new SyntaxError("An empty option is not allowed");
                } else if (this.knownOptions == null) {
                    // All non-empty string options are valid.
                    result.set(option, value);
                } else if (this.knownOptions.has(option)) {
                    // The option has validator.
                    if (this.knownOptions.get(option)(value)) {
                        result.set(option, value);
                    } else {
                        throw new SyntaxError(`Invalid option ${option} value`);
                    }
                } else if (this.allowUnknownOptions) {
                    // Unknown option values are not validated, but assumed true.
                    result.set(option, value);
                } else {
                    throw new SyntasError(`Unkown option ${option}`);
                }
                return result;
            }, /** @type {Map<string, any>} */ new Map()));
        } else {
            throw new TypeError("Invalid options");
        }
    }

    /**
     * The options of the placeholder formatting.
     * @type {Map<string, any>}
     */
    get options() {
        return this._options;
    }

    /**
     * 
     * @param {string|Map<string, any>} newOptions The new options of the placeholder.
     * @throws {SyntaxError}
     * @throws {TypeError}
     */
    set options(newOptions) {
        switch (typeof newOptions) {
            case "string":
                this._options = this.checkOptions(this.parseOptions(newOptions));
                break;
            case "object":
                if (newOptions instanceof Map) {
                    this._options = this.checkOptions(newOptions);
                    break;
                }
            default:
                throw new TypeError("Invalid new options");
        }
    }

    /**
     * The type check. If undefined or null, no type checking is perfomred for the source.
     * @type {Predicate<Object>|undefined|null}
     */
    get sourceTypeCheck() {
        return null;
    }

    /**
     * 
     * @param {string} type The value type.
     * @returns {number} The base number for a nubmer of type.
     */
    baseNumberOfType(type) {
        switch (type) {
            case "binary":
                return 2;
            case "octal":
                return 8;
            case "hex":
                return 16;
            case "decimal":
            case "fixed":
            case "scientific":
                return 10;
            default:
                ;
        }
    }

    /**
     * 
     * @param {string|number} formatted The formatted value.
     * @param {{precision: number?, length: number?, base: number=16, prefix: string="", suffix: string="", fill: string="", 
     * align: string = "", nonNegativeSign: string = ""}} options The formatting options.
     */
    formatInteger(formatted, options = {}) {
        const { precision = undefined, length = undefined, base = 16,
            prefix = "", suffix = "", fill = "", align = "right",
            nonNegativeSign = "",
            formatOptions = {}
        } = options;
        let source, sign;
        switch (typeof formatted) {
            case "number":
                source = checkInteger(formatted, formatOptions).toString(base);
                sign = Math.sign(formatted);
                sign = (sign < 0 ? "-" : nonNegativeSign);
                break;
            case "string":
                const regex = new RegExp("^(?<sign>[+-]?)?(?<digits>[" + "012345679abcdefghijklmnopqrstuvwxyz".substring(0, base) + "]+)$", "i");
                const match = regex.exec(source);
                if (match) {
                    sign = (match.groups("sign") === "-" ? "-" : nonNegativeSign);
                    source = match.groups("digits");
                    break;
                }
            default:
                throw new SyntaxError("Invalid formatted value");
        }
        const signStr = (sign < 0 ? "-" : nonNegativeSign);
        const actualLength = (length == undefined ? source.length : length) - signStr.length;
        const actualPrecision = (precision == undefined ? source.length : precision) - signStr.length;
        const fillStr = fill.repeat(Math.min(actualLength, actualPrecision) - source.length);
        if (formatted.length < length) {
            const width = Math.max(0, Math.min(actualLength, actualPrecision));
            return `${prefix}${align === "signFirst" ? signStr : ""}${
                align === "left" ? fillStr : (align === "center" ? fillStr.substring(0, Math.ceil(fillStr.length / 2)):"")
            }${
                align !== "signFirst" ? signStr : ""
            }${source.substring(0, Math.min(actualLength, actualPrecision))}${
                align === "right" ? fillStr : (align === "center" ? fillStr.substring(Math.ceil(fillStr.length / 2)):"")
            }${suffix}`;
        } else if (formatted.length > length) {
            return `${prefix}${formatted.substring(0, length)}${suffix}`;
        } else {
            return `${prefix}${formatted}${suffix}`;
        }
    }

    formatValue(value) {
        const type = this.options.get("type") || "general";
        /**
         * Keep the same case.
         * @param {string} val The converted value.
         * @returns {string} The value as it is.
         */
        const sameCaseFunction = (val) => (val);
        /**
         * Convert value to upper case.
         * @param {string} val The converted value.
         * @returns {string} The value as upper case.
         */
        const upperCaseFunction = (val) => (val.toUpperCase());
        let valueCaseFunction = sameCaseFunction;

        let numberValueFunc;

        switch (type) {
            case "binary":
            case "decimal":
            case "octal":
            case "hex":
                valueCaseFunction = (this.options.get("upperCase") ? upperCaseFunction : sameCaseFunction);
                return valueCaseFunction(this.formatInteger(value, {precision, length, fill: this.options.fill, base: this.baseNumberOfType(type), allowNegative: false}));
            case "unicode":
                if (typeof value !== "bigint" && !Number.isInteger(value)) {
                    throw new SyntaxError("Value is not an integer");
                } else if (value < 0) {
                    throw new SyntaxError("Negative values does not have unicode representation");
                }
                
                numberValueFunc = (val) => (formatNumber(val.toString(16), { precision, width }));
                return valueCaseFunction(numberValueFunc(val));
            case "number":
            case "fixed":
            case "scientific":
                if (typeof value !== "number") throw new SyntaxError("Only numeric values have scientfic notation");
            case "general":
                return (typeof value === "number" ? `${(this.options.get("upperCaseExponent") ? (val) => (val.toUpperCase()) : (val) => (val))(value.toExponential(
                    this.options.get("precision")))}`
                    :
                    "" + value);
            default:
                return "" + value;
        }
    }

    format(value) {
        if (this.field == null) {
            // Formatting the value according to the formatting.
        } else {
            // The named placeholder does not change. 
            return this;
        }
    }

    formatObject(source, value) {
        if (!(source instanceof Object && (this.sourceTypeCheck == null || this.sourceTypeCheck(source)))) {
            throw new TypeError("Invalid object source");
        }
    }
}

/**
 * The python placeholder parameters.
 * @typedef {Object} PythonPlaceholderParams
 * @property {number|string} [index] The index of the placeholder.
 * @property {string} [field] The field name of the placeholder.
 * @property {string|number} [length] The maximum length of the placeholder value.
 * @property {string|number} [precision] The precision of the palceholder value.
 * @property {string} [options] The placeholder options.
 */

/**
 * Python placeholder is a placeholder for python formats.
 * @param {PythonPlaceholderParams} param0 
 * @constructor
 * @extends {Placeholder}
 * @throws {RangeError} The value of the index was invalid.
 * @throws {TypeError} The type of the index was invalid.
 * @throws {SyntaxError} The placeholder has both index and field.
 */
/**
 * The python placeholder parameters.
 * @typedef {Object} PythonPlaceholderParams
 * @property {number|string} [index] The index of the placeholder.
 * @property {string} [field] The field name of the placeholder.
 * @property {string|number} [length] The maximum length of the placeholder value.
 * @property {string|number} [precision] The precision of the palceholder value.
 * @property {string} [options] The placeholder options.
 */
/**
 * Python placeholder is a placeholder for python formats.
 * @param {PythonPlaceholderParams} param0
 * @constructor
 * @extends {Placeholder}
 * @throws {RangeError} The value of the index was invalid.
 * @throws {TypeError} The type of the index was invalid.
 * @throws {SyntaxError} The placeholder has both index and field.
 */
export class PythonPlaceholder extends Placeholder {
    /**
     * 
     * @param {PythonPlaceholderParams} param0 The constructor parameters of the placeholders.
     */
    constructor({ index = undefined, field = undefined, length = undefined, precision = undefined, options = undefined }) {
        super(index, field, length, precision, options);
        if (index != undefined && field != undefined) {
            throw new SyntaxError("Cannot have placeholder with both index and field name");
        }
    }

    /**
     * The known thousand separator option values.
     */
    get knownThousandSeparators() {
        return ["_", ","]
    }

    /**
     * The known aligment option values.
     */
    get knownAlignments() {
        return ["left", "center", "right", "signFirst"]
    }

    /**
     * The known types. 
     */
    get knownTypes() {
        return ["decimal", "binary", "octal", "hex", "number", "general", "scientific", "percentage", "unicode"]
    }

    get knownOptions() {
        /**
         * The resulting mapping.
         * @type {Map<string, Predicate<any>>}
         */
        const result = new Map();
        return [
            ["thousandSeparator", /** @type {Predicate<any>} */ ( /** @type {any} */ value) => (typeof value === "string" && this.knownThousandSeparators.includes(value))],
            ["align", /** @type {Predicate<any>} */ ( /** @type {any} */ value) => (typeof value === "string" && this.knownAlignments.includes(value))],
            ["type", /** @type {Predicate<any>} */ ( /** @type {any} */ value) => (typeof value === "string" && this.knownTypes.includes(value))],
            ["upperCaseExponent", (value) => (value === undefined || typeof value === "boolean")],
            ["upperCase", (value) => (value === undefined || typeof value === "boolean")],
            ["fill", (value) => (value === undefined || value === "" || value.split(/(?:)/u).length === 1)]
        ].reduce((/** @type {Map<string, Predicate<any>>} */ result, [ /** @type {string} */ option, /** @type {Predicate<any>} */ predicate]) => {
            result.set( /** @type {string} */ option, /** @type {Predicate<any>} */ predicate);
            return result;
        }, result);
    }

    /**
     * The options of the formatting.
     * @type {Record<string, any>}
     */
    get options() {
        return this._options === undefined ? this.defaultOptions : this._options;
    }

    /**
     * @param {string|Map<string, any>|String} options The options value.
     * @throws {SyntaxError} Any option was invalid.
     * @throws {TypeError} The type of the options was invalid.
     */
    set options(options) {
        switch (typeof options) {
            case "string":
                this._options = Object.getOwnPropertyNames(this.parseOptions(options)).reduce((result, option) => {
                    result.set(option, options)
                    return result;
                }, new Map());
                break;
            case "object":
                if (options instanceof Map) {
                    this._options = this.checkOptions(options);
                    break;
                } else if (options instanceof String) {
                    this._options = this.parseOptions(options);
                    break;
                }
            default:
                throw new TypeError("Invalid options type");
        }
    }

    format(...values) {
        let source;
        let placeholderValues;
        let remaining;
        if (this.fieldNames.length > 0) {
            // The last parameter must be an object.
            if (this.lastMemberIndex > values.length && !this.defaultOptions.allowPartialMatch) {
                throw new RangeError("Not enough values for the placeholders");
            } else if (typeof values[values.length - 1] !== "object" || values[values.length - 1] == null) {
                throw new TypeError("The last value must be an object");
            }
            source = values[values.length - 1];
            placeholderValues = values.slice(0, this.lastMemberIndex + 1);
            remaining = values.slice(this.lastMemberIndex + 1);
        } else if (this.lastMemberIndex >= values.length && !this.defaultOptions.allowPartialMatch) {
            throw new RangeError("Not enough values for the placeholders");
        } else {
            // The last parameter does not have to be an object.
            source = undefined;
            placeholderValues = values.slice(0, this.lastMemberIndex + 1);
            remaining = values.slice(this.lastMemberIndex + 1);
        }

    }

    parseOptions(options) {
        /**
         * The resulting mapping of options.
         * @type {Map<string, any>}
         */
        const result = new Map();
        const optionCodePoints = super.parseOptions(options);
        let optionName;
        return [...optionCodePoints.entries()].reduce(
            (result,
                [option, value]) => {
                if (value) {
                    switch (option) {
                        case "fill":
                            result.set(option, value);
                            break;
                        case " ":
                        case "+":
                            optionName = "nonNegativeSign";
                            if (result.has(optionName) || result.has("negativeSign")) {
                                throw new SyntaxError(`Only one sign declaration allowed`)
                            } else {
                                result.set(optionName, option);
                            }
                            break;
                        case "-":
                            optionName = "negativeSign";
                            if (result.has(optionName) || result.has("nonNegativeSign")) {
                                throw new SyntaxError(`Only one sign declaration allowed`)
                            } else {
                                result.set(optionName, option);
                            }
                            break;
                        case "_":
                        case ",":
                            optionName = "thousandSeparator";
                            if (result.has(optionName)) {
                                throw new SyntaxError(`Only one thousand separator allowed`)
                            } else {
                                result.set(optionName, option);
                            }
                            break;
                        case "<":
                            optionName = "align";
                            if (result.has(optionName)) {
                                throw new SyntaxError(`Only one aligment allowed`)
                            } else {
                                result.set(optionName, "left");
                            }
                            break;
                        case ">":
                            if (result.has(optionName)) {
                                throw new SyntaxError(`Only one aligment allowed`)
                            } else {
                                result.set(optionName, "right");
                            }
                            break;
                        case "^":
                            if (result.has(optionName)) {
                                throw new SyntaxError(`Only one aligment allowed`)
                            } else {
                                result.set(optionName, "center");
                            }
                            break;
                        case "=":
                            if (result.has(optionName)) {
                                throw new SyntaxError(`Only one aligment allowed`)
                            } else {
                                result.set(optionName, "signFirst");
                            }
                            break;
                        case "b":
                            optionName = "type";
                            if (result.has(optionName)) {
                                throw new SyntaxError(`Only one type allowed`)
                            } else {
                                result.set(optionName, "binary");
                            }
                            break;
                        case "c":
                            optionName = "type";
                            if (result.has(optionName)) {
                                throw new SyntaxError(`Only one type allowed`)
                            } else {
                                result.set(optionName, "unicode");
                            }
                            break;
                        case "d":
                            optionName = "type";
                            if (result.has(optionName)) {
                                throw new SyntaxError(`Only one type allowed`)
                            } else {
                                result.set(optionName, "decimal");
                            }
                            break;
                        case "o":
                            optionName = "type";
                            if (result.has(optionName)) {
                                throw new SyntaxError(`Only one type allowed`)
                            } else {
                                result.set(optionName, "octal");
                            }
                            break;
                        case "F":
                            result.set("upperCase", true);
                        case "f":
                            optionName = "type";
                            if (result.has(optionName)) {
                                throw new SyntaxError(`Only one type allowed`)
                            } else {
                                result.set(optionName, "fixed");
                            }
                            break;
                        case "E":
                            result.set("upperCaseExponent", true);
                        case "e":
                            optionName = "type";
                            if (result.has(optionName)) {
                                throw new SyntaxError(`Only one type allowed`)
                            } else {
                                result.set(optionName, "scientific");
                            }
                            break;
                        case "G":
                            result.set("upperCaseExponent", true);
                        case "g":
                            optionName = "type";
                            if (result.has(optionName)) {
                                throw new SyntaxError(`Only one type allowed`)
                            } else {
                                result.set(optionName, "general");
                            }
                            break;
                        case "X":
                            result.set("upperCase", true);
                        case "x":
                            optionName = "type";
                            if (result.has(optionName)) {
                                throw new SyntaxError(`Only one type allowed`)
                            } else {
                                result.set(optionName, "hex");
                            }
                            break;
                        case "n":
                            optionName = "type";
                            if (result.has(optionName)) {
                                throw new SyntaxError(`Only one type allowed`)
                            } else {
                                result.set(optionName, "number");
                            }

                            break;
                        case "%":
                            optionName = "type";
                            if (result.has(optionName)) {
                                throw new SyntaxError(`Only one type allowed`)
                            } else {
                                result.set(optionName, "pecentage");
                            }
                            break;
                        default:
                            throw new SyntaxError(`Unknown option ${option}`);
                    }
                }
            }, result
        )
    }
}

/**
 * Python message format.
 * @template TYPE The formatted type.
 * @param {string} [messageFormat="{}"] The message format. 
 * @param {FormattingOptions} defaultOptions The default formatting options.
 * @throws {SyntaxError} The message format was invalid. 
 * @extends {MessageFormat}
 * @constructor
 */
export function PythonMessageFormat(messageFormat = "{}", defaultOptions = {}) {
    this.messageFormat = messageFormat;
    this.members = messageFormat.split(PLACEHOLDER_REGEX.Python).reduce(
        (result, segment, index) => {
            if (index % 2 === 0) {
                // Literal segment.
                result.members.push(segment);
            } else {
                // Placeholder segment.
                const placeholder = PLACEHOLDER_REGEX.PythonPlaceholderSegment.exec(segment);
                if (placeholder) {
                    const { field = undefined, index = undefined, options = "", length = undefined, precision = undefined } = placeholder.groups();
                    if (field != undefined) {
                        // A named field.
                        if (!result.fieldNames.includes(field)) {
                            result.fieldNames.push(field);
                            try {
                                result.members.push(new Placeholder({ field, length, precision, options }));
                            } catch (error) {
                                result.error = new SyntaxError(`Invalid named field placeholder at ${(index - 1) / 2}`, { cause: error });
                            }
                        }
                    } else if (index != undefined) {
                        // A manually given index numbering.
                        if (result.automaticIndexing) {
                            result.error = `Cannot switch from automatic field numbering to manual field specification at placeholder ${(index - 1) / 2}`;
                        } else {
                            result.manualIndexing = true;
                            result.current = Math.max(result.current, Number(index));
                            result.members.push(new Placeholder({ index: Number(index), length, precision, options }));
                        }
                    } else {
                        if (result.manualIndexing) {
                            // The segment is invalid - manual indexing prevents further automatic indexing.
                            result.error = `Cannot switch from manual field specifications to automatic field numbering at placeholder ${(index - 1) / 2}`;
                        } else {
                            result.automaticIndexing = true;
                            result.current++;
                            result.members.push(new Placeholder({ index: result.current, length, precision, options }));
                        }
                    }
                } else {
                    result.members.push(segment);
                }
            }
            return result;
        },
        {
            current: -1, fieldNames: [], error: undefined, members: [],
            get result() {
                if (this.error) {
                    if (typeof this.error === "string") {
                        throw new SyntaxError(this.error);
                    } else {
                        throw this.error;
                    }
                } else {
                    return result.members;
                }
            }
        }
    );
    this.lastMemberIndex = this.members.length > 1 ? this.members.reduce((result, /** @type {string} */ member, /** @type {number} */ index) => {
        if (result.error) {
            return result;
        }
        if (index % 2 == 1) {
            const segments = PLACEHOLDER_REGEX.PythonPlaceholderSegment.exec(member);
            if (segments.groups("index") != null) {
                // Checking if the index changes the result and count.
                const indexValue = Number(segments.groups("index"));
                result.current = Math.max(result.current, indexValue)
                result.autoIndex = false;
            } else if (segments.groups("field") == null) {
                if (result.autoIndex) {
                    result.current++;
                } else {
                    result.error = `Cannot revert to automatic indexing after manual indexing at placeholder ${(index - 1) / 2}`;
                }
            } else {
                // Add named group.
                const fieldName = segments.groups("field");
                if (!result.fieldNames.includes(fieldName)) {
                    result.fieldNames.push(fieldName);
                }
            }
        }
        return result;
    }, {
        current: -1, autoIndex: true, error: "", /** @type {string[]} */ fieldNames: [], get result() {
            if (this.error) {
                throw new SyntaxError(this.error);
            } else {
                return this.current;
            }
        }
    }).result : -1;
    this.defaultOptions = defaultOptions;

    /**
     * Format a value.
     * @param {TYPE} value The formatted value.
     * @returns {string} The formatted value.
     * @throws {SyntaxError} The value could not be formatted.
     */
    this.format = function (...value) {
        let result = this.messageFormat;

        return result
    };

    this.formatObject = function (value) {

        return result;
    };

    return this;
}