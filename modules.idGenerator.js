/**
 * Create an identifier generator.
 * @param {number} [first=1] The first returned identifier.
 * @param {*} [max] The smallest number which indicates the
 * identifier supply is exhausted.
 * @default Number.MAX_SAFE_INTEGER
 * @returns Geneartor function generating new identifiers.
 */
export function* idGenerator(first = 1, max = Number.MAX_SAFE_INTEGER) {
  if (first < max) {
    yield first++;
  } else {
    return undefined;
  }
}

/**
 * Compares two values.
 * @callback Comparator
 * @template A
 * @param {A} compared The compared value.
 * @param {A} comparee The value comapred to.
 * @return <dl><dt>Negative number</dt><dd>The compared is less than comparee</dd>
 * <dt>Zero</dt><dd>Compared is equivalent to the comparee</dd>
 * <dt>Positive number</dt><dd>Compared is greater than comparee</dd></dl>
 * @throws {TypeError} The types of the values prevents comparison.
 * @throws {Rangeerror} One of the values is incompatible to cmoparison.
 */

/**
 * @param {Comparator} comparator A function comparing two values.
 */
export function getMaxFunction(comparator) {
  return (result, id) => (comparator(result, id) < 0 ? id : result);
}

/**
 * Get the largest identifier.
 * An undefined values are ignored.
 * @param {any} result The previsous result.
 * @param {any} id The next idetnfiier.
 * @returns {any} The largest of the results.
 */
export function getMaxId(result, id) {
  return ((result == null || id != null && result < id ? id : result))
}
