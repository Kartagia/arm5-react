
/**
 * @namespace calendar
 * 
 * @module
 * @description The basic module containing the basic implementations
 * of the Temporal-like classes. 
 * 
 */

/**
 * The start of year. 
 * @typedef {Object} StartOfYear
 * @property {number} [day=1] - The day of month.
 * @property {number} [month=1] - The month of year.
 */


/**
 * The field value types.
 * @typedef {(number|string|(number|string)[])} IFieldValue
 */

/**
 * The interface of a calendar field.
 * @template {IFieldValue} TYPE
 * @typedef {Object} ICalendarField
 * @memberof calendar
 * @property {string} fieldName - The name of the field.
 * @property {ICalendarField<IFieldType>} [parent] - The parent field name, if the
 * calendar field is linked to a parent field, and requires a parent
 * field value as part of its value.
 * @property {number} length - The lenght of the field value.
 * @default 1 - The default length of the field value is 1.  
 * Testi validity of the value.
 * @method validFieldValue
 * @param {IFieldValue} value - The tested value.
 * @returns {boolean|null} True, if and only if the value is valid. The
 * falsy value of null indicates the field value type is invalid.
 * Get a field value of the field. 
 * @method withValue
 * @param {TYPE} value - The assigned value.
 * @returns {ICalendarFieldValue<TYPE>} - The field value of the field with value.
 * @throws {TypeError} The field value type was invalid.
 * @throws {RangeError} The field value was invalid.
 * 
 * Get the largest value of the field.
 * @method getFieldMaximum
 * @returns {TYPE|null} The largest allowed value for the field.
 *
 * Get the smallest value of the field.
 * @method getFieldMinimum
 * @returns {TYPE|null} The smallest allowed value for the field.
 */

/**
 * The interface of a calendar field value.
 * @template {IFieldValue} TYPE
 * @typedef {Object} CalendarFieldValue
 * @memberof calendar
 * @property {string} field - The field name.
 * @property {IFieldValue} value - The value of the field.
 * @property {ICalendar|string} [calendar] - The calendar of the field, or the
 * name of the clandar, if the field value is specific to a calendar.
 */

/**
 * The interface of the calendar. 
 * @typedef ICalendar
 * @memberof calendar
 * 
 * @method hasField
 * @param {string} fieldName - The field name.
 * @returns {boolean} Does the calendar recognize the given field.
 * 
 * @method getField
 * @param {string} fieldName - The seeked field.
 * @returns {IField?} THe field implementation of the calendar, if 
 * the calednar has the field, or an undefined value.
 *
 * Testi validity of the value.
 * @method validFieldValue
 * @param {string} fieldName - The tested field.
 * @param {IFieldValue} value - The tested value.
 * @returns {boolean|null} True, if and only if the value is valid. The
 * falsy value of null indicates the field value type is invalid.
 * 
 * Get the largest value of the field.
 * @template {IFieldValue} TYPE
 * @method getFieldMaximum
 * @param {string} fieldName - The field whose value is wanted.
 * @returns {IFieldValue<TYPE>|null} The largest allowed value for the field.
 *
 * Get the smallest value of the field.
 * @template {IFieldValue} TYPE
 * @method getFieldMinimum
 * @param {string} fieldName - The field whose value is wanted.
 * @returns {IFieldValue<TYPE>|null} The smallest allowed value for the field.
 * 
 */

/**
 * @typedef {Object} CalendarFieldOption
 */

/**
 * @template {IFieldValue} TYPE - The value type of the field.
 * @implements ICalendarField
 */
export class CalendarField {

  /**
   * The length of the fieds belonging to this field. 
   * @type {number}
   */
  #length = 1;

  /**
   * The smallest allowed value.
   * An undefiend value indicates the value or value parts
   * has no minimal value. 
   * @type {IFieldValue|null}
   */
  #minValue;

  /**
   * The largest allowed value.
   * An undefiend value indicates the value or value parts
   * has no upper boundary.
   * @type {IFieldValue|null}
   */
  #maxValue;


  /**
   * Create a new calendar field.
   * @param {Partial<ICalendarField<TYPE>>} param0 
   */
  constructor({ fieldName, length = 1, minValue = undefined, maxValue = undefined, parent = null }) {
    this.fieldName = fieldName;
    this.#length = length;
    this.#minValue = (minValue === undefined ? [1] : minValue);
    this.#maxValue = (maxValue === undefined ? undefined : maxValue);
    this.parent = parent;
  }

  validFieldValue(fieldValue) {
    return (this.valueLength === 1 ? ["number", "string"].find((v) => (v === typeof fieldValue)) != null
      : typeof fieldValue === "object" && fieldValue instanceof Array && fieldValue.length === this.valueLength
      && (this.parent
        ? this.parent.validFieldValue(fieldValue.slice(0, this.parent.length)) &&
        fieldValue.slice(this.parent.length).every((part) => (["number", "string"].find((v) => (v === typeof part)) != null))
        : fieldValue.every((part) => (["number", "string"].find((v) => (v === typeof part)) != null)))
    );
  }

  get length() {
    return this.#length + (this.parent == null ? 0 : this.parent.lenght);
  }

  get mininumValue() {
    return this.#minValue;
  }

  get maximumValue() {
    return this.#maxValue;
  }
}

/**
 * The class calendar implements calendar.
 * @class
 * @implements ICalendar
 * @memberof calendar
 */
export class Calendar {

  /**
   * The supported fields of the calendar.
   */
  #supportedField;

  /**
   * Create a new calendar. 
   * @param {Map<string, ICalendarField>} supportedFieldMap The mapping from
   * field names to the field implementations.
   */
  constructor(supportedFieldMap) {
    this.#supportedField = new Map(supportedFieldMap.entries());
  }

  /**
   * @inheritdoc
   */
  hasField(fieldName) {
    return this.#supportedField.has(fieldName);
  }

  /**
   * @inheritdoc
   */
  getField(fieldName) {
    return this.#supportedField.get(fieldName);
  }

  /**
   * @inheritdoc
   */
  getFieldValue(fieldName, fieldValue) {
    return this.getField(fieldName)?.withFieldValue(fieldValue);
  }

  /**
   * @inheritdoc
   */
  validFieldValue(fieldName, fieldValue) {
    const field = this.getField(fieldName);
    return field ? field.validFieldValue(fieldValue) : null;
  }

  /**
   * @inheritdoc
   */
  getFieldMaximum(fieldName) {
    const field = this.getField(fieldName);
    return (field ? field.getMaximum() : null);
  }

  /**
  * @inheritdoc
  */
  getFieldMinimum(fieldName) {
    const field = this.getField(fieldName);
    return (field ? field.getMinimum() : null);
  }
}