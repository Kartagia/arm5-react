/**
 * @module data/xml
 *
 * The XML data container module.
 */

import { readFile, writeFile } from "fs";
import { XMLBuilder, XMLParser } from "fast-xml-parser";

export function valueToString(value, indent = "\t", prefix = "") {
  switch (typeof value) {
    case "symbol":
      return `[Symbol]`;
    case "object":
      if (value instanceof Array) {
        return arrayToString(value, indent, prefix);
      } else if (value instanceof Function) {
        return `[Function]${value.name}`;
      } else {
        return pojoToString(value, indent, prefix);
      }
    default:
      return `${value.toString()}`;
  }
}

export function arrayToString(array, indent = "\t", prefix = "") {
  let result = `[`;
  if (array.length) {
    const itemPrefix = `${prefix}${indent}`;
    const delimiter = `${"\n"}${itemPrefix}`;
    result = result.concat(
      `${delimiter}`,
      array
        .map((entry) => valueToString(entry, indent, itemPrefix))
        .join(",".concat(delimiter))
    );
    result = result.concat(`${"\n"}${prefix}]`);
  } else {
    result = result.concat("]");
  }
  return result;
}

/**
 * Convert POJO to string.
 * @param {Object} pojo The POJO which is converted to string.
 * @param {string} [indent] The identation.
 * @param {string} [prefix] The prefix of the lines.
 * @returns {string}
 */
export function pojoToString(pojo, indent = "\t", prefix = "") {
  let result = "{";
  const properties = Object.getOwnPropertyNames(pojo);
  if (properties && properties.length) {
    const itemPrefix = `${prefix}${indent}`;
    const delimiter = `${"\n"}${itemPrefix}`;
    result = result.concat(delimiter);
    const propertyValues = properties.map((propertyName) => {
      const propertyValue = pojo[propertyName];
      const propertyValueString = valueToString(
        propertyValue,
        indent,
        itemPrefix
      );
      return `${propertyName}:${propertyValueString}`;
    });
    result = result.concat(propertyValues.join(`,${delimiter}`));
    result = result.concat(`${"\n"}${prefix}}`);
  } else {
    result = result.concat("}");
  }
  return result;
}

/**
 * The attribute node to string.
 * @param {Attr} attrNode The outputted attribute node.
 * @returns {string} The string representation of the attribute.
 */
function attributeToString(attrNode) {
  return `${attrNode.nodeName}="${attrNode.value}"`;
}

function attributesToString(attributeNodeMap) {
  const result = [];
  for (let i = 0; i < attributeNodeMap.length; i++) {
    const attribute = attributeNodeMap.item(i);
    result.push(attributeToString(attribute));
  }
  return result.join(" ");
}

/**
 * Convert node into string.
 * @param {Node} node The stringified node.
 * @returns {string} The string representation of the node.
 */
function nodeToString(node) {
  switch (node.type) {
    case Node.DOCUMENT_NODE:
      return `${nodeToString(node.doctype)}${nodeListToString(node.children, [
        Node.DOCUMENT_TYPE_NODE,
      ])}`;
    case Node.DOCUMENT_FRAGMENT_NODE:
      // Document fragment.
      return nodeListToString(node.childNodes, [
        Node.DOCUMENT_TYPE_NODE,
        Node.ATTRIBUTE_NODE,
        Node.DOCUMENT_NODE,
      ]);
    case Node.ATTRIBUTE_NODE:
      return attributeToString(/** @type {Attr} */ node);
    case Node.ELEMENT_NODE:
      return elementToString(/** @type {Element} */ node);
    case Node.COMMENT_NODE:
      return `<!--${node.textContent}-->`;
    case Node.CDATA_SECTION_NODE:
      return `<[CDATA[${node.textContent}]]`;
    case Node.PROCESSING_INSTRUCTION_NODE:
      return `<?${node.nodeName}${node.data}?>`;
    default:
      return undefined;
  }
}

/**
 * Create string representation of the nodes.
 * @param {NodeList|HTML} nodes The outputted nodes.
 * @param {Array<number>} [excludeTypes=[Node.ATTRIBUTE_NODE]] The excluded node types.
 * @returns {string} The string representation of the nodes.
 */
function nodeListToString(nodes, excludeTypes = [Node.ATTRIBUTE_NODE]) {
  if (nodes.length) {
    const members =
      nodes instanceof HTMLCollection
        ? Array.from(nodes)
        : nodes instanceof NodeList
        ? Array.from(nodes.values())
        : [];
    const result = [];
    members.forEach((node) => {
      if (!excludeTypes.find((type) => type === node.type)) {
        // Proper type to add.
        result.push(nodeToString(node));
      }
    });
    return result.join("");
  } else {
    return undefined;
  }
}

function elementToString(element) {
  if (element instanceof Element) {
    const tagName = element.tagName;
    const content = nodeListToString(element.childNodes);
    const attributes = attributesToString(element.attributes);
    if (content) {
      return `<${tagName}${attributes}>${content}</${tagName}>`;
    } else {
      return `<${tagName}${attributes}/>`;
    }
  } else {
    return undefined;
  }
}

/**
 * Create Processing Instruction data form parse result value.
 * @param {XmlDocument} doc The XML document owning the created PI.
 * @param {string} piName The process instruction property name.
 * @param {ParseResultValue} content The data source.
 */
export function createPIData(doc, piName, content) {
  if (content instanceof Array) {
    return content
      .map((item) => {
        return createPIData(doc, piName, item);
      })
      .join(" ");
  } else if (content instanceof Object) {
    return Object.getOwnPropertyNames(content)
      .map((propertyName) => {
        const type = PropertyTypes.parse(propertyName);
        if (type) {
          // Type is valid.
          const match = type.regex.exec(propertyName);
          switch (type) {
            case PropertyTypes.Attribute:
              return `${match.groups.tag}="${this.escapeAttribute(
                content[propertyName]
              )}"`;
            case PropertyTypes.Element:
              return elementToString(
                type.toDOM(doc, match.groups.tag, content[propertyName])
              );
            case PropertyTypes.Node:
              switch (match.groups.tag) {
                case "text":
                  return this.unescapeXml(content[propertyName]);
                case "cdata":
                case "cdata-section":
                  return `<![CDATA[${content[propertyName]}]]`;
                case "comment":
                  return `<!--${content[propertyName]}-->`;
                default:
                  // error.
                  throw Error("Unknown node type: " + match.groups.tag);
              }
            default:
              throw DOMError("Invalid PI content");
          }
        } else {
          // Unknown property type.
        }
      })
      .join(" ");
  } else {
    return content;
  }
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
 * @property {(document: XMLDocument, propertyName: string, source:ParseResultValue)=>Node} toDOM Converts the XmlDataSource parse result value to
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
        const data = createPIData(content);
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
 * @returns {XMLDocument} The XML Document built from the source.
 * @throws {SyntaxError} The parse fails due syntax error.
 */

/**
 * A function converting XML document into its string representation.
 * @callback XMLStringifier
 * @param {XMLDocument|Node|Attr} source The XML Document, whose string representation
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
    this.log = params.log ||
      console || {
        info: () => {},
        group: () => {},
        groupEnd: () => {},
        table: () => {},
        debug: () => {},
        error: () => {},
        log: () => {},
        warn: () => {},
      };
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
   * @return {Promise<XMLDocument>} The promise of the document.
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
   * @param {XMLDocument} document The new document content.
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
 * @return {XMLDocument} The XML DOM Document created from the
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
 * The FastXML based implementation of the XML data source.
 */
export class FastXmlDataSource extends XmlDataSource {
  /**
   * The parser parsing the data source XML.
   * @type {XMLParser}
   */
  #fastXmlParser;

  /**
   * The builder building the XML to write.
   * @type {XMLBuilder}
   */
  #fastXmlBuilder;

  /**
   * Create a new XML Data Source.
   */
  constructor() {
    const options = {
      preserveOrder: true,
      ignoreAttributes: false,
      alwaysCreateTextNode: true,
      format: true,
    };
    const parser = new XMLParser(options);
    const builder = new XMLBuilder(options);
    super(
      (value) => {
        const jObj = parser.parse(value);

        return jsonToDom(jObj);
      },
      (document) => {
        const pObj = {};
        if (document);
        builder.build(pObj);
      }
    );
    this.options = options;
    this.#fastXmlParser = parser;
    this.fastXmlBuilder = builder;
  }

  /**
   * Read XML from source.
   * @param {string|URL} source
   * @returns {Promise<JSON>} The XML of the
   */
  // eslint-disable-next-line no-unused-vars
  async readSource(source, encoding = "utf-8") {
    if (typeof source === "string") {
      // File.
      return new Promise((resolve, reject) => {
        console.group(`Loading from file ${source}`);
        readFile(source, { encoding }, async (err, data) => {
          if (err) {
            console.error("Could not read file: ", err);
            console.groupEnd();
            reject(err);
          } else {
            console.log("Parsing data:", data);
            try {
              const parsed = this.#fastXmlParser.parse(data);
              console.log(`Parse successful.`, pojoToString(parsed));
              resolve(parsed);
            } catch (error) {
              console.error("Parse failed: ", error);
              console.groupEnd();
              reject(error);
            }
          }
        });
      });
    } else {
      // URL:
      const headers = new Headers();
      headers.append("Accept", "application/xml");
      headers.append("Accept", "text/xml");
      console.table(headers);
      return fetch(source, {
        method: "get",
        headers,
      }).then((result) => {
        if (result.ok) {
          console.info("Data retrieved");
          const xml = this.#fastXmlParser.parse(result.body);
          console.info("Parse successful");
          return xml;
        } else {
          console.error(
            `Parsing ${source} failed: [${result.status} ${result.statusText}] ${result.body}`
          );
          throw Error(`Fetch XML from URL: ${source} failed: ${result.body}`);
        }
      });
    }
  }

  /**
   * Escape attribute content.
   * @param {string} content The escaped attribute content.
   * @returns {string} The attribute content with proper escape.
   */
  escapeAttribute(content) {
    return escapeAttribute(content);
  }

  /**
   * Create Process Instruction data.
   * @param {XMLDocument} document The owner of the document.
   * @param {string} propertyName The property name of the handled property.
   * @param {Object} content The content of the PI.
   * @returns {string} The DOM processing instruction data.
   */
  createPIData(document, propertyName, content) {
    return createPIData(document, propertyName, content);
  }

  /**
   * Get the property type of the property name.
   * @param {string} propertyName The tested property name.
   * @returns {PropertyType?} The property type of the properyt name.
   */
  static getPropertyType(propertyName) {
    return PropertyTypes.parse(propertyName);
  }

  /**
   * Convert Fast-XML-Parse result to DOM element, and add it to the parent.
   * @param {XMLDocument|Element} parent The parent of the parsed content.
   * @param {ParseResultValue} content The content of the value.
   */
  static jsonToDom(parent, content) {
    if (parent instanceof Document) {
      // Parsing root entry.
      const document = parent;
      /**
       * @type {Element}
       */
      const root = parent.documentElement;
      const properties = Object.getOwnPropertyNames(content);
      properties.forEach((propertyName) => {
        const child = jsonToDom(properties[propertyName]);
        if (child) {
          switch (child.nodeType) {
            case Node.DOCUMENT_TYPE_NODE:
              document.doctype.replaceWith(child);
              break;
            default:
              root.appendChild(child);
          }
        } else {
          // Invalid node.
        }
      });
    } else {
      // The parent is an Element.
      const document = parent.ownerDocument;
      const root = parent;
      const properties = Object.getOwnPropertyNames(content);
      properties.forEach((propertyName) => {
        const type = this.getPropertyType(propertyName);
        if (type) {
          // The type is knon.
          const child = type.toDOM(
            document,
            propertyName,
            properties[propertyName]
          );
          if (child) {
            switch (child.nodeType) {
              case Node.DOCUMENT_NODE:
                throw new DOMError(
                  "Invalid content: Document inside an element"
                );
              case Node.DOCUMENT_TYPE_NODE:
                throw new DOMError(
                  "Invalid content: Document type declaration inside an element"
                );
              case Node.DOCUMENT_FRAGMENT_NODE:
                // Adding the document fragment.
                root.appendChild(...child.childNodes.values());
                break;
              case Node.ATTRIBUTE_NODE:
                root.setAttribute(child);
                break;
              default:
                root.appendChild(child);
            }
          } else {
            throw new DOMException();
          }
        } else {
          // Unknown node.
          throw new DOMError("Unknown node type: " + propertyName);
        }
      });
    }
  }

  /**
   * Read XML from source.
   * @param {string|URL} source The source.
   * @returns {Promise<XMLDocument>} The XML document of the read XML.
   */
  async readDOM(source) {
    return this.read(source).then((json) => {
      const result = new XMLDocument();
      this.jsonToDom(result, json);
    });
  }

  /**
   * Write data to the XML data source.
   * @param {XMLDocument|JSON} data The written XML document or JSON data.
   * @param {File|URL} target The target of hte operation.
   * @returns {Promise} The promise of the completion of the write.
   */
  // eslint-disable-next-line no-unused-vars
  async write(data, target) {
    return new Promise((resolve, reject) => {
      if (typeof target === "string") {
        console.group(`Writing to file: ${target}`);
        writeFile(target, this.fastXmlBuilder.build(data), (err) => {
          if (err) {
            console.error(`Write failed: ${err}`);
            console.groupEnd();
            reject(err);
          } else {
            console.info(`Write successful`);
            console.groupEnd();
            resolve();
          }
        });
      } else {
        // Sending url
        console.group(`Posting to URL: ${target}`);
        const headers = new Headers();
        headers.append("Content-Type", "application/xml");
        fetch(target, {
          method: "post",
          headers,
          body: this.fastXmlBuilder.build(data),
        }).then(
          (res) => {
            if (res.ok) {
              // The update of the URI was okay.
              console.log("Data updated");
              console.groupEnd();
              resolve();
            } else {
              console.error(`Update failed: ${res.status} ${res.statusText}`);
              console.groupEnd();
              reject({ status: res.status, message: res.statusText });
            }
          },
          (error) => {
            reject(error);
          }
        );
      }
    });
  }
}

export default XmlDataSource;
