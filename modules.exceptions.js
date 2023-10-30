/**
 * An extendion of {@link Error} automatically setting the error name and implementing the stack.
 * @template {TYPE=null} The type of the error.
 */
export class Exception extends Error {
  /**
   * Create a new exception.
   * Teh exception constructor does define the name of the error from the actual constructor of the
   * subclass. 
   * @param {string} [message] The error message.
   * @param {Error} [cause] The cause of the exception.
   * @param {TYPE} [detail] The detail of the error. This contains additional payload of the exception. 
   */
  constructor(message = null, cause = null, detail = null) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;
    this.detail = detail || [];
  }

  toPOJO() {
    return {
      name: this.name,
      message: this.message,
      cause: this.cause,
      detail: this.detail
    };
  }

  fromPOJO(pojo) {
    if (pojo instanceof Object) {
      return new Exception()
    } else {
      throw new SyntaxError("Invalid value");
    }
  }

  /**
   * Converts JSON to the current error class.
   * @param {string} json The json type.
   */
  fromJSON(json) {
    const pojo = JSON.parse(json);
    return this.fromPOJO(pojo);
  }
}

/**
 * An exception inficating the operation is not supported.
 */
export class UnsupportedError extends Exception {
  constructor(message = null, cause = null) {
    super(message, cause);
  }
}


/**
 * The definition of a field error.
 * @template VALUE
 * @typedef {Object} ErrorDescription
 * @property {string} [fieldName] The field name of the error. If undefined,
 * the error description links to the value itself.
 * @property {string} [description] The description of the error. An absent
 * value indicates the description is the default description.
 * @property {VALUE} [value] The invalid value. An absent field indicates the
 * value is not available.
 */

/**
 * The definition of a field error.
 * @template FIELD, VALUE
 * @typedef {Object extends ErrorDescription<VALUE>} FieldErrorDescription
 * @property {FIELD} field The field of the error.
 * @property {string} [fieldName] The field name of the error. If the field
 * does not have string reprsentation, this value is required.
 * @property {string} [description] The description of the error. An absent
 * value indicates the description is the default description.
 * @property {VALUE} [value] The invalid value. An absent field indicates the
 * value is not available.
 */

/**
 * The error description of an Object field error.
 * @template {VALUE=any}
 * @typedef {FieldErrorDescription<string|symbol, VALUE>} ObjectFieldErrorDescription
 */

/**
 * The error description of a POJO field error.
 * @template {VALUE=any}
 * @typedef {FieldErrorDescription<string, VALUE> extends ObjectFieldErrorDescription<VALUE>} POJOFieldErrorDescription
 */


/**
 * @template TYPE
 * @extends {Exception<Array<ErrorDescription<TYPE>>>}
 * A validationg exception represents a validation failure.
 */
export class ValidationException extends Exception {


  /**
   * The validation error descriptions.
   * @type {Array<ErrorDescription<TYPE>>}
   */
  #errors = [];

  /**
   * Creates a new validation exception.
   * @param {string} message The error message of the exception.
   * @param {Array<ErrorDescription<TYPE>} errors The errors. 
   * @param {Error} [cause] The cause of the exception. 
   */
  constructor(message, errors = null, cause = null) {
    super(message, { cause: cause });
    this.#errors = errors;
  }

  /**
   * The detail of the validation exception is the array of error descriptions.
   * @override
   */
  get detail() {
    return this.errors();
  }

  /**
   * Set the details.
   * @param {Array<FieldErrorDescription<FIELD,TYPE>>} detail The new detail.
   * @throws {TypeError} The type of detail is invalid.
   * @throws {RangeError} Any member of the detail was invalid.
   */
  set detail(detail) {
    console.debug(`Setting detail on class ${this.constructor.name}`)
    super.errors = detail;
    console.debug(`New errors: [${detail.toString()}] compared to [${[1, 2].toString()}]`)
  }

  /**
   * Validator structure targeting specific fields.
   * @template VALUE
   * @typedef {Object} ObjectFieldValidatorStruct
   * @property {string|string[]|undefined} [field] The field this validator handles. If undefined, the 
   * validator tests the whole object, not a single field. If array, the test targets all fields in the 
   * list including the object itself.
   * @property {Predicate<VALUE>} [tester] The tester of the field value. If absent, all values are
   * accepted.
   */

  /**
   * Test the validity of an error description.
   * @param {ErrorDescription<FIELD, TYPE>} error The tested error description. 
   * @param {Array<ObjectFieldValidatorStruct} [validatorFunctions] The list of validator functions-
   * @param {Array<string>} [requiredFields=[]] The list of required fields.
   * @param {Array<string>} [optionalFields=["field", "fieldName", "description", "value"]] The list of optional fields. 
   * @returns {boolean} True, if and only if the error description is valid.
   */
  validErrorDescription(error, validatorFunctions = [],
    requiredFields = [], optionalFields = ["field", "fieldName", "description", "value"]) {
    const validField = (field, value) => {
      return validatorFunctions.filter((validator) => (validator.field === field ||
        (validator.field instanceof Array && validator.field.some((v) => (v === field)))))
        .every((validator) => (validator.tester == null || validator.tester(value)));
    }
    return (error instanceof Object && requiredFields.every((field) => (field in error && validField(field, error[field])))
      && optionalFields.every((field) => ((!(field in error)) || validField(field, error[field])))
      && validField(undefined, error));
  }


  /**
   * Teh error descriptions of the validation error.
   * @type {Array<ErrorDescription<FIELD, TYPE>>}
   */
  get errors() {
    console.debug(`Setting errors on class ${this.constructor.name}`)
    return [...(this.#errors)];
  }

  /**
   * Set the errors of the validation exception.
   * @param {Array<ErrorDescription<FIELD, TYPE>>} list The list of error descriptions.
   * @throws {TypeError} Attempting to set the error description with anything but an array.
   * @throws {RangeError} Some of the listed error descriptions was invalid.
   */
  set errors(list) {
    if (this.constructor === ValidationException) {
      if (Object.isFrozen(this)) {
        throw new Error("The errors list is immutable");
      }
      if (list instanceof Array) {
        this.#errors = list.map((error, index) => {
          // TODO: validate the error after implementing the ErrorValidation
          if (this.validError(error)) {
            return error;
          } else {
            throw new RangeError(`Invalid error at index ${index}`);
          }
        })
      } else {
        throw new TypeError("Invalid value for errors list");
      }
    } else {
      super.errors = list;
    }
  }

  /**
   * The validation error stringification does add the description of the errors.
   */
  toString() {
    let validationResult = this.errors.map((error) => {
      return `${error.fieldName || error.field.toString()} ${error.description ? error.description : "was invalid"}`;
    })

    return super.toString() + (validationResult.length > 0 ? `, Validation errors: ${validationResult}` : "");
  }
}


/**
 * A Validation Exception with defined field.
 * @template FIELD The field of the validation.
 * @template {TYPE=any} The tyep of the field value.
 * @extends ValidationException<FIELD, TYPE>
 */
export class FieldValidationException extends ValidationException {


  /**
   * The validator validating field validation error description field name.
   * @type {ObjectFieldValidatorStruct}
   */
  static FIELD_DESCRIPTION_VALIDATOR_FIELDNAME = {
    field: null,
    tester: (value) => {
      try {
        "" + value.field;
        return (value.fieldName == null) || typeof value.fieldName === "string";
      } catch (err) {
        return value.fieldName && typeof value.fieldName === "string";
      }
    }
  }

  /**
 * Validator structure targeting specific fields.
 * @typedef {Object} ObjectFieldValidatorStruct
 * @property {string|string[]|undefined} [field] The field this validator handles. If undefined, the 
 * validator tests the whole object, not a single field. If array, the test targets all fields in the 
 * list including the object itself.
 * @property {Predicate<any>} [tester] The tester of the field value. If absent, all values are
 * accepted.
 */

  /**
   * Test the validity of an error description.
   * @param {ErrorDescription<FIELD, TYPE>} error The tested error description. 
   * @param {Array<ObjectFieldValidatorStruct} [validatorFunctions] The list of validator functions-
   * @param {Array<string>} [requiredFields=[]] The list of required fields.
   * @param {Array<string>} [optionalFields=["field", "fieldName", "description", "value"]] The list of optional fields. 
   * @returns {boolean} True, if and only if the error description is valid.
   */
  validErrorDescription(error, validatorFunctions = [
  ], requiredFields = ["field"], optionalFields = ["fieldName", "description", "value"]) {
    const validField = (field, value) => {
      return validatorFunctions.filter((validator) => (validator.field === field ||
        (field in (validator.field instanceof Array ? validator.field : []))))
        .every((validator) => (validator.tester == null || validator.tester(value)));
    }
    return (error instanceof Object && requiredFields.every((field) => (field in error && validField(field, error[field])))
      && optionalFields.every((field) => ((!(field in error)) || validField(field, error[field])))
      && validField(undefined, error));
  }


}

/**
 * @template TYPE
 * @typedef {Object} SimpleErrorDescriptionProperties
 * @property {Error|FieldValidationException|string} [error] The error cuasing the problems.
 * @property {TYPE} [value] The erroneous value.
 */

/**
 * A simple error description based on an error and value.
 * @template TYPE
 * @extends ErrorDescription<TYPE>
 */
export class SimpleErrorDescription {

  /**
   * Create a simple error descrpition
   * @param {SimpleErrorDescriptionProperties<TYPE>} options
   */
  constructor(options = {}) {
    if ("error" in options) {
      if (options.error instanceof FieldValidationException) {
        this.fieldName = options.error.fieldName;
        this.description = options.error.message;
        this.value = options.error.value;
      } else if (options.error instanceof Error) {
        this.description = options.error.message;
      } else {
        this.description = options.error;
      }
    }
    if ("value" in options) {
      this.value = options.value;
    }
  }

}
