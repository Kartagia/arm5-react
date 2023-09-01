/**
 * Class id generator generates idnetifiers.
 * @template VALUE The value type of hte id generation.
 */
export class IdGenerator {

  /**
   * Creates a new id generator
   * @template VALUE
   * @param {VALUE} first The first value.
   * @param {Predicate<VALUE>} endCondition The condition ending the iteartion.
   * @param {Function<VALUE, VALUE>} advancer The function generating the next value of iteration.
   */
  constructor(first, endCondition, advancer) {
    this.current = first;
    this.endCondition = endCondition;
    this.advancer = advancer;
  }

  /**
   * Create an Id Generator from start to the largest start + n*step < end.
   * @param {number} [start=1] The start of the generation.
   * @param {number} [end] The end of the generation.
   * @param {number} [step=1] 
   * @returns {IdGenerator} The id generator object.
   */
  static from(start, end = Number.MAX_SAFE_INTEGER, step = 1) {
    return new IdGenerator(start, (value) => (value >= end), (value) => (value + step));
  }
  /**
   * Next iteration result.
   * @param {A|undefined} value 
   * @returns {Iteration}
   */
  next() {
    if (this.endCondition(this.current)) {
      // The iteration is over
      return undefined;
    } else {
      // Iterating next value.
      const result = this.current;
      this.current = this.advancer(this.current);
      return result;
    }
  }

  /**
   * Does the generator have more results.
   * @returns {boolean} True, if and only if the iteration has more results.
   */
  hasNext() {
    return !(this.endCondition(this.current));
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
