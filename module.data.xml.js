/**
 * @module data/xml
 *
 * The XML data container module.
 */

import { readFile } from "fs";
import { DOMImplementation, DOMParser, XMLSerializer } from "@xmldom/xmldom";
import { NoLogging } from "./module.logging.mjs";
import path from "path";
import { validNCName } from "./module.xml.name.mjs";

/**
 * @typedef {ILogger} ILogger
 */

/**
 * Test the validity of a key for data entries.
 * @param {string} tested The tested identifier.
 * @returns {returns} True, if and only if the given identifier is a valid
 * XML identifier.
 */
export function validKey(tested) {
  return typeof tested === "string" && /^[a-z][-.\w]*$/i.test(tested);
}

/**
 * The parse result interface.
 * @interface
 */
export function ParseResultValue() {}

/**
 * The parameter name.
 * @type {string}
 */
ParseResultValue.prototype.key;

/**
 * The parse result value.
 * @type {string|Array<ParseResultValue>|Object.<string, ParseResultValue>}
 */
ParseResultValue.prototype.value;

/**
 * The parse result.
 * @typedef {Object.<string, ParseResultValue>} ParseResult
 */

/**
 * The property type represents a single property type of the parse results.
 * @typedef {Object} PropertyType
 * @property {string} name The name of the property type.
 * @property {RegExp} regex The regular expresion matching the property type name.
 * The regular expression always has named group "tag" containing the tag name.
 * @property {()=>string} toString Converts the property type to string representation.
 * @property {(document: Document, propertyName: string, source:ParseResultValue)=>Node} toDOM Converts the XmlDataSource parse result value to
 * DOM Node.
 */

/**
 * Escape attribute content.
 * @param {string} content The escaped attribute content.
 * @returns {string} The attribute content with proper escape.
 */
export function escapeAttribute(content) {
  return content.replaceAll(/"/g, "&quot;");
}

/**
 * Revert attribute value to its unescaped value.
 * @param {string} escapedContent The escaped content.
 * @returns {string} The unescaped attribute value.
 */
export function unescapeAttribute(escapedContent) {
  return escapedContent.replaceAll(/&quot;/, '"');
}

/**
 * @enum {PropertyType}
 */
export class PropertyTypes {
  /**
   * Document type declaration.
   * @type {PropertyType}
   */
  static get DocType() {
    return {
      name: "Document Type Declaration",
      regex: /^!(?<tag>[a-z][\w:-]*)/i,
      toString() {
        return this.name;
      },
      // eslint-disable-next-line no-unused-vars
      toDOM(doc, propertyName, _parsedContent) {
        const match = this.regex.exec(propertyName);
        const externalDecl = { publicId: "", systemId: "" };
        const internalDecl = [];
        if (match) {
          const result = DOMImplementation.createDocumentType(
            match.groups.tag,
            externalDecl.publicId,
            externalDecl.systemId
          );
          internalDecl.forEach((declaration) => {
            result.append(declaration);
          });
          return result;
        } else {
          return undefined;
        }
      },
    };
  }

  /**
   * The processing instruction type.
   * @type {PropertyType}
   */
  static get ProcessInstruction() {
    return {
      name: "Process Instruction",
      regex: /^\?(?<tag>[a-z][\w:-]*)$/i,
      toString() {
        return this.name;
      },
      toDOM(document, propertyName, content) {
        const match = this.regex.exec(propertyName);
        const data =document.createPIData(propertyName, content);
        if (match) {
          return document.createProcessingInstruction(match.groups.tag, data);
        } else {
          return undefined;
        }
      },
    };
  }
  /**
   * The comment type.
   * @type {PropertyType}
   */
  static get Comment() {
    return {
      name: "Comment",
      regex: /^#(?<tag>comment)$/i,
      toString() {
        return this.name;
      },
      /**
       * Convert the parse result to content.
       * @param {string} propertyName The property name.
       * @param {ParseResultValue} content The content.
       */
      toDOM(document, propertyName, content) {
        const match = this.regex.exec(propertyName);
        if (match) {
          return document.createComment(content);
        } else {
          return undefined;
        }
      },
    };
  }
  /**
   * The node type.
   * @type {PropertyType}
   */
  static get TextNode() {
    return {
      name: "Text Node",
      regex: /^#(?<tag>text|cdata|cdata-section)$/i,
      toString() {
        return this.name;
      },
      toDOM(document, nodeName, content) {
        const match = this.regex.exec(nodeName);
        if (match) {
          switch (match.groups.tag) {
            case "cdata":
            case "cdata-section":
              return document.createCDATASection(content);
            default:
              return document.createTextNode(content);
          }
        } else {
          return undefined;
        }
      },
    };
  }

  /**
   * The eleemnt type.
   * @type {PropertyType}
   */
  static get Element() {
    return {
      name: "Element",
      regex: /^(?<tag>[a-z][\w:-]*)$/i,
      toString() {
        return this.name;
      },
      toDOM(document, nodeName, content) {
        const match = this.regex.exec(nodeName);
        if (match) {
          const result = document.createElement(match.groups.tag);
          XmlDataSource.jsonToDom(result, content);
          return result;
        } else {
          return undefined;
        }
      },
    };
  }

  /**
   * The attribute type.
   * @type {PropertyType}
   */
  get Attribute() {
    return {
      name: "Attribute",
      regex: /^@_(?<tag>[a-z][\w:-]*)$/i,
      toString() {
        return this.name;
      },
      escapeAttribute(content) {
        return escapeAttribute(content);
      },
      toDOM(document, nodeName, content) {
        const match = this.regex.exec(nodeName);
        if (match) {
          const result = document.createAttributeNode(match.groups.tag);
          result.value = this.escapeAttribute(content);
          return result;
        } else {
          return undefined;
        }
      },
    };
  }

  /**
   * The list of the enumeration members.
   * @type {Array<PropertyType>}
   */
  static get values() {
    return [
      this.Comment,
      this.ProcessInstruction,
      this.Attribute,
      this.Element,
      this.TextNode,
    ];
  }

  /**
   * Get the property type of the property name.
   * @param {string} propertyName The parsed type string.
   * @returns {PropertyType?} The property type of the given property string.
   */
  static parse(propertyName) {
    return this.values().find((type) => type.regex.test(propertyName));
  }
}

/**
 * Parser parsing the source into XML Document.
 * @callback XMLParseFunction
 * @param {string} source The string containing the XML document.
 * @returns {Document} The XML Document built from the source.
 * @throws {SyntaxError} The parse fails due syntax error.
 */

/**
 * A function converting XML document into its string representation.
 * @callback XMLStringifier
 * @param {Document|Node|Attr} source The XML Document, whose string representation
 * is generated.
 * @returns {string} The string representation of the document.
 * @throws {SyntaxError} The source was invalid and could not be converted into
 * string.
 */

/**
 * The parameters for building a XML Data Source.
 * @typedef {Object} XMLDataSourceParams
 * @property {XMLParseFunction} parser The XML parser parsing a string into XML document.
 * @property {XMLStringifier} stringifier The converter from XML Document into
 * a string representation.
 * @property {ILogger} [log] The logger used to log messages during operation.
 */

/**
 * A method must be modified.
 * @typedef {Object} MethodModification
 * @property {string} method The method, which must be changed.
 * @property {"change"|"remove"|"add"} type The type of the required modification.
 */

/**
 * A header must be modified.
 * @typedef {Object} HeaderModification
 * @property {string} header The header, whose modification is required.
 * @property {"change"|"remove"|"add"} type The type of the required modification.
 */

/**
 * The body must be modified.
 * @typedef {Object} BodyModification
 * @property {"change"|"remove"|"add"} type The type of the required modification.
 */

/**
 * The structure representing request modifications.
 * @typedef {HeaderModification|BodyModification|MethodModification} RequestModification
 */

/**
 * The error indicating the same REST operation should not be used again.
 */
export class DoNotRetryError extends Error {
  /**
   * Create a new error which should not be resent.
   * @param {string} message The error message.
   * @param {ErrorOptions} [options] The error options.
   * @param {RequestModification[]} [requiredModifiactions...] The modifications
   * required before resending.
   */
  constructor(message, options = {}, ...requiredModifications) {
    super(message, options);
    this.name = this.constructor.name;
    this.requiredModifications = requiredModifications;
  }
}

/**
 * An error indicating the request should be modified, before
 * resending.
 */
export class BadRequestError extends DoNotRetryError {
  /**
   * Create a new error which should not be resent.
   * @param {string} message The error message.
   * @param {ErrorOptions} [options] The error options.
   */
  constructor(message, options = {}) {
    super(message, options);
  }
}

/**
 * An error indicating the authentication error failed.
 * The request mey be resent with different authentication information.
 */
export class UnauthorizedError extends DoNotRetryError {
  /**
   * Create a new error which should not be resent.
   * @param {string} message The error message.
   * @param {ErrorOptions} [options] The error options.
   * @param {RequestModification[]} [requiredModifiactions...] The modifications
   * required before resending. Defaults to a modification requireing adding authorization
   * header.
   */
  constructor(message, options = {}, ...modifications) {
    super(
      message,
      options,
      ...(modifications || [{ header: "Authorization", type: "add" }])
    );
  }
}

/**
 * An error which may be retried later.
 */
export class MayRetryLaterError extends Error {
  /**
   * The delay before retry. Null, if the delay is not known.
   */
  #timeout;

  /**
   * Create an error which may be retried later.
   * @param {string} message The error message.
   * @param {ErrorOptions} [options] The error options.
   * @param {string|null} [timeout] The timeout required before retry.
   */
  constructor(message, options = {}, timeout = null) {
    super(message, options);
    this.#timeout = timeout;
  }

  /**
   * The amount of time before retry.
   * @type {string|null}
   */
  get timeout() {
    return this.#timeout;
  }
}

/**
 * An error represent a missing error.
 */
export class ResourceMissingError extends DoNotRetryError {
  /**
   * The resource does not exist.
   */
  constructor(message, options) {
    super(message, options);
  }
}

/**
 * An error indicating the method was invalid.
 */
export class InvalidMethodError extends DoNotRetryError {
  constructor(message, options, method) {
    super(message, options, { method, type: "change" });
  }
}

/**
 * The resource is unavailable at the moment.
 */
export class ResourceUnavailableError extends MayRetryLaterError {
  /**
   * Create new missing resource error.
   * @param {string} message The error message.
   * @param {ErrorOptions} [options] The error options.
   * @param {string|null} [timeout] The timeout.
   */
  constructor(message, options = {}, timeout = null) {
    super(message, options, timeout);
  }
}

/**
 * The class representing a data source using XML documents to store the data.
 */
export class XmlDataSource {
  /**
   * A parsing parsing a string to the XML Document.
   * @type {XMLParseFunction}
   */
  #parser;

  /**
   * A string builder converting an XML document into a string
   * representation of the xml document.
   * @type {XMLStringifier}
   */
  #stringifier;

  /**
   * Creates a new XML data source.
   * @param {XMLDataSourceParams} params The constructor parameters.
   */
  constructor(params) {
    this.parser = params.parser;
    this.stringifier = params.stringifier;
    this.log = params.log || NoLogging;
  }

  /**
   * Does the data source allow redicting of the resource.
   * @param {URL} _target The target URL.
   * @param {Response} _response The response requesting the rediction.
   * @returns {boolean} Does the source allow redirecting the resource.
   */
  // eslint-disable-next-line no-unused-vars
  allowsRedirect(_target, _response) {
    return false;
  }

  /**
   * Read document from source.
   * @param {string|URL} source The source of the XML document.
   * @return {Promise<Document>} The promise of the document.
   */
  retrieve(source) {
    if (typeof source === "string" || source instanceof String) {
      // The string.
      return new Promise((resolve, reject) => {
        readFile(source, (err, data) => {
          if (err) {
            // Ending the operation in error.
            this.log.error(`Reading file ${source} failed:`, err);
            reject(err);
          } else {
            try {
              this.log.debug(`Read file ${source}`);
              const result = this.#parser(data);
              this.log.info(`Parsed file ${source}`);
              resolve(result);
            } catch (error) {
              throw new SyntaxError(`Invalid source file ${source}`, {
                cause: new SyntaxError("Invalid XML content", { cause: error }),
              });
            }
          }
        });
      });
    } else {
      // URL.
      // TODO: test validity of the URL

      const rejectHandler = async (_resolve, reject, error) => {
        reject(error);
      };

      // Fetch the URL content.
      const headers = new Headers();
      headers.append("Accept", "application/xml");
      headers.append("Accept", "text/xml");
      /**
       * Fetch content handler.
       * @template [RESULT=Response]
       * @template [ERROR=any]
       * @param {(result: RESULT)=>void} resolve The result consumer.
       * @param {(error: ERROR)=>void} reject The rejection consumer.
       * @param {Response} response The handled response.
       * @returns {Promise<void>} The promise of the completion.
       */
      const contentHandler = async (resolve, reject, response) => {
        if (response.ok) {
          // The response is okay.
          try {
            const data = await response.text();
            this.log.debug(`Read URL ${source}`);
            const result = this.#parser(data);
            this.log.info(`Parsed URL ${source}`);
            return resolve(result);
          } catch (error) {
            throw new SyntaxError(`Invalid source file ${source}`, {
              cause: new SyntaxError("Invalid XML content", { cause: error }),
            });
          }
        } else if (
          response.status % 100 === 3 &&
          this.allowsRedirect(source, response)
        ) {
          // Perform redirect.
          switch (response.status) {
            case 307:
            case 308:
            case 302:
            case 303:
              // See other.
              fetch(response.headers.get(""), headers).then(
                (newResponse) => {
                  return contentHandler(resolve, reject, newResponse);
                },
                (error) => {
                  return rejectHandler(resolve, reject, error);
                }
              );
          }
        } else {
          // The response indicates a failure.
          switch (response.status) {
            case 400:
              this.log.error(
                `Reading url ${source} failed: ${response.statusText}`
              );
              reject(new BadRequestError(response.statusText));
              break;
            case 404:
            case 410:
              this.log.error(`Reading url ${source} failed: Not found`);
              reject(new ResourceMissingError(response.statusText));
              break;
            default:
              reject(new BadRequestError(response.statusText));
          }
        }
      };

      return new Promise((resolve, reject) => {
        fetch(source, { method: "GET", headers }).then(
          (response) => contentHandler(resolve, reject, response),
          (error) => rejectHandler(resolve, reject, error)
        );
      });
    }
  }

  /**
   *
   * @param {string|URL} target The updated target.
   * @param {Document} document The new document content.
   * @returns {Promise<never>} The promise of completion of the operation.
   */
  update(target, document) {
    if (typeof target === "string" || target instanceof String) {
      // File name.
    } else {
      // URL.
      // TODO: Check validity of the url.

      // Performing the posting of the url.
      const headers = new Headers();
      headers.append("Content-Type", "application/xml");

      return new Promise((resolve, reject) => {
        fetch(target, {
          method: "POST",
          headers,
          body: this.#stringifier(document),
        }).then(
          (response) => {
            if (response.ok) {
              resolve();
            } else {
              this.log.error(
                `Writing URL ${target} failed: ${response.status} ${response.statusText}`
              );
              switch (response.status) {
                case 501:
                case 507:
                case 503:
                  // The update failed due resource unavailable.
                  reject(
                    new ResourceUnavailableError(
                      "Resource unavailable",
                      response.headers.has("Retry-After")
                        ? response.headers.get("Retry-After")
                        : null
                    )
                  );
                  break;
                default:
                  reject(new SyntaxError("Could not perform the operation"));
              }
            }
          },
          (error) => {
            reject(error);
          }
        );
      });
    }
  }
}

/**
 * The default XML data source parser using DOMParser and XMLSerializer
 * to perform parsing and serializing the XML.
 */
export class DefaultXmlDataSource extends XmlDataSource {
  constructor() {
    const parser = new DOMParser();
    const builder = new XMLSerializer();
    super(
      /** @type {XMLParser} */
      (source) => {
        const result = parser.parseFromString(source, "text/xml");
        const errorNode = result.querySelector("parsererror");
        if (errorNode) {
          throw new SyntaxError(errorNode.textContent);
        } else {
          return result;
        }
      },
      /** @type {XMLBuilder} */
      (doc) => {
        try {
          return builder.serializeToString(doc);
        } catch (error) {
          throw new SyntaxError("Invalid source tree", { cause: error });
        }
      }
    );
  }
}

/**
 * Convert the Fast XML parse result into DOM Document.
 * @param {ParseResult} jObj The fast XML parse result.
 * @return {Document} The XML DOM Document created from the
 * parse result.
 */
export function jsonToDom(jObj) {
  const result = new XMLDocument();
  Object.getOwnPropertyNames(jObj).forEach((propertyName) => {
    const type = PropertyTypes.parse(propertyName);
    if (type) {
      const content = jObj[propertyName];
      try {
        const child = type.toDOM(result, propertyName, content);
        result.append(child);
      } catch (error) {
        throw new SyntaxError("Invalid parse result", { cause: error });
      }
    } else {
      throw new SyntaxError("Invalid parse result", {
        cause: "Unknown content type",
      });
    }
  });
  return result;
}

/**
 * The options for element construction.
 * @typedef {Object} ElementOptions
 * @property {string} elementName The name of the element.
 * @property {Document} [owner] The owner document.
 * Defaults to a new XML Document.
 */
/**
 * The schema options.
 * @typedef {Object} SchemaOptions
 * @property {string} [schemaUri] The URI of the XML schema.
 * @property {string|null} [schemaPrefix=null] The prefix of the schema name space.
 * @property {string|URL} [schemaLocation] The location of the schema.
 * This value supercedes the schema file and path.
 * @property {string[]} [schemaPath=[]] The path of the schema file.
 * @property {string} [schemaFile] THe schema file.
 * Defaults to no schema file.
 */
/**
 * Structure defining a namespace or lack of it.
 * @typedef {Object} NameSpace
 * @property {string|null} [uri=null] The URI of the name space. If null,
 * no name space is used. Defaults to null.
 * @property {string|null} [prefix=null] The prefix of the name space.
 * If null, the default name space is used. Defaults to null.
 * @property {string|URL|null} [location=null] The location of the schema.
 * Defaults to no location for the schema.
 */
/**
 * Create a name space definition.
 * @param {SchemaOptions & NameSpace} schema The XML schema definition.
 * @returns {NameSpace} The name space.
 */
export function createNamespace({
  uri = null,
  prefix = null,
  location = null,
  schemaUri = null,
  schemaPrefix = null,
  schemaLocation = null,
  schemaFile = null,
  schemaPath = null,
}) {
  const nameSpace = {
    uri: uri ?? schemaUri,
    prefix: prefix ?? schemaPrefix,
  };
  if (location || schemaLocation) {
    nameSpace.location = location ?? schemaLocation;
  } else if (schemaFile) {
    nameSpace.location = path.join(...[...(schemaPath | []), schemaFile]);
  }
  return nameSpace;
}

/**
 * The XML Schema instance name space URI.
 */
export const SCHEMA_INSTANCE_NAMESPACE_URI =
  "http://www.w3.org/2001/XMLSchema-instance";
/**
 * Create a new element.
 * If the namespace has defined name space URI, the element will be
 * created with the given name space.
 * @param {Document} owner The document whose node is created.
 * @param {string} elementName The element name.
 * @param {NameSpace} [namespace] The name space details.
 * @returns {Element} The created element.
 * @throws {DOMException} The name space uri, element name, or prefix was invalid.
 */
export function createElement(
  owner,
  elementName,
  { prefix = null, uri = null, location = null } = {}
) {
  if (uri == null) {
    // The node is not a name space node.
    return owner.createElement(elementName);
  } else {
    // The element is a name space element.
    const element = owner.createElementNS(
      uri,
      prefix == null ? elementName : `${prefix}:${elementName}`
    );
    if (location) {
      element.setAttribute(SCHEMA_INSTANCE_NAMESPACE_ATTRIBUTE, SCHEMA_INSTANCE_NAMESPACE_URI);
      element.setAttribute(SCHEMA_LOCATION_ATTRIBUTE, `${uri} ${location}`);
    }
    return element;
  }
}

/**
 * Get the qualified name of the element within the name space.
 * @param {NameSpace} nameSpace The name space.
 * @param {string} elementName The element name.
 * @returns {string} The qualified name of the element within the name space.
 * @throws {DOMERrror} The element name had invalid cahracter.
 */
export function getElementQName(
  nameSpace = { uri: undefined, prefix: undefined },
  elementName
) {
  if (validNCName(elementName)) {
    if (nameSpace.uri && nameSpace.prefix != null) {
      if (validNCName(nameSpace.prefix)) {
        return `${nameSpace.prefix}:${elementName}`;
      } else {
        throw new DOMException("Invalid name space prefix", "NameSpaceError");
      }
    } else {
      return elementName;
    }
  } else {
    throw new DOMException(
      "Invalid element name",
      "InvalidCharacterError"
    );
  }
}

/**
 * The schema instance namespace attribute.
 */
const SCHEMA_INSTANCE_NAMESPACE_ATTRIBUTE = "xmlns:xsi";

/**
 * The schema location attribute name.
 */
const SCHEMA_LOCATION_ATTRIBUTE = `xsi:schemaLocation`;
/**
 * Create a docuemnt root.
 * @param {string} rootElementName The local name of the root document element.
 * @param {NameSpace} nameSpace The name space of the created document.
 * @returns {Document} The XML Document with given document root element.
 * @throws {DOMException} The creation failed due invalid name space or root element name.
 */
export function createDocumentRoot(
  rootElementName,
  nameSpace = { uri: null, prefix: null }
) {
  const result = new DOMImplementation().createDocument(
    nameSpace.uri,
    getElementQName(nameSpace, rootElementName)
  );
  if (nameSpace.uri && nameSpace.location) {
    result.setAttribute(SCHEMA_INSTANCE_NAMESPACE_ATTRIBUTE, SCHEMA_INSTANCE_NAMESPACE_URI);
    result.setAttribute(
      SCHEMA_LOCATION_ATTRIBUTE,
      `${nameSpace.uri} ${nameSpace.location}`
    );
  }
  return result;
}

export default XmlDataSource;
