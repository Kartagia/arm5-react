
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

import fs from 'fs/promises';
import { URL } from 'url';

/**
 * Module handling the stored data as XML files. 
 * @module
 */


/**
 * The default parse options.
 * @type {import("fast-xml-parser").XMLParserOptions}
 */
const defaultParseOptions = {
  preserveOrder: true, ignoreAttributes: false, attributeNamePrefix: "", attributeGroupPrefix: "@_"
}

/**
 * Get the source data.
 * @param {URL|string} source The source of the document.
 * @param {Function} [onSuccess] The function performed on success. Gets the read object as its
 * parameter.
 * @param {Function} [onError] The function performed on error getting error as its parameter.
 * @returns {Promise<Object>} A promise resolving to the read object.
 * @param {import("fast-xml-parser").XMLParserOptions} [options] The parser options.
 */
export const readXmlData = async (source, onSuccess = undefined, onError = undefined, options = defaultParseOptions) => {
  const parser = new XMLParser(options);
  if (source instanceof URL) {
    // The source is an url.
    const headers = new Headers();
    headers.append("Content-Type", "application/xml")
    return fetch(source, {
      method: "GET", headers
    }).then((data) => (parser.parse(data, true))).then(onSuccess, onError);
  } else {
    // The source is a string and the environment is node.
    return fs.stat(source).then(
      (stats) => {
        if (stats.isFile()) {
          return fs.access(source, fs.constants.R_OK).then(
            () => {
              // The file was readable.
              return fs.readFile(source, { encoding: "utf-8", flag: "r" }).then(
                (data) => (parser.parse(data, true))
              );
            },
            () => {
              throw new TypeError("Cannot read unreadable file");
            }
          );
        } else {
          throw new TypeError("Source was not a file");
        }
      },
      (error) => {
        throw error;
      }
    ).then(onSuccess, onError);
  }
}

/**
 * Write data to the target.
 * @param {Object} xmlData The object to convert into xml.
 * @param {URL|string} target The target into which the value is stored.
 * @param {Function} [onSuccess] The function performed on success. Gets the body of the response as its
 * parameter, or a undefined value in case of file system or lack of body.
 * @param {Function} [onError] The function performed on error getting error as its parameter.
 */
export const writeXmlData = async (xmlData, target, onSuccess = undefined, onError = undefined) => {
  const builder = new XMLBuilder();
  const headers = new Headers();
  headers.append("Content-Type", "application/xml")
  if (target instanceof URL) {
    return fetch(target, {
      headers,
      method: "POST",
      body: builder.build(xmlData)
    }).then(onSuccess, onError);
  } else {
    return fs.access(target, fs.constants.W_OK | fs.constants.F_OK).then(
      () => {
        fs.writeFile(target, builder(xmlData))
      }
    ).then(onSuccess, onError)
  }
}

export default {
  /**
   * Read XML data. If the source is an URL, the data is fetched with GET.
   * @param {URL|string} source The source of the XML data. If the source is URL the data is fetched
   * with GET from url.
   * @param {Function} [onSuccess] The function performed on success. Gets the read object as its
   * parameter. Defaults to a function returning the parsed object.
   * @param {Function} [onError] The function performed on error getting error as its parameter. Defaults
   * to a function throwing the exception.
   * @param {import("fast-xml-parser").XMLParserOptions} [options] The parser options.
   * @returns {Promise<any>} A promise containing the result of the onSuccess. 
   */
  async read(source, onSuccess = undefined, onError = undefined, options = {}) {
    return readXmlData(source, onSuccess, onError, options)
  },
  /**
   * Write XML data. 
   * If the target is an URL, the data is sent with POST to the url.
   * @param {Object} data The data sent to the server.
   * @param {URL|string} target The target of the write.
   * @param {Function} [onSuccess] The function performed on success. Gets the body of the response as its
   * parameter, or a undefined value in case of file system or lack of body.
   * @param {Function} [onError] The function performed on error getting error as its parameter.
   * @returns {Promise<any>} The promise containing hte result of the on success.
   */
  async write(data, target, onSuccess = undefined, onError = undefined) { return writeXmlData(data, target, onSuccess, onError); }
}