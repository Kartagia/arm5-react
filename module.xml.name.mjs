/**
 * @module xml/qname
 *
 * The module defining the XML Qualified names.
 */

import { authorityRegex, regNameRegex } from "./modules.uri.mjs";

/**
 * The regular expresion matching to a scheme.
 */
const schemeRegex = new RegExp("(?<scheme>\\p{L}[\\p{L}\\p{N}\\+.\\-])", "u");
export const userInfoRegex = new RegExp("@", "u");
const pathRegex = new RegExp("", "u");
const queryRegex = new RegExp("\\?", "u");
const fragmentRegex = new RegExp("#", "u");

const uriRegExpSource =
  "^" +
  schemeRegex.source +
  ":" +
  authorityRegex.source +
  "?" +
  pathRegex.source +
  queryRegex.source +
  "?" +
  fragmentRegex.source +
  "?$";

/**
 * Get the regular expression matching to an URI with capturing
 * groups of "protocol", "authority", ""
 * @returns {RegExp} The regular expresision matching to an uri.
 */
export function getURIRegexp() {
  return new RegExp(uriRegExpSource, "u");
}

/**
 * Get the URI segment value validating regular expression.
 * @param {string} segmentName The URI segment name.
 * @returns {RegExp?} The regular expression matching to a valid value
 * of the given segment. An undefined value, if there is no regular expresion
 * for the segment. 
 */
export function getUriSegmentValueRegex(segmentName) {
  switch (segmentName) {
    case "scheme":
      return new RegExp("^" + schemeRegex.source + "$", "u");
    case "path":
      return new RegExp("^" + pathRegex.source + "$", "u");
    case "authority":
      return new RegExp("^" + authorityRegex.source + "$", "u");
    case "query":
      return new RegExp("^" + queryRegex.source + "$", "u");
    case "fragment":
      return new RegExp("^" + fragmentRegex.source + "$", "u");
    case "hostName":
      return new RegExp("^" + regNameRegex.source + "$", "u");
    case "userInfo":
      return new RegExp("^" + userInfoRegex.source + "$", "u");
    default:
      return undefined;
  }
}

/**
 * Test validity of the URI.
 * @param {string|URL} uri The tested uri.
 */
export function validURI(uri) {
  switch (uri.constructor) {
    case String:
      return getURIRegexp().test(uri);
    case URL:
      return true;
    case Function:
      return false;
    default:
      if (uri instanceof Object) {
        if (["scheme", "path"].every((field) => field in uri)) {
          // The uri has mandatory segments of the URI.
          if (
            ["scheme", "path"].every((fieldName) =>
              getUriSegmentValueRegex(fieldName).test(uri[fieldName])
            )
          ) {
            // The path and the scheme are correct - testing optional
            // segments.
            ["authority", "query", "fragment"]
              .filter((fieldName) => fieldName in uri)
              .forEach((fieldName) => {
                if (!getUriSegmentValueRegex(fieldName).test(uri[fieldName])) {
                  return false;
                }
              });
          } else {
            return false;
          }
        } else {
          // The uri lacks mandatory segmetns of the URI.
          return false;
        }
      }
  }
}

/**
 * Test the validity of an XML Name.
 * @param {string} tested
 * @returns {boolean} True, if and only if the given tested is a valid XML
 * name.
 */
export function validXmlName(tested) {
  if (tested.constructor === String && tested.length) {
    let index = 0,
      end = tested.length;
    if (validNameStartCodePoint(getCodePoint(tested))) {
      index++;
      while (index < end) {
        const codePoint = tested.codePointAt(index);
        if (!validNameCodePoint(codePoint)) {
          return false;
        }
        // Moving index by 2,if the code point is high surrogate.
        index += codePoint < 65536 ? 1 : 2;
      }
    }
    // 10*256 * 4*256 = 256*256*40 = 65536*40 + 0d00 -1
    // D800 = 13*16 + 8 = 160 + 48 = 208, 208*256 =
    return index === end; // The lone surrogate at the end is invalid
  } else {
    // Non-strings are never valid NM tokens.
    return false;
  }
}
/**
 * Is the tested a valid XML name token (NMTOKEN).
 * @param {string|String} tested The tested name token.
 * @returns {boolean} True, if and only if the tested is a valid name token.
 */
export function validXmlNameToken(tested) {
  if (tested.constructor === String && tested.length) {
    let index = 0,
      end = tested.length;
    while (index < end) {
      const codePoint = tested.codePointAt(index);
      if (!validNameCodePoint(codePoint)) {
        return false;
      }
      index += codePoint < 65536 ? 1 : 2;
    }
    // 10*256 * 4*256 = 256*256*40 = 65536*40 + 0d00 -1
    // D800 = 13*16 + 8 = 160 + 48 = 208, 208*256 =
    return index === end; // The lone surrogate at the end is invalid
  } else {
    // Non-strings are never valid NM tokens.
    return false;
  }
}
/**
 * Get the Unicode code point value.
 * @param {number|string} codePoint The code point.
 * @returns {number|undefined} The Unicode code point value, or an undefined
 * value for an invalid code point.
 */
function getCodePoint(codePoint) {
  if (codePoint.constructor === Number) {
    if (Number.isInteger(codePoint) && codePoint >= 0 && codePoint < 1114112) {
      return codePoint;
    } else {
      return undefined;
    }
  } else if (codePoint.constructor === String && codePoint.length) {
    return codePoint.codePointAt(0);
  } else {
    return undefined;
  }
}
/**
 * Can a codepoint start a name.
 * @param {number} codePoint The tested code point.
 * @returns {boolean} True, if and only if the code point is a valid
 * start of a xml name.
 */
export function validNameStartCodePoint(codePoint) {
  return (
    [
      ":",
      ["A", "Z"],
      "_",
      ["a", "z"],
      ["\u00c0", "\u00d6"],
      ["\u00d8", "\u00f6"],
      ["\u00f8", "\u02ff"],
      ["\u0370", "\u037d"],
      ["\u037f", "\u1fff"],
      ["\u200c", "\u200d"],
      ["\u2070", "\u21bf"],
      ["\u2c00", "\u2fff"],
      ["\u3001", "\ud7ff"],
      ["\uf900", "\ufdcf"],
      ["\ufdf0", "\ufffd"],
      [65536, 15 * 65536 - 1], // Range 0x010000 - 0x0EFFFF
    ]
      .map((range) =>
        range instanceof Array
          ? [getCodePoint(range[0]), getCodePoint(range[1])]
          : getCodePoint(range)
      )
      .findIndex((range) =>
        range instanceof Array
          ? range[0] <= codePoint && codePoint <= range[1]
          : codePoint === range
      ) >= 0
  );
}
/**
 * Can a codepoint start a name.
 * @param {number} codePoint The tested code point.
 * @returns {boolean} True, if and only if the code point is a valid
 * start of a xml name.
 */
function alsoValidNameTailingCodePoint(codePoint) {
  return (
    ["-", ".", ["0", "9"], "\u00b7", ["\u0300", "\u036f"], ["\u203f", "\u2040"]]
      .map((range) =>
        range instanceof Array
          ? [getCodePoint(range[0]), getCodePoint(range[1])]
          : getCodePoint(range)
      )
      .findIndex((range) =>
        range instanceof Array
          ? range[0] <= codePoint && codePoint <= range[1]
          : codePoint === range
      ) >= 0
  );
}

/**
 * Is the code point a name code point.
 * @param {number} codePoint The tested code point.
 * @returns {boolean} True, if and only if the code point is a valid
 * name code point.
 */
export function validNameCodePoint(codePoint) {
  return (
    validNameStartCodePoint(codePoint) ||
    alsoValidNameTailingCodePoint(codePoint)
  );
}
/**
 * Test whether NCNameness of the XML standard.
 * @param {string} tested The tested name token.
 * @returns {boolean} True, if and only if the given tested is a valid NCName.
 */
export function validNCName(tested) {
  return validXmlName(tested) && tested.indexOf(":") < 0;
}

/**
 * Test the validity of a qualified name.
 * @param {string} tested The tested identifier.
 * @returns {boolean} True, if and only if the tested is a valid qualified
 * XML name.
 */
export function validQName(tested) {
  return validXmlName(tested) && tested.split(":").length < 2;
}

/**
 * The qualified XML name.
 * @typedef {Object} QName
 * @property {string} [prefix] The name space prefix of the qualified name.
 * @property {string} localName The local name of the qualified name.
 * @property {string} [uri] The name space URI of the qualified name, if known.
 */

/**
 * Create a new qualified name.
 * @param {string} localName The local name of the created qualified name.
 * @param {string} [prefix] The namespace prefix of the qualified name. Defaults
 * to the default name space (null).
 * @param {string} [uri] The name space URI of the name space.
 * Defaults to no name space URI.
 * @returns {QName} The qualified name.
 * @throws {SyntaxError} The qualified name is invalid.
 */
export function createQName(localName, { prefix = null, uri = undefined }) {
  // Testing the parameters.
  if (!validXmlName(localName) || localName.indexOf(":") >= 0) {
    throw new SyntaxError(`Invalid local name`);
  }
  if (prefix && (!validXmlName(prefix) || prefix.indexOf(":") >= 0)) {
    throw new SyntaxError(`Invalid prefix`);
  }
  if (uri) {
    try {
      const url = URL(uri);
      if (url.toString() != uri) {
        throw new SyntaxError("Invalid uri", {
          cause: new RangeError(`Invalid namespace uri`),
        });
      }
    } catch (error) {
      throw new SyntaxError(`Invalid uri`, { cause: error });
    }
  }

  // Creating the object.
  return {
    localName,
    prefix,
    uri,
    toString() {
      return `${this.prefix == null ? "" : `${this.prefix}:`}${this.localName}`;
    },
    isEqual(other) {
      if (typeof other === "string" || other instanceof String) {
        // Comparing string representations.
        return this.toString() == other;
      } else if (other instanceof Object) {
        if ("uri" in other && this.uri) {
          // Both the current and other has URIs, which takes precedence
          // over prefixes.
          // Comparing URIs and then local names.
          return this.uri == other.uri && this.localName === other.localName;
        } else {
          // Using prefixes.
          return (
            this.prefix === other.prefix && this.localName === other.localName
          );
        }
      } else {
        return false;
      }
    },
  };
}
/**
 * Parse a qualified name string into qualified name.
 * @param {string} source The parsed qualified name.
 * @returns {QName} The resulting qualified name.
 * @throws {SyntaxError} The given source was not a valid qualified name.
 */

export function parseQName(source) {
  if (validQName(source)) {
    const parts = source.split(":");
    if (parts.length) {
      return {
        prefix: parts[0],
        localName: parts[1],
        toString() {
          return `${this.prefix}:${this.localName}`;
        },
        isEqual(other) {
          if (typeof other === "string" || other instanceof String) {
            // Comparing string representations.
            return this.toString() == other;
          } else if (other instanceof Object) {
            if ("uri" in other && this.uri) {
              // Both the current and other has URIs, which takes precedence
              // over prefixes.
              // Comparing URIs and then local names.
              return (
                this.uri == other.uri && this.localName === other.localName
              );
            } else {
              // Using prefixes.
              return (
                this.prefix === other.prefix &&
                this.localName === other.localName
              );
            }
          } else {
            return false;
          }
        },
      };
    } else {
      return {
        prefix: null,
        localName: parts[0],
      };
    }
  } else {
    throw new SyntaxError("Invalid qualified name");
  }
}
/**
 * Test the validity of an user defined identifier.
 * @param {string} tested The tested identifier.
 * @returns {returns} True, if and only if the given identifier is a valid
 * XML user defined identifier.
 */
export function validCustomId(tested) {
  return validXmlName(tested) && !/^xml:/i.test(tested);
}

/**
 * Test validity of a new identifier.
 * @param {string} identifier The tested identifier.
 * @param {Document|Element} [contextElement] The context element.
 * Defaults to ta new XML Document.
 */
export function validXmlIdentifier(identifier, contextElement = undefined) {
  const owner =
    contextElement == null
      ? new XMLDocument()
      : contextElement instanceof Document
      ? contextElement
      : contextElement.ownerDocument;
  return validXmlName(identifier) && owner.getElementById(identifier) == null;
}

/**
 * Test validity of a new key attribute.
 * @param {string} attribute The attribute name.
 * @param {string} value The tested identifier.
 * @param {Document|Element} contextElement The context element.
 */
export function validXmlKey(attribute, value, contextElement) {
  if (validXmlName(value)) {
    const nodes = contextElement.querySelectorAll(
      attribute === "id" ? `*#${value}` : `*[${attribute}="${value}"]`
    );
    return nodes.length === 0;
  }
  return false;
}
