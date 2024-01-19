/* eslint-disable no-unused-vars */

/** 
 * @module Logging
 * This module contains generic tools for logging.
*/


/**
 * A function logging objects.
 * @callback LogFunction
 * @param {...object} objects The logged object.
 * @returns {void}
 */

/**
 * Function logging a substitution group message.
 * @callback FormatLog
 * @param {string} message The message with a substitution groups for the object.
 * @param {...object} substitutions The substitution values.
 */

/**
 * A function logging a table.
 * @callback LogTable
 * @param {Object|Array} data The logged table.
 * @param {string[]} [columns] The list of columns shown.
 * Defaults to all columns of the data entries. 
 */

/**
 * A function which opens a group.
 * @callback GroupOpener
 * @param {string} [label] The label of the created group.
 */

/**
 * A function which Closes the topmost group.
 * @callback GroupCloser
 */


/**
 * An interface for loggers.
 * @typedef {Object} ILogger
 * @property {LogFunction} log Logs a message.
 * @property {LogFunction} error Logs an error message.
 * @property {LogFunction} warn Logs a warning message.
 * @property {LogFunction} debug Logs a debug message.
 * @property {LogFunction} info Logs an information message.
 * @property {GroupOpener} group Opens a new group.
 * @property {GroupCloser} groupEnd Closes the group.
 * @property {GroupOpener} groupCollapsed Opens a new collaped group.
 * @property {LogTable} table Logs the table. 
 */

/**
 * Get the console based logger.
 * @returns {ILogger} The logger performing the logging using console.
 */
export function getConsoleLogger() {
  return globalThis.console;
}

/**
 * Get the logger doing nothing.
 * @returns {ILogger} The default logger doing nothing.
 */
export function getNoLogger() {
  const result =  /** @type {ILogger} */ NoLogging;
  return result;
}

export const NoLogging = /** @type {ILogger} */ {
  /**
   * @inheritdoc
   */
  log: (...objects) => { },
  /**
   * @inheritdoc
   */
  error: (...objects) => { },
  /**
   * @inheritdoc
   */
  warn: (...objects) => { },
  /**
   * @inheritdoc
   */
  debug: (...objects) => { },
  /**
   * @inheritdoc
   */
  info: (...objects) => { },
  /**
   * @inheritdoc
   */
  group: (...objects) => { },
  /**
   * @inheritdoc
   */
  groupEnd: (...objects) => { },
  /**
   * @inheritdoc
   */
  groupCollapsed: (...objects) => { },
  /**
   * @inheritdoc
   */
  table: (...objects) => {},
};
Object.freeze(NoLogging);