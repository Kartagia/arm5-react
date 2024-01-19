/**
 * @module URI
 * This module contains URI related functions, and two URI related
 * classes URI, and URN to complement with JavaScript URL.
 */

import { userInfoRegex } from "./module.xml.name.mjs";

/**
 * Escape the value.
 * @param {string} value The literal string sequence.
 * @return {string} The regular expression source literally matching to the value.
 */
export function regexEscape(value) {
  const regex = /[^$(){}[\]\\/.\-+*?]/g;
  return value.replaceAll(regex, "\\$&");
}

/**
 * Escape regular expression sequence inside the character group.
 * @param {string} value The value secured.
 * @return {string} The string matching to all characters of the matching group.
 */
export function regexCharacterGroupEscape(value, unicodeGroups = false) {
  // Get array containing escape sequences and strings between them.
  const symbols = value.split({
    [Symbol.split](str) {
      const regex = unicodeGroups
        ? /\\(?<escapeTarget>.|[p]\{(?<group>\w+)\})/gi
        : /\\(?<escapeTarget>.)/gi;
      let match,
        start = 0;
      const result = [];
      while ((match = regex.exec(str))) {
        result.push(str.substring(start, match.index));
        result.push(match.groups.escapeTarget);
        start = regex.lastIndex;
      }
      if (start < str.length) {
        result.push(str.substring(start));
      }
      return result;
    },
  });
  return symbols
    .map((symbol) => {
      if (symbol.startsWith("\\")) {
        return symbol;
      } else {
        return symbol.replaceAll(/[-\]\\]/g, "\\$&");
      }
    })
    .join("");
}

/**
 * The percent encoding catching regular expression of the RFC 3986.
 */
const PercentEncodingRegex = /%[0-9a-fA-F]{2}/;

/**
 * The list of the generic delimiters of the URI standard RFC3986.
 * @type {string[]}
 */
const genericDelimiters = [":", "/", "?", "#", "[", "]", "@"];
/**
 * The list of the sub-delimiters of the URI standard RFC3986.
 */
const subDelimiters = ["!", "$", "&", "'", "(", ")", "*", "+", ",", ";", "="];
/**
 * The reserved characters of the URI standard RFC3986.
 * @type {string[]}
 */
// eslint-disable-next-line no-unused-vars
const reserved = [...genericDelimiters, ...subDelimiters];

/**
 * The list of the unreserved regular expression sequences.
 */
const unreserved = ["\\w", "\\.", "_", "\\-"];

/**
 * The regular expression matching an unserved character.
 */
// eslint-disable-next-line no-unused-vars
const unreservedRegexp = new RegExp("[" + unreserved.join("") + "]");

const pCharRegex = /(?:[!$&'()*+,;=:@\w._~-]|%[0-9a-fA-F]{2})/;

/**
 * Get a new regular expression matching to a RF3986 segment.
 * @returns {RegExp} The regular expression matching to the regular expression.
 */
export function segmentRegex() {
  return new RegExp("(?:" + pCharRegex.source + "*)");
}
/**
 * Get a new regular expression matching to a RF3986 non-zero length segment.
 * @returns {RegExp} The regular expression matching to the regular expression.
 */
export function nonZeroSegmentRegex() {
  return new RegExp("(?:" + pCharRegex.source + "+)");
}

/**
 * Get a new regular expression matching to a RF3986 non-zero length segment without colons.
 * @returns {RegExp} The regular expression matching to the regular expression.
 */
export function nonZeroSegmentWithoutColonRegex() {
  return new RegExp(
    "(?:[" +
      [...unreserved, ...subDelimiters, "@"]
        .map(regexCharacterGroupEscape)
        .join("") +
      "]|" +
      PercentEncodingRegex.source +
      ")"
  );
}
/**
 * Get a new regular expression matching to a RF3986 path segment without scheme.
 * @param {string} [pathDelimiter="/"] The path delimiter.
 * @returns {RegExp} The regular expression matching to the regular expression.
 */
export function noSchemePathRegex(pathDelimiter = "/") {
  return new RegExp(
    "(?:" +
      nonZeroSegmentWithoutColonRegex().source +
      `(?:${regexEscape(pathDelimiter)}` +
      segmentRegex().source +
      ")*" +
      ")"
  );
}

/**
 * Get a new regular expression matching to a RF3986 absolute or empty path segment.
 * @param {string} [pathDelimiter="/"] The path delimiter.
 * @returns {RegExp} The regular expression matching to the regular expression.
 */
export function absoluteOrEmptyPathRegex(pathDelimiter = "/") {
  return new RegExp(
    "(?:" +
      `(?:${regexEscape(pathDelimiter)}` +
      segmentRegex().source +
      ")*" +
      ")"
  );
}
/**
 * Get a new regular expression matching to a RF3986 absolute path segment.
 * @param {string} [pathDelimiter="/"] The path delimiter.
 * @returns {RegExp} The regular expression matching to the regular expression.
 */
export function absolutePathRegex(pathDelimiter = "/") {
  const regexDelimiter = regexEscape(pathDelimiter);
  return new RegExp(
    "(?:" +
      regexDelimiter +
      "(?:" +
      nonZeroSegmentRegex().source +
      "(?:" +
      regexDelimiter +
      segmentRegex().source +
      ")*" +
      ")?" +
      ")"
  );
}
/**
 * Get a new regular expression matching to a RF3986 rootless path segment.
 * @param {string} [pathDelimiter="/"] The path delimiter.
 * @returns {RegExp} The regular expression matching to the regular expression.
 */
export function rootlessPathRegex(pathDelimiter = "/") {
  return new RegExp(
    "(?:" +
      nonZeroSegmentRegex().source +
      "(?:" +
      regexEscape(pathDelimiter) +
      segmentRegex().source +
      ")*" +
      ")"
  );
}

/**
 * Get a new path matching regular expression.
 * @param {string} [pathDelimiter="/"] The path delimiter.
 * @returns {RegExp} The regular expression matching to a valid path.
 * The expression will store the path to the capturing group of <code>path</code>.
 */
export function getPathRegex(pathDelimiter = "/") {
  return new RegExp(
    "(?<path>(?:" +
      [
        rootlessPathRegex(pathDelimiter),
        noSchemePathRegex(pathDelimiter),
        absoluteOrEmptyPathRegex(pathDelimiter),
        absolutePathRegex(pathDelimiter),
      ]
        .map((re) => re.source)
        .join("|") +
      ")?)"
  );
}

/**
 * A predicate for filters. This is the default JavaScript predicate.
 * @template TYPE
 * @callback FilterPredicate
 * @param {TYPE} value The tested value.
 * @param {number} [index] The index.
 * @param {TYPE[]} [values] The all values of the iteration.
 */

/**
 * The class representing a path.
 */
export class Path {
  /**
   * The path segments.
   * @type {string[]}
   */
  #segments = [];

  /**
   * Does the path support absolute path.
   * @type {boolean}
   */
  #allowAbsolute;

  /**
   * The delimiter between path segments.
   * @type {string}
   */
  #delimiter;

  /**
   * The predicate validating segment.
   * @type {function}
   */
  #segmentValidator;

  /**
   * Create a new path.
   * @param {Object} options
   * @param {string} [options.delimiter="/"] The path segment separator.
   * @param {boolean} [options.allowAbsolute=true] Does the the path allow absolute
   * path (an empty first element).
   * @param {string|string[]} [options.segments=[]] The initial segments.
   * @param {FilterPredicate<string>} [options.segmentValidator] The segment validator.
   */
  constructor({
    delimiter = "/",
    segments = [],
    allowAbsolute = true,
    segmentValidator = (segment) =>
      /^(?:[\w._~-]|%[\da-fA-F]{2})+$/.test(segment),
  }) {
    this.#delimiter = delimiter;
    this.#allowAbsolute = allowAbsolute;
    this.#segmentValidator = segmentValidator;
    if (
      (segments.constructor === String ? [segments] : segments).every(
        (segment, index) => this.validSegment(segment, index)
      )
    ) {
      this.#segments.push(
        ...(segments.constructor === String ? [segments] : segments).map(
          (segment) => "" + segment
        )
      );
    } else {
      throw new RangeError("Invalid path segments");
    }
  }

  /**
   * Test the validity of the segment.
   * @param {string} segment The tested segment.
   * @param {number} index The index of the tested segment.
   * @returns {boolean} True, if and only if the segment is valid.
   */
  validSegment(segment, index) {
    return (
      this.#segmentValidator(segment, index, this.#segments) ||
      (index === 0 && segment === "" && this.allowAbsolute)
    );
  }

  /**
   * Does the path allow absolute paths.
   * An absolute path starts with an empty segment.
   * @type {boolean}
   */
  get allowAbsolute() {
    return this.#allowAbsolute;
  }

  /**
   * The delimiter separating the path segments.
   * @type {string}
   */
  get pathSeparator() {
    return this.#delimiter;
  }

  /**
   * The path segments.
   * @type {string[]}
   */
  get segments() {
    return [...this.#segments];
  }

  /**
   * The primitive representation of the path.
   * @returns {string} The string representation of the path.
   */
  valueOf() {
    return this.toString();
  }

  /**
   * Get the string representation of the segment.
   */
  toString() {
    return this.#segments.join(this.#delimiter);
  }
}

export class URN extends URI {
  /**
   *
   * @param {string} schema The schema of the URN.
   * @param {string|string[]|Path} path The path of the URN.
   */
  constructor(schema, path) {
    super({ schema, path, type: "URN" });
  }
}

/**
 * Class URI represents generic uris.
 */
export class URI {
  /**
   * The delimiter between schema and the rest of the URI.
   * @type {string}
   */
  static get SCHEMA_DELIMITER() {
    return ":";
  }

  /**
   * The URN path separator.
   * @type {string}
   */
  static get URN_PATH_SEPARATOR() {
    return ":";
  }

  /**
   * The URL path separator.
   * @type {string}
   */
  static get URL_PATH_SEPARATOR() {
    return "/";
  }

  /**
   * The type of the URI.
   * @type {string}
   */
  #type;

  /**
   * The path segments. An absolute URL path starts with an empty segment.
   * @type {string[]}
   */
  #path = [];

  /**
   * The schema of the URI.
   * @type {string}
   */
  #schema = null;

  /**
   * The authority of the URI.
   * Only URLs have this.
   */
  #authority = {
    /**
     * The user name of the authority.
     * @type {string|null}
     */
    userName: null,
    /**
     * The password of the authority.
     * @type {string|null}
     */
    password: null,
    /**
     * The host name of the authority.
     * @type {string|undefined}
     */
    hostName: undefined,

    /**
     * The port of the host.
     * @type {number|undefined}
     */
    port: undefined,
  };

  /**
   * The query part of the URI as mapping from query parameter names to query
   * parameter values. Only URLs have this section.
   * @type {Map<string, string[]>}
   */
  #query = {};

  /**
   * The fragment of the URI.
   * @type {string}
   */
  #fragment = null;

  constructor({
    path,
    schema = null,
    authority = null,
    query = null,
    fragment = null,
    type = "URL",
  }) {
    this.type = type;
    this.schema = schema;
    this.authority = authority;
    this.path = path;
    this.query = query;
    this.fragment = fragment;
    this.validate();
  }

  /**
   * Does the URI have a field.
   * @param {string} fieldName The field name.
   * @returns {boolean} True, if and only if the URI has teh given field.
   */
  has(fieldName) {
    switch (fieldName) {
      case "authority":
        return ["hostName", "userName"].some(
          (fieldName) => this.#authority[fieldName] != null
        );
      case "path":
        return this.type === "URN" ? this.path.length : true;
      default:
        return this[fieldName] != null;
    }
  }

  /**
   * Validates the URI.
   * @throws {URIError} The URI was invalid.
   */
  validate() {
    const errors = {};
    if (["schema", "path"].every((fieldName) => this.has(fieldName))) {
      switch (this.type) {
        case "URL":
          if (this.has("authority")) {
            // The authority
          } else {
            //
          }
          break;
        case "URN":
          ["authority", "query", "fragment"]
            .filter((fieldName) => this.has(fieldName))
            .forEach((fieldName) => {
              if (!(fieldName in errors)) {
                errors.invalidFields = {
                  fields: [],
                  toString() {
                    return `URN does not allow fields ${
                      this.fields.length > 1
                        ? `${this.fields
                            .slice(0, this.fields.length - 2)
                            .join(",")}, and ${
                            this.fields[this.fields.length - 1]
                          }`
                        : this.fields[0]
                    }`;
                  },
                };
              }
              errors.invalidFields.fields.push(fieldName);
            });
      }
    }

    URIError("");
  }

  /**
   * The path separator of the URI.
   * @type {string}
   */
  get pathSeparator() {
    return this.type === "URN"
      ? URI.URN_PATH_SEPARATOR
      : URI.URL_PATH_SEPARATOR;
  }

  /**
   * Does the URI allow absolute path. An absolute path starts with an empty segment.
   * @type {boolean}
   */
  get allowAbsolute() {
    return this.type === "URL";
  }

  /**
   * Get the path of the uri.
   */
  get path() {
    const delimiter = this.pathSeparator;
    const segmentValidator = this.validSegment;
    const allowAbsolute = this.allowAbsolute;
    return new Path({
      delimiter,
      segmentValidator,
      allowAbsolute,
      segments: this.#path,
    });
  }

  /**
   * Setter for the path.
   * @param {string|string[]|Path} newPath The new path value.
   * @throws {RangeError} The value of the new path is incorrect.
   * @throws {TypeError} The type of the new path was invalid.
   */
  set path(newPath) {
    if (newPath instanceof Path) {
      if (
        newPath.pathSeparator === this.pathSeparator &&
        this.allowAbsolute === newPath.allowAbsolute
      ) {
        this.#path = newPath.segments;
      } else {
        throw new RangeError("Invalid new path: incompatible path");
      }
    } else if (newPath.constructor === String) {
      const regex = getPathRegex(this.pathSeparator);
      if (regex.test(newPath.toString())) {
        const candidate = newPath
          .split(this.pathSeparator)
          .map(decodeURIComponent);
        if (candidate.length && candidate[0] === "" && !this.allowAbsolute) {
          throw new RangeError(
            "Invalid new path: absolute paths are not allowed"
          );
        }
        if (this.has("authority")) {
          if (
            candidate.length &&
            candidate[0].length === 0 &&
            (!this.getAbsolutePathRegex().test(candidate[1]) ||
              candidate.slice(1).some(
                (segment) =>
                  !segmentRegex(this.pathSeparator)
                    .map((re) => allMatchingRegex(re))
                    .test(segment)
              ))
          ) {
            throw new RangeError(
              "Invalid new path: Path not suitable with authority"
            );
          }
        } else if (
          candidate.length &&
          candidate[0].length === 0 &&
          (!this.allowAbsolute ||
            (!nonZeroSegmentRegex(this.pathSeparator).test(candidate[0]) &&
              candidate
                .slice(1)
                .some(
                  (segment) => !segmentRegex(this.pathSeparator).test(segment)
                )))
        ) {
          // The path is an invalid absolute path.
          throw new RangeError("Invalid new path: Invalid absolute path");
        } else if (
          candidate.length &&
          (!rootlessPathRegex(this.pathSeparator).test(candidate[0]) ||
            candidate.slice(1).some((segment) => !segmentRegex().test(segment)))
        ) {
          // The path is an invalid rootless path segment.
          throw new RangeError("Invalid new path: Invalid rootless path");
        }
        this.#path = candidate;
      } else {
        throw new RangeError("Invalid new path");
      }
    } else if (newPath.constructor === Array) {
      if (this.validSegments(newPath)) {
        this.#path = newPath;
      } else {
        throw new RangeError("Invalid new path");
      }
    } else {
      throw new TypeError("Invalid new path type");
    }
  }

  /**
   * Get the regular expression matching to an absolute path.
   * @returns {RegExp} The regular expression matching to the whole absolute path.
   */
  getAbsolutePathRegex() {
    return absoluteOrEmptyPathRegex(this.pathSeparator).map(allMatchingRegex());
  }

  get authority() {
    return this.#authority;
  }

  get userName() {
    return this.#authority.userName;
  }

  get password() {
    return this.#authority.password;
  }

  get hostName() {
    return this.#authority.hostName.name;
  }

  get host() {
    return this.#authority.hostName;
  }

  get port() {
    return this.#authority.hostName.port;
  }

  /**
   * The scheme of the uri.
   * @type {string?}
   */
  get scheme() {
    return this.#schema;
  }

  /**
   * The type of the URI.
   * @type {string}
   */
  get type() {
    return this.#type;
  }

  /**
   * Test validity of the type.
   * @param {string} type The tested type.
   * @returns {boolean} True, if and only if the type is valid type.
   */
  validType(type) {
    return (
      type.constructor === String &&
      ["URN", "URL"].indexOf(type.toString()) >= 0
    );
  }

  set type(type) {
    if (this.validType(type)) {
      this.#type = type;
    } else {
      throw new TypeError("Invalid type");
    }
  }
}
const ip4WordRegex = new RegExp("(?:25[0-5]|2[0-4]\\d|1?\\d{2}|\\d{1,2})");
const ip6WordRegex = new RegExp("(?:0|[1-9a-fA-F][\\da-fA-F]{0,3})");
const ip4hostRegex = new RegExp(
  "(?:" + ip4WordRegex.source + "(?:\\." + ip4WordRegex.source + "{3})",
  "u"
);
/**
 * Generate an array containing range of integers. If step
 * is negative, the elements are in ascending order.
 * @param {number} start The starting value of the range.
 * @param {number} end The largest value of the range.
 * @param {number} [step=1] The step of the range elements.
 * @returns {Array<number>} The array containing all values
 * equal to (start + n*step) within range [start, end].
 * @throws {RangeError} The step is zero or not defined.
 */
const range = (start, end, step = 1) => {
  if (Number.isFinite(step) && step) {
    const result = [];
    if (step > 0) {
      for (let i = start; i <= end; i += step) {
        result.push(i);
      }
    } else {
      for (let i = start; i >= end; i += step) {
        result.push(i);
      }
    }
    return result;
  } else {
    throw new RangeError("Invalid step causing infinite range");
  }
};

/**
 * IPv6 last 2 segments required different handling.
 * The last 2 segments can be represented with IPv4 address.
 */
const ip6fullLast32bitSource =
  "(?:" +
  ip4hostRegex.source +
  "|" +
  ip6WordRegex.source +
  ":" +
  ip6WordRegex.source +
  ")";

/**
 * The regular expresion source matching to a full IPv6 address with all 8
 * segments.
 */
const ip6full =
  "(?:" +
  ip6WordRegex.source +
  "(?::" +
  ip6WordRegex.source +
  "){5})" +
  ip6fullLast32bitSource;
/**
 * The regular expression source matching to a short hand IPv6 address starting
 * with a gap.
 */
const ip6shortHandPrefix = "(?::" + "(?::" + ip6WordRegex.source + "){0,7}";
"|" +
  "(?::" +
  ip6WordRegex.source +
  "){0,5}" +
  ip6fullLast32bitSource.source +
  ")";
/**
 * The regular expression source matching to a short hand IPv6 address ending with a
 * gap.
 */
const ip6shortHandSuffix =
  "(?:" + ip6WordRegex.source + "(?::" + ip6WordRegex.source + "){0,6}" + "::)";

/**
 * Create a regular expression matching to a IPv4 shorthand with one or more segments
 * of zeroes replaced with an empty segment.
 * @param {number} [suffixSegmentCount=7] The nubmer of segments at the end of the address.
 * @param {boolean} [allowIpv4Address=true] Does the regexp allow IPv4 address at the end.
 * @throws {RangeError} The suffix segment count was invalid.
 */
function createIpv6ShorthandAddressRegexp(
  suffixSegmentCount = 7,
  allowIpv4Address = true
) {
  if (suffixSegmentCount < 0 || suffixSegmentCount > 7) {
    throw new RangeError("Invalid suffix segment count");
  }
  const ipv6segmentSource = ip4WordRegex.source;
  const prefixSegmentSource =
    "(?:" +
    (suffixSegmentCount < 7
      ? ipv6segmentSource +
        "(?::" +
        ipv6segmentSource +
        `){0,${6 - suffixSegmentCount}}`
      : "") +
    ")?";
  if (allowIpv4Address && suffixSegmentCount > 2) {
    // The address may end with ipv4 segment.
    return new RegExp(
      "(?:" +
        prefixSegmentSource +
        ":" +
        "(?:" +
        "(?::" +
        ipv6segmentSource +
        ")" +
        `{${suffixSegmentCount - 2}}` +
        ip6fullLast32bitSource +
        ")" +
        ")"
    );
  } else {
    // This is simple case as all segments are IPv6 segments.
    return new RegExp(
      "(?:" +
        prefixSegmentSource +
        ":" +
        "(?::" +
        ipv6segmentSource +
        ")" +
        `{${suffixSegmentCount}}` +
        ")"
    );
  }
}

/**
 * The regular expression source matching to a short hand IPv6 address with gap
 * in the middle of the address. This requires automatic generation of 6 regular
 * expression groups giving all valid combinations of gaps starting from 2nd, to
 * 6th segment with at least one missing segment.
 */
const ip6shortHandMid =
  "(?:" +
  ip6WordRegex.source + 
  "(?:" +
  range(1, 6)
    .map((suffixCount) => createIpv6ShorthandAddressRegexp(suffixCount).source)
    .join("|") +
  ")" +
  ")";
const ip6hostRegex = new RegExp(
  "(?:\\[" +
    "(?<ipv6address>" +
    [ip6full, ip6shortHandPrefix, ip6shortHandMid, ip6shortHandSuffix].join(
      "|"
    ) +
    ")" +
    "\\])",
  "u"
);
export const hostNameRegex = new RegExp("", "u");
const hostRegex = new RegExp(
  "(?<hostName>" +
    ip4hostRegex.source +
    "|" +
    ip6hostRegex.source +
    "|" +
    hostNameRegex.source +
    ")(:(?<port>\\d+))?",
  "u"
);
export const authorityRegex = new RegExp(
  "(?<authority>" +
    "\\/\\/" +
    userInfoRegex.source +
    "?" +
    hostRegex.source +
    ")",
  "u"
);

/**
 * Get a regular expression which only contains given regular expression content.
 * @param {RegExp} regexp The regular expression converted to a regex matching whole string.
 * @returns {RegExp} The regular expression matching the given regexp content.
 */
function allMatchingRegex(regexp) {
  return new RegExp("^" + regexp.source + "$", regexp.flags);
}
