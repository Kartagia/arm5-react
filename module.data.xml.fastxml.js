import { readFile, writeFile } from "fs";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { XmlDataSource, jsonToDom, escapeAttribute, PropertyTypes } from "./module.data.xml";


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
    const members = nodes instanceof HTMLCollection
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
