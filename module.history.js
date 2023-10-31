import { Exception, ValidationException, SimpleErrorDescription } from "./modules.exceptions.js";

/**
 * Is the given year leap year.
 * @param {number} year The tested canonical gregorian year.
 * @returns {boolean} True, if and only if the given year is leap year.
 */
function isLeapYear(year) {
  return (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0));
}

/**
 * The change of the Julian year
 */
const changeJulianOfYear = { month: 2, day: 21 };

/**
 * The days of months for gregorian years.
 */
const daysOfGregorianMonths = [31, 28, 31.30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * The days years of a normal year.
 */
const daysOfGregorianYears = daysOfGregorianMonths.reduce(
  (arr, val) => {
    if (arr) {
      // The further months.
      arr.push(arr[arr.length - 1] + (val ? val : 0));
    } else {
      // The first month.
      arr.push(val);
    }
    return arr;
  }, []);

/** Daysvof seasons of the gregorian
 * normal year. The first season is the winter of the previous year.
 * (The Spring equinox is assumed on 20th of March starting Spring on 21st of March.) )
 */
const daysOfYearsOfSeasons =
  daysOfGregorianYears.reduce(
    (arr, val, index) => {
      const newVal = (arr ? arr[arr.length - 1] : 0) + (val ? val : 0);
      if (index % 4 == 0) {

        arr.push(newVal);
      } else {
        arr[arr.length - 1] += newVal;
      }
      return arr;
    },
    []
  ).map((v) => (21 - 31 - 1 + v));

//Start-Include: module.calendar.js

/**
 * A function extracting value from source.
 * @template SOURCE, RESULT
 * @callback ValueExtractor
 * @param {SOURCE} source The source value.
 * @returns {RESULT} The result of the extraction.
 * @throws {TypeError} The type of the source was invalid for extraction.
 * @throws {RangeError} The value of hte source was invalid.
 */

/**
 * An uncertain type may contain value, an undefined value or a null.
 * An undefined value indicats the value cannot be determined.
 * A null value indicates the operation is not supported.
 * @template TYPE
 * @typedef {TYPE|undefined|null} UncertainType
 */

/**
 * Validate a value.
 * @template {TYPE}
 * @callback Validator
 * @param {TYPE} value The validated value.
 * @param {boolean} [throwException=false] Does the validation throw the exception elaborating
 * the reason of failure.
 * @returns {boolean} True, if and only if the value is valid.
 * @throws {ValidationException<TYPE>} The validation exception describing the reason of failure.
 */

/**
 * Validates a field, or if no field is given, the whole object.
 * 
 * @template TYPE, FIELD
 * @callback FieldValidator
 * @param {TYPE} value The validated value.
 * @param {FIELD} [field] The validated field, if available. 
 * @param {boolean} [throwException=false] Does the validation throw the exception elaborating the reason of
 * the failure.
 * @returns {boolean} True, if and only if the value is valid.
 * @throws {FieldValidationException<FIELD, TYPE>} The validation exception describing the reason of failure.
 * @throws {ValidationException<TYPE>} The validation exception in the case the field is not available.
 */

/**
 * @typedef {Validator<string>} StringValidator
 */

/**
 * A field reprenting a field value.
 * @template TYPE
 * @typedef Field
 * @property {string} fieldName The name of the field.
 * @property {TYPE} [defaultValue] The default value of the field.
 * @property {Function} [parser] The parser of the field.
 * @property {Funciton} [stringify] The function stringifying a field value.
 * @property {Validator<TYPE>} [validator] The validator of a field value.
 */

/**
 * A derived field from one or more ates.
 * @template RESULT
 * @typedef {Object}  DerivedField
 * @extends {Field<RESULT>}
 * @property {DateField[]} derivedFrom The date fields from which the field is derived.
 * @property {ValueExtractor<DateField[], RESULT>} [defaultValueExtractor] The value extractor.
 */



/**
 * @typedef {Object} DerivedDateFieldOptions
 * @property {ValueExtractor<DateField[], number>} [defaultValueExtractor] The value extractor of the values.
 * @property {ValueExtractor<DateStruct, number>} [dateStructExtractor] The extractor form date structure.
 * 
 */

/**
 * The derived field option keys. 
 */
const DERIVED_FIELD_OPTION_KEYS = ["defaultValueExtractor", "dateStructExtractor"];

/**
 * The required keys of hte derived field options.
 */
const DERIVED_FIELD_OPTIONS_REUIRED_KEYS = [];

/**
 * Extracts derived field options from the object.
 * @param {object} source The source object.
 * @return {DerivedDateFieldOptions} The derived date field options. 
 * @throws {Error} The given source could not be converted into derived field options.
 */
export function getDerivedFieldOptionKeys(source) {
  const result = /** @type {Object} */ filterFields(source, ...DERIVED_FIELD_OPTION_KEYS);
  if (DERIVED_FIELD_OPTIONS_REUIRED_KEYS.every((field) => (field in result))) {
    const actualResult =  /** @type {DerivedDateFieldOptions} */ result;
    return actualResult;
  } else {
    throw new Error("Required field missing");
  }
}

/**
 * Generates a new object by filtering given fields out of the source.
 * @param {object} source The source object.
 * @param {string[]} fieldList The extracted fields. 
 * @returns {object} The object containing only the filtered fields. 
 */
export function filterFields(source, ...fieldList) {
  if (source instanceof Object) {
    return Object.fromEntries([...Object.entries(source)].filter(
      ([key]) => (fieldList.some((v) => (key === v)))
    ));
  } else {
    throw new TypeError();
  }
}

/**
 * A derived date field. The derived date field value is calcuated
 * from other field values.
 *
 * @typedef {DerivedField<number>} DerivedDateField
 * @extends DateField
 */
export class DerivedDateField extends DateField {

  /**
   * @typedef {DerivedDateFieldOptions & DateFieldOptions} DerivedDateFieldConstructorOptions
   */

  /**
   * Create a new cderived date field.
   * @param {string} fieldName
   * @param {(DateField|DerivedDateField)[]} sourceFields The source fields of the derived date filed.
   * @param {DerivedDateFieldConstructorOptions} options The options of the construction.
   */
  constructor(fieldName, sourceFields, options) {
    super(fieldName, filterFields(options, DATE_FIELD_OPTION_KEYS));

    /**
     * The list of the fields the value is based on.
     * @type {{DateField|DerivedDateField}[]}
     */
    this.derivedFrom = sourceFields;
    if (options.defaultValueExtractor) {
      /**
       * The default value extractor. 
       * @type {DateFieldValueExtractor?}
       */
      this.defaultValueExtractor = options.defaultValueExtractor;
    }
    if (options.dateStructExtractor) {
      /**
       * The extractor of the default value.
       * @type {ValueExtractor<DateStruct, number>?}
       */
      this.dateStructExtractor = options.dateStructExtractor;
    }
  }

  /**
   * Get value of a field from a date structure.
   * @param {DateStruct} date The date structure, from which the value is generated.
   * @param {boolean} [throwError=false] Does the call throw an error instead of returning
   * uncertian value on failure.
   * @returns {UncertainType<number>} The value created from the date.
   */
  valueFromDateStruct(date, throwError = false) {
    // Use the dateStructExtractor, if it exists.
    if (this.dateStructExtractor) {
      const result = this.dateStructExtractor(date, throwError);
      return this.getOrThrow(result, new InvalidDateException(`The date does not have all required fields for ${this.fieldName}`),
        new UnsupportedDateFieldException(this, `The given date does not support ${this.fieldName}`), throwError);
    }

    // Using the defualt value extractor.
    try {

      if (this.defaultValueExtractor) {
        const fieldValues = (this.derivedFrom).map(
          (sourceField) => {
            if (sourceField instanceof DerivedDateField) {
              const result = sourceField.valueFromDateStruct(date);
              return this.getOrThrow(result);
            } else {
              return this.getOrThrow(sourceField.valueFromDateStruct(date, throwError),
                new MissingDateFieldException(sourceField, "Field value could not be determined"),
                UnsupportedDateFieldException(sourceField, "The date does not support the field."));
            }
          });
        return this.defaultValueExtractor(fieldValues);
      }
    } catch (error) {
      if (error instanceof InvalidDateException || error instanceof UnsupportedDateFieldException) {
        throw error;
      } else {
        throw new UnsupportedDateFieldException(this, `The given date does nto support ${this.fieldName}`, error);
      }
    }
  }
  /**
   * Get the value or throw an exception in case of undefined or 
   * @template {UNKNOWN_ERROR extends InvalidDateException} 
   * @template {UNSUPPORTED_ERROR extends UnsupportedDateFieldException}
   * @param {UncertainType<number>} value The converted value.
   * @param {UNKNOWN_ERROR|null|undefined} unknownError The error thrown if value is uknonwn.
   * @param {UNSUPPORTED_ERROR|null|undefined} unsupportedError The errro thorw if the value is not supported.
   * @param {boolean} [throwError=false] Does the get return an undefined value.
   * 
   * @return {UncertainType<number>} The uncertain type.
   * @throws {UNKNOWN_ERROR} The given date is not supported.
   * @throws {UNSUPPORTED_ERROR} The failure is caused by a missing date field.
   */
  getOrThrow(value, unknownError = undefined, unsupportedError = undefined, throwError = false) {
    if (value == null && throwError) {
      if (value === undefined) {
        if (unknownError) throw unknownError;
        else
          throw new InvalidDateFieldException(this, "Ambiguous field value");
      } else {
        if (unsupportedError) {
          throw unsupportedError;
        } else
          throw new UnsupportedDateFieldException(this, "Field not supported");
      }
    }
  }
}

/**
 * The data structure containing the information of the erroneous data.
 * @typedef {Object} DateFieldErrorData
 * @property {DateField} invalidField The erroneous field.
 * @property {number} [invalidValue] The invalid value. 
*/


/**
 * Exception indicating a date field is invalid.
 *
 * @extends CalendarException<DateFieldErrorData>
 */
class InvalidDateFieldException extends CalendarException {


  /**
   * Creates a new invalid date field exception.
   * @param {DateField} field The erroneous field.
   * @param {string} [message] @inheritdoc
   * @param {Error} [cause] @inheritdoc 
   * @param {Partial<DateFieldErrorData>} [data] The details of the error.
   */
  constructor(field, message = undefined, cause = undefined, data = {}) {
    super(message, cause, { invalidField: field, ...data });
  }

  /**
   * Get the invalid date field.
   * @type {DateField}
   */
  get invalidField() {
    return super.detail.invalidField;
  }
}

/**
 * The field value of a derived field.
 * @template TYPE
 * @typedef DerivedDateFieldValue
 * @property {DateField[]} derivedFrom The date fields from which the field is derived.
 * @property {TYPE} derivedValue The derived value from the date fields.
 */

/**
 * The function extracting date from a date struct.
 * @callback DateFieldValueExtractor
 * @param {DateStruct} date The date structure, from which the value is extracted.
 * @param {boolean} [throwError=false] Does the method throw error instead of returning
 * an undefined or a null value.
 * @returns {Map<DateField, number>|undefined|null} The mapping containing the date field values, if the
 * given date is valid for extraction. An undefined value indicates that the value cannot be determined, 
 * and a null value indicates the value is not supported.
 * @throws {UnsupportedDateFieldException} Any date field was unsupported.
 * @throws {InvalidDateFieldException} Any date field was invalid.
 */

/**
 * Constructs the date field value extractor. The extractor returns the map from date field to the
 * value of the field.
 * @param {DateFieldValueExtractor[]} fieldExtractor The date field value extractors used to determine
 *  the list of values returned by the extractor fucntion.
 * @returns {DateFieldValueExtractor} Extractor extracing the values from the list. 
 */
export function createDateFieldValueExtractor(...fieldExtractor) {
  return (dateStruct, throwError = false) => {
    /** @type {UncertainType<Map<DateField, number>>} */
    const result = new Map();
    fieldExtractor.forEach((extractor, index) => {
      const extractedValue = extractor(dateStruct, true);
      [...(extractedValue.entries())].forEach(([value, key]) => {
        console.debug(`Adding entry ${key.fieldName} -> ${value}`);
        if (value === undefined) {
          if (throwError) {
            try {
              throw new InvalidDateFieldValueException(createDateFieldValue(key, value), `Invalid date field at index ${index}`);
            } catch (error) {
              throw new InvalidDateFieldValueException(createDateFieldValue(key, undefined), `Invalid date field at index ${index}`);
            }
          }
        } else if (value === null) {
          if (throwError) {
            throw new UnsupportedDateFieldException(key, `An unsupported date field at index ${index}`);
          }
        }
        result.set(key, value);
      })
    }
    );
  }
}

/**
 * @template TYPE
 * @typedef {Field<TYPE> & Object} DateFieldDefinition The definition containing types.
 * @property {Validator<Field<any>>} [fieldValidator] The validator function validates whether the given
 * field is equla to this field
 * @property {Validator<DateStruct>} [dateSourceValidator] The validator function validating the given date as
 * soruce of the field.
 * @property {Validator<DateStruct>} [dateValidator] The validator function validating that the given date reprsents
 * this field.
 * @property {TYPE} [defaultValue] The default value of the field definition.
 * @property {(DateStruct) => {TYPE|undefined}} [dateExtractor] The extractor function extracting the field value
 * from the date struct.
 */

/**
 * @typedef {Object} Calendar The calendar represents calendar system.
 * @property {Array<Era|EraDefinition|undefined>} [supportedEras] The list of supported eras. If the value is absent,
 * all eras are supported.
 * @property {DateFieldDefinition<Month>} [months] The month definitions.
 * @property {DateFieldDefinition<Year>} [years] The field definitions of years.
 * @property {DateFieldDefinition<Day>} [days] The field definitions of a day. 
 */

/**
 * @template TYPE
 * @callback Predicate<TYPE>
 * @param {TYPE} tested The tested value.
 * @return {boolean} True, if and only if the tested value fulfils the predicate.
 */

/**
 * @typedef {DateField & Object} DateFieldValue
 * @property {string} fieldName The field of the field.
 * @property {number|null|undefined} fieldValue The value of the field. If the value
 * is null, tthe value is invalid. If the value is undefined, the field is not supported.
 */

/**
 * Create a new DateFieldValue.
 * @constructor 
 * @param {string} fieldName The date field name.
 * @param {UncertainType<number>} fieldValue The field value.
 * @returns {DateFieldValue}
 * @throws {TypeError} The field value is not a valid field value.
 */
export function createDateFieldValue(fieldName, fieldValue) {
  const type = typeof fieldValue;
  if (["number", "undefined", "null"].some((value) => (value === type))) {
    return {
      fieldName, fieldValue
    }
  } else {
    throw new TypeError("Invalid field value");
  }

}

/**
 * @template TYPE The type of the calendar exception detail.
 * Calendar exception is supertype of the calendar excpetions.
 */
export class CalendarException extends Exception {

  /**
   * Creates a new calendar excpetion.
   * @param {string} [message] The mesasge, if available.
   * @param {Error} [cause] The cause, if available.
   * @param {TYPE} [detail] The detail, if available.
   */
  constructor(message = undefined, cause = undefined, detail = undefined) {
    super(message, cause, detail);
  }
}

/**
 * The date exceptions. 
 * @typedef {InvalidDateException|MissingDateFieldException|UnsupportedDateFieldException} DateException 
 */

/**
 * The object determining a date is invalid.
 * @extends CalendarException<DateStruct>
 */
export class InvalidDateException extends CalendarException {

  /**
   * Creates a new invalid date exception.
   * @param {DateStruct} date The invalid date.
   * @param {string} [message] @inheritdoc
   * @param {Error} [cause] @inheritdoc
   */
  constructor(date, message = undefined, cause = undefined) {
    super(message, cause, date);
  }
  /**
   * Get the date of the exception.
   */
  get date() {
    return super.detail;
  }
}

/**
 * The type of an invalid date field.
 * @typedef {InvalidDateFieldValueException|MissingDateFieldException|UnsupportedDateFieldException} InvalidDateFieldException
 */

/**
 * The date field value.
 * 
 * @extends CalendarException<DateFieldValue>
 */
export class InvalidDateFieldValueException extends CalendarException {

  /**
 * Creates a new invalid date field valeu messsage.
 * @param {DateFieldValue} invalidFieldValue The invalid value of field. 
 * @param {string} message 
 * @param {Error|undefined} cause he invalid value. 
 */
  constructor(invalidFieldValue, message = undefined, cause = undefined) {
    super(message, cause, invalidFieldValue);
  }

  /**
   * The field name of the invalid field.
   * @type {string}
   */
  get fieldName() {
    return super.detail.fieldName;
  }

  /**
   * The field value of the invalid field.
   * @type {number}
   */
  get fieldValue() {
    return super.detail.fieldValue;
  }

}

/**
 * An exception indicating a required date field is missing.
 * @extends {CalendarException<DateField>}
 */
export class MissingDateFieldException extends CalendarException {

  /**
   * Create a missing date field exception.
   * 
   * @param {DateField} field 
   * @param {string} [message] 
   * @param {Error} [cause] 
   */
  constructor(field, message = undefined, cause = undefined) {
    super(message, cause, field);
  }
}

/**
 * An unsupported date field exception.
 * @extends CalendarException<DateField>
 */
export class UnsupportedDateFieldException extends CalendarException {

  /**
   * Creates an unsupported date field exception.
   * 
   * @param {DateField} field The unsupported field.
   * @param {string} [message] The message of the exception, if supplied.
   * @param {Error} [cause] The cause of the exception, if supplied.
   */
  constructor(field, message = undefined, cause = undefined) {
    super(message, cause, field);
  }

}

/**
 * The options for date field construction.
 * @typedef {Object} DateFieldOptions
 * @property {DateFieldValueFunction<DateField>} [minValueFunction] The minimum value function for a date field values.
 * @property {DateFieldValueFunction<DateField>} [maxValueFunction] The mximum value function for a date field values.
 * @property {number} [minValue=1] The minimum value, if the minimum value function is not given.
 * @property {number} [maxValue] The largest allowed value of the field, if any exists.
 */

/**
 * The keys of hte date field options.
 */
const DATE_FIELD_OPTION_KEYS = ["minValueFunction"];

/**
 * The required keys of hte date field options.
 */
const DATE_FIELD_OPTION_REQUIRED_KEYS = [];

/**
 * Extract date field opions from on an object.
 * @param {Object} source The source object.
 * @returns {DateFieldOptions} The options extracted from the result.
 * @throws {Error} The conversion was not possible.
 */
export function getDateFieldOptions(source) {
  const result = filterFields(source, ...DATE_FIELD_OPTION_KEYS);
  if (DATE_FIELD_OPTION_REQUIRED_KEYS.every(
    (field) => (field in result)
  )) {
    const actualResult = /** @type DateFieldOptions */ result;
    return actualResult;
  } else {
    throw new Error("Missing required field");
  }
}


/**
 * A field of a date.
 * @extends {Field<number>}
 */
export class DateField {

  /**
   * @template TYPE
   * @callback NumberValueFunction
   * @param {TYPE} value The value.
   * @param {boolean} [throwError=false] Does the function throw error in lack of support.
   * @return {UncertainType<number>} The numeric value of the type. If the value cannot be determiend,
   * an undefined value. If the value is invalid null. 
   */

  /**
   * The value function extracting a date field value.
   * @typedef {NumberValueFunction<DateStruct>} DateFieldValueFunction
   * @throws {InvalidDateFieldValueException} The given field value is not valid value.
   * @throws {UnsupportedDateFieldException} THe given field value is not supported by the structure.
   */




  /**
   * Create a new date field.
   * @param {string} fieldName The name of the created field. This name is the name
   * of the field on DateStruct and its derivate. 
   * @param {DateFieldOptions} options 
   */
  constructor(fieldName, options = {}) {
    this.fieldName = fieldName;

    /**
     * A function determining the minimum value of the field.
     * @type {DateFieldValueFunction}
     * @throws {InvalidDateFieldValueException} The given field value is not valid value.
     * @throws {UnsupportedDateFieldException} THe given field value is not supported by the structure.
     */
    this.minValue = (options.minValueFunction ? options.minValueFunction : () => (options.minValue || 1));

    /**
     * A function determining the maximum value of the field.
     * @type {DateFieldValueFunction}
     * @throws {InvalidDateFieldValueException} The given field value is not valid value.
     * @throws {UnsupportedDateFieldException} THe given field value is not supported by the structure.
     */
    this.maxValue = (options.maxValueFunction ? options.maxValueFunction : () => (options.maxValue));

    this.requiredFields = (options.requiredFields || []);

  }

}

/**
 * @extends Calendar
 */
// eslint-disable-next-line no-unused-vars
class GregorianCalendar {


  /**
   * The month field of the date structure.
   */
  static get MonthField() {
    return { fieldName: "month" };
  }

  /**
   * The day field of the date structure.
   */
  static get DayField() {
    return { fieldName: "day" };
  }

  /**
   * The canonical year field of the date structure.
   */
  static get YearField() {
    return { fieldName: "year" };
  }

  static get MonthOfYearField() {
    return new DerivedDateField("monthOfYear", {
      valueFromDateStruct: (dateStruct, throwError = false) => {
        try {
          if (!([GregorianCalendar.MonthField, GregorianCalendar.YearField in dateStruct].every(
            (field) => {
              if (field.fieldName in dateStruct) return true;
              else if (throwError) {
                throw new MissingDateFieldException(field, `Missing required date field`);
              }
            }))) {
            if (throwError) {
              throw new MissingDateFieldException()
            }
          }
        } catch (error) {
          if (throwError) {
            throw error;
          } else {
            return undefined;
          }
        }
        return dateStruct[GregorianCalendar.MonthField.fieldName];
      }
    }
    );
  }

  /**
   * @template TYPE
   * @param {Array<[Predicate<TYPE>, (Error|string|Function)]>} validators The validators forming
   * the validation failure explanations.
   * @param {string|Function} [message="Invalid value"] The message of the validation exception.
   * If function, the tested value is passed to the function, and it returns the message. 
   */
  static createValidator(validators, message = "Invalid value",) {
    return (value, throwException = false) => {
      const errors = validators.map(
        ([predicate, error]) => {
          if (predicate(value)) {
            if (error instanceof Function) {
              return error(value);
            } else {
              return error;
            }
          } else {
            return undefined;
          }
        }
      ).filter((value) => (value != null));
      if (errors.length > 0) {
        if (throwException) {
          const msg = (message instanceof Function ? message(value) : message);
          throw new ValidationException(msg, errors.map(
            (error) => {
              return new SimpleErrorDescription({ error, value });
            }
          ));
        } else {
          return false;
        }
      } else {
        return true;
      }
    };
  }

  /**
   * The canonical year field.
   * @type {Field<number>}
   */
  static Year = {
    fieldName: "year",
    fieldValidator: (field) => (field != null && ["year", "canonicalYear"].some((candidate) => (field.fieldName === candidate))),
    parser: (value, fieldTitle = "canonical year") => {
      const result = Number.parseInt(value);
      if (Number.isInteger(value)) {
        return result;
      } else {
        throw new SyntaxError(`Invalid ${fieldTitle} value`);
      }
    },
    stringify: (value) => (JSON.stringify(value)),
    validator: (value) => (Number.isInteger(value))
  }

  /**
   * The month field.
   * @type {Field<number>}
   */
  static Month = {
    fieldName: "month",
    fieldValidator: (field) => (field != null && field.fieldName === "month"),
    parser: (value) => {
      const result = Number.parseInt(value);
      if (Number.isInteger(value)) {
        return result;
      } else {
        throw new SyntaxError("Invalid month value");
      }
    },
    stringify: (value) => (JSON.stringify(value)),
    validator: (value) => (Number.isInteger(value))
  }

  static MonthOfYear = {
    fieldName: "monthOfYear",
    fieldValidator: (field) => (field != null && field.fieldName === this.fieldName),
    dateSourceValidator: (date) => (date instanceof Object && ["month", this.Year.fieldName].every(
      (field) => (field in date && Number.isInteger(date[field]))
    )),
    dateValidator: (date) => ((date instanceof Object)
      && ([GregorianCalendar.DayField.fieldName].every((field) => (!(field in date)))) &&
      (["year", "month"].every((field) => (field in date && Number.isInteger(date[field]))))),
    defaultValue: 1,
    minValue: 1,
    maxValue: 12
  };

  constructor() {
    this.supportedEras = [new Era(0, "BC", "Before Christ"), new Era(1, "AD", "Common Era"), undefined];
    this.months = [
      {
        ...(GregorianCalendar.MonthOfYear),
        dateSourceValidator: (date) => (GregorianCalendar.MonthOfYear.fieldValidator(date) && (
          date[GregorianCalendar.Month.fieldName] >= this.getFirstMonthOfYear(date[GregorianCalendar.Year.fieldName]) &&
          date[GregorianCalendar.Month.fieldName] <= this.getLastMonthOfYear(date[GregorianCalendar.Year.fieldName])
        ))
      }
    ];
  }

  getFirstMonthOfYear() {
    return GregorianCalendar.MonthOfYear.minValue;
  }

  getLastMonthOfYear() {
    return GregorianCalendar.MonthOfYear.maxValue;
  }

  // eslint-disable-next-line no-unused-vars
  getFirstDayOfMonth(_month, _year) {
    return 1;
  }

  getLastDayOfMonth(month, year) {
    return this.getMonthsOfYear(year).getMonth(month).lastDay().value();
  }

  getMonthsOfYear(year) {
    return this.getYear(year).getAll(GregorianCalendar.MonthField);
  }
}

/**
 * Create a calendar field.
 * @template TYPE
 * @returns {DateFieldDefinition<TYPE>}
 */
export function createFieldValidationFunction() {

  return new ValidationException("Invalid date");
}

/**
 * @typedef {Object} EraProperties
 * @property {number} era The value of era.
 * @property {string|null} [title] The title of the era.
 * @property {string|null|undefined} [suffix] The suffix of the era.
 * An undefined or a null suffix indicates the era is Canonical era.
 * An empty era suffix indicates this is default era.
 * @property {Calendar|string|undefined} [reckoning] The reckoning of the era. 
 * @property {Array<number>} [equivalentEra=[]] The list of eras this era
 * is equivalent to.
 */

/**
 * Class representing a Calendar era.
 */
export class Era {

  /**
   * The value of the era.
   * @type {number} 
   */
  #era;

  /**
   * The suffix of the era.
   */
  #suffix;

  /**
   * The title of the era.
   * @type {string|undefined|null}
   */
  #title;

  /**
   * Create a new era.
   * @param {EraProperties} param0 
   */
  constructor({ era = 1, suffix = "AD", title = null }) {
    this.#era = era;
    this.#suffix = suffix;
    this.title = title;
  }

  toString() {
    return this.#suffix;
  }

  valueOf() {
    return this.#era;
  }
}


/**
 * Class of a season.
 */
export class Season {

  constructor(name, abbrev = null, value = undefined) {
    this._name = name;
    this._value = value;
    this._abbrev = abbrev;
  }

  get name() {
    return this._name;
  }

  get abbrev() {
    return this._abbrev || this.name.substring(0, 2);
  }

  get value() {
    return this._value;
  }

  valueOf() {
    return this.value;
  }

  toString() {
    return this.name;
  }

  compare(other) {
    let target;
    if (other instanceof Season) {
      target = other.value;
    } else {
      target = 0 + other;
      if (!Number.isSafeInteger(target)) {
        return undefined;
      }
    }
    return (this.value < target ? -1 : this.value > target ? 1 : 0);
  }
}


let seasonIndex = 1;
/**
 * Seasons contains the seasons of year. The season value is 1 based.
 * @readonly
 * @enum {Season}
 */
export const seasons = {
  Spring: new Season("Spring", null, seasonIndex++),
  Summer: new Season("Summer", null, seasonIndex++),
  Autumn: new Season("Autumn", null, seasonIndex++),
  Winter: new Season("Winter", null, seasonIndex++),
  /**
   * The list of seasons.
   */
  get values() {
    return [this.Spring, this.Summer, this.Autumn, this.Winter];
  },
  /**
   * Parse a string into season.
   * @param {string} value
   * @returns {Season?} the parsed season, if any exists.
   */
  parse(value) {
    return this.values().find((v) => (v.name === value || v.abbrev === value));
  },
  ofValue(value) {
    return this.values().find((v) => (v.value === value));
  },

  /**
   * Converts a value to a season.
   * If the value is a string, it will be parsed.
   * If the value is an integer or another Season, the Season with same value is returned.
   * @param {*} value the converted value.
   * @returns {Season?} The season of the given value.
   */
  from(value) {
    switch (typeof value) {
      case "string":
        return this.parse(value);
      case "number":
        return this.ofValue(value);
      case "object":
        if (value instanceof Season) {
          return this.ofValue(value.value);
        }
      // eslint-disable-next-line no-fallthrough
      default:
        return undefined;
    }
  },
  compare(a, b) {
    const comparee = this.from(a);
    const compared = this.from(b);
    if (comparee == null || compared == null) {
      return undefined;
    }
    return comparee.compare(compared);
  }
}
Object.freeze(seasons);

/**
 * Season of yearnrepresents a season of a specific hernetic year.
 */
export class seasonOfYear {

  /**
   * Create Season of a julian year.
   * @param {number} year the year of the Julian calendar.
   * @param {number|Season} the season of the year.
   */
  constructor(year, season, allSeasons = null) {
    this._year = year;
    this._allSeasons = allSeasons;
    this._season = (allSeasons || this.constructor.Seasons).from(season);
  }

  /**
   * Get the Season implementation of the current class.
   * @return {Class<Season>} the seasons enumeration inplementation the season ofvyear uses.
   */
  static get Seasons() {
    return seasons;
  }

  get year() {
    return this._year;
  }

  get season() {
    return this._season;
  }

  get allSeasons() {
    return this._allSeasons || this.constructor.Seasons;
  }

  /**
   * @param {int} day the day of month or the day of year, if month is not defined.
   * @param {int} year the julian year.
   * @param {int} [month] the month of year.
   * @return {seasonOfYear} the season of year of the given julian date. The value is 1 based unlike in Date objects.
   */
  static fromJulianDate(day, year, month = undefined) {
    const isJulianLeapYear = (y) => ((y + (changeJulianOfYear.month >= 2 ? 1 : 0)) % 4 == 0);
    const isGregorianLeapYear = (y) => isJulianLeapYear(y - (changeJulianOfYear.month >= 2 ? 1 : 0)) && (y % 100 != 0 || y % 400 == 0);

    // Calculating the day difference on the first day of Julian Year (Adjusted by the start of the Julian year)
    const dayDiff = 7 - 12 + 3 + Math.floor((year - (changeJulianOfYear.month < 2 ? 1 : 0)) / 100) - Math.floor((
      year - (changeJulianOfYear.month < 2 ? 1 : 0)) / 400);
    let dayOfYear = (month == null ? 0
      : (month <= changeJulianOfYear.month ? 0 :
        daysOfGregorianYears[changeJulianOfYear.month - 1])) - dayDiff;
    // Update the first day of year  of a month
    if (isGregorianLeapYear(year)
      && (dayOfYear > daysOfGregorianYears[1])) {
      // Adding the last day of previous month by 1 
      dayOfYear++;
    }
    // Addung the day of month (or day of year)
    dayOfYear += day;
    // Changing the leap day back to get day of a normal year
    if (isJulianLeapYear(year) && (dayOfYear > daysOfGregorianYears[1])) {
      dayOfYear--;
    }
    // Normalizing the day of year
    let amount = 0;
    while (dayOfYear < 0) {
      year--;
      amount = 365 + (isLeapYear(year) ? 1 : 0);
      dayOfYear += amount;
    }
    while (dayOfYear > (amount = 365 + (isLeapYear(year) ? 1 : 0))) {
      dayOfYear -= amount;
      year++;
    }

    // Calculating the season of the day of year of the current year.
    let baseSeason = daysOfYearsOfSeasons.findIndex((v) => (dayOfYear <= v));
    if (baseSeason <= 0) {
      if (baseSeason == 0) {
        year--;
      }
      baseSeason += 4;
    }
    return new seasonOfYear(year, baseSeason);
  }

  /**
   * Convert a Date into its season of year.
   * @param {Date} other The date donverted into its season of year.
   * @returns {seasonOfYear} The season of a hermetic year into which the date belongs 
   */
  static fromDate(other) {
    // Get the day of year
    let year = other.getFullYear();
    let dayOfYear = other.getDate() + daysOfGregorianYears[other.getMonth()];
    if (isLeapYear(year) && dayOfYear > daysOfGregorianYears[1]) {
      // Add leap day to dates following it
      dayOfYear++;
    }
    if (isLeapYear(year) && dayOfYear > daysOfGregorianYears[1]) {
      // Remove leap day
      dayOfYear--;
    }
    let quarter = daysOfYearsOfSeasons.findIndex((v) => (dayOfYear <= v));
    if (quarter < 0) {
      quarter = 4;
    } else if (quarter == 0) {
      year--;
      quarter += 4;
    }
    return new seasonOfYear(year, quarter);
  }

  /** Compares the current season of yeat
   * with given value.
   * @param {string|Date|Season|saesonOfYear} other The value the season of year is compared with.
   * @returns {number?} The comparison result, if the other was valid. Otherwise, qn  undefined value
   */
  compare(other) {
    let target = {
      year: undefined,
      season: undefined
    };
    let result = undefined;
    switch (typeof other) {
      case "string":
        target = this.constructor.parse(other);
        if (target == null) {
          return result;
        } else if (target.year != null) {
          result = this.year - target.year;
        }
        if (result == null || result === 0) {
          result = this.season - target.season;
        }
        return result;
      case "object":
        if (other instanceof Date) {
          result = this.constructor.fromDate(other);

          result = this.year - result.year;
          if (result === 0) {
            result = this.season - result.season;
          }
        } else if (other instanceof seasonOfYear) {
          result = this.year - other.year;
          if (result === 0) {
            result = this.season.compare(other.season);
          }
        } else if (other instanceof Season) {
          result = this.season.compare(other);
        }
      // eslint-disable-next-line no-fallthrough
      default:
        return result;

    }
  }

  /**
   * Parse a string repeesentation
   * to its date of year.
   * @param {string} rep the converted string.
   * @returns {seasonOfYear?} the season of year the given string represents. An undefined value on error.
   */
  static parse(rep) {
    if (rep) {
      const asStr = "" + rep;
      const regex = new RegExp("^(?<season>\\p{Lu}\\p{Ll}+)\\s*(?<year>\\d+)(?<era>[AD|AY|BC])?$", "u");
      const match = regex.exec(asStr);
      if (match) {
        let quarter = seasons.from(match.groups["season"]);
        let year = Number.parseInt(match.groups["year"]);
        return new seasonOfYear(year, quarter);
      } else {
        return undefined;
      }
    }
    return undefined;
  }

  toString() {
    return `${this.season} ${this.year}`
  }
}

/**
 * Default year regular expression.
 */
const yearRegex = createYearRegex();

/**
 * Create year regular expression
 * @param {number|null} [max] The largest allowed digit number for  a year. Null value defaults to 
 * unlimited size.
 * @param {number} [min=1] The smallest number of digits for a year.
 * @param {boolean} [requireEra=false] Does the regular expression require era.
 * @returns {RegExp} The regular expression matching a gregojulian year.
 */
function createYearRegex(max = null, min = 1, requireEra = false) {
  return `(?<year>\\d{${min},${max == null ? "" : max}})(?<era>AD|BC)${requireEra ? "" : "?"}`;
}


/**
 * @typedef {Object} DateStruct Date structure.
 * @property {number} [day] The day of month or year. If the month is undefined or null,
 * the date is day of year.
 * @property {number|null|undefined} [month] The month of year. If the month is undefined or
 * null, the day is day of year.
 * @property {number} [year] The year of era or canonical year.
 * @property {string|null|undefined} [era] The era of the years. If undefined or null, 
 * the date is canoncial yaer. An empty value indicates the date uses the default era. 
 */

/**
 * 
 * @param {string} str The parsed date strign.
 * @returns {DateStruct} The Julian date structure of the parsed date.
 */
function parseJulianDate(str) {
  let result = undefined;
  [
    new RegExp("^(?<day>\\d{1,2}))\\(?:\\.(?<month>1?\\d))?\\." + yearRegex + "$"),
    new RegExp("^(?<month>1?\\d)/" + yearRegex + "$"),
    new RegExp("^" + createYearRegex(null, null, true) + "/" +
      "(?<month>1?\\d)$")
  ].forEach(
    // eslint-disable-next-line no-unused-vars
    (pattern, _index) => {
      if (result) { return; }
      let match = pattern.exec(str);
      if (match) {
        result = {
          day: match.groups.day,
          month: match.groups.month,
          year: match.groups.year,
          era: match.group.era || "AD"
        };
      }
    }
  );
  return result;
}

/**
 * A date of the Julian Calendar.
 */
export class JulianDate {

}

//End-Include: "module.calendar.js"

/**
 * Entry represents an entry with title, name, id, and description.
 */
export class Entry {

  constructor(title, date, desc, id = undefined) {
    this.title = title;
    this.date = this.constructor.parseDate(date);
    this.description = desc;
    this.id = id;
  }


  static parseDate(str) {
    return Season.parse(str) || parseJulianDate(str);
  }

}


/**
 * The local variable for storing the entry ids. It is not imported, thus it is
 * not accessible outside the module. 
 */
var entryId = 1;

/**
 * Create a new entry. 
 * The creation adds the entry to the Rest service.
 */
export function createEntry(title, date, description = "") {
  // TODO: check the parameters.

  // Create the entry.
  return new Entry(title, date, description, `entry${entryId++}`);
}

/**
 * Parse given entry.
 * @param {string|Entry|Object} entry 
 * @returns {Entry} The parsed entry.
 * @throws {SyntaxError} The parse failed.
 */
export function parseEntry(entry) {
  if (entry instanceof Entry) {
    return entry;
  } else if (typeof entry === "string") {
    let data = entry.split(":");
    if (data && data[0].startsWith("On ")) {
      return createEntry(data[1].substring("On ".length), data[0], data[2]);
    } else {
      throw new SyntaxError("Invalid entry");
    }
  } else if (typeof entry === "object") {
    return createEntry(entry.name, entry.date, entry.desc);
  }
}

/**
 * Parses a list of entries.
 * @param {Array<EntryType>|Entry} entries The parsed entries. 
 * @returns {Array<Entry>} The array of entries.
 * @throws {SyntaxError} The parsed entries was invalid.
 */
export function parseEntries(entries) {
  if (entries instanceof Array) {
    return entries.map((entry, index) => {
      try {
        return parseEntries(entry);
      } catch (error) {
        throw SyntaxError(`Invalid entry at index ${index}`, { cause: error });
      }
    });
  } else if (entries instanceof Entry) {
    return [entries];
  } else if (entries instanceof Object) {
    return [createEntry(entries.title, entries.date, entries.description)];
  } else {
    throw new SyntaxError("Invalid entries", { cause: TypeError("Invalid type of entries") });
  }
}


/**
 * The package containing history related methods.
 * @package module.history.js
 */



