/**
 * An extendion of {@link Error} automatically setting the error name and implementing the stack.
 */
export class Exception extends Error {
  constructor(message = null, cause = null) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;
  }
}

/**
 * An exception inficating the operation is not supported.
 */
export class UnsupportedError extends Exception {
  constructor(message=null, cause=null) {
    super(message, cause);
  }
}