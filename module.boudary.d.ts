import {
  getComparisonComparator,
  lowerBoundaryComparison,
  upperBoundaryComparison,
  greater,
  greaterOrEqual,
  lesserOrEqual,
} from "./module.comparison.js";

import type {
  Comparator,
  CompareResult,
  UndefinedComparisonResult,
  ErroneousComparisonResult,
} from "./module.comparison.js";

/**
 * A module containing the interface boundary with implementation.
 *
 * @module boundary
 */

/**
 * A boundary of values.
 * @interface Boundary
 * @template TYPE - The value type of the boundary.
 */
export interface Boundary<TYPE> {
  /**
   * The upper boundary of the boundary.
   * @returns The lower boundary value.
   * @throws {Error} The upper boundary does not exist.
   */
  upperBounary?: TYPE;
  /**
   * The lower boundary of the boundary.
   * @returns The lower boundary value.
   * @throws {Error} The lower boundary does not exist.
   */
  lowerBoundary?: TYPE;
  /**
   * Does the boundary lack upper boundary.
   * @returns True, if and only if the boundary does not have lower boundary.
   */
  isUpperUnbounded: boolean;
  /**
   * Does the boundary lack upper boundary.
   * @returns True, if and only if the boundary does nto have upper boundary.
   */
  isLowerUnbounded: boolean;

  /**
   * The comparator used to compare values.
   * An undefined value indicates the boundary is generic boundary compatible
   * with all boundaries with a comparator.
   */
  comparator: Comparator<TYPE> | null;
  /**
   * Is the given value withing bounds.
   *
   * @param {TYPE} value The tested value.
   * @param {Comparator<TYPE>} [baseComparator] - The comparator for comparing the values.
   * Defauls to the comparator of the boudnary.
   * @returns {boolean|UndefinedComparisonResult|ErroneousComparisonResult} Does the given value
   * bleong within the boundary.
   */
  withinBounds(
    value: TYPE,
    baseComparator: Compartor<TYPE> | null = null
  ): boolean | undefined | null;

  /**
   * Is the boundary empty.
   * @returns True, if and only if the boundary is empty.
   */
  isEmpty(): boolean | undefined | null;

  /**
   * Get the boundary containing only values belonging to both this
   * and other boundary.
   * @param other The other bounary.
   * @param comparator The comparator used to compare the boundaries.
   * Defaults to the {@link this.comparator}
   * @returns The boundary containing values in both this and other boundary.
   */
  intersection(
    other: Boundary<TYPE>,
    comparator: Comparator<TYPE> | null = null
  ): Boundary<TYPE>;

  /**
   * Get the boundary containing only values within this boundary, but not
   * wihtin this set.
   * @param other The other boundary.
   * @param comparator The comparator used to compare the boundary values.
   * Defaults to the {@link this.comparator}
   * @returns The boundary containing values in both this and other boundary.
   */
  difference(
    other: Boundary<TYPE>,
    comparator: Comparator<TYPE> | null = null
  ): Boundary<TYPE>;

  /**
   * Get union of boundaries.
   * @param other The other boundary
   * @param comparator The comparator used to compare boundary values.
   * Defaults to the {@link this.comparator}
   * @returns {Array<Boundary<TYPE>>} The boundaries containing the union.
   * @returns {UndefinedComparisonResult} The boundaries were not compatible.
   * @returns {ErroneousComparisonResult} The comparison failed due erronenous boundary
   * value.
   */
  union(
    other: Bounary<TYPE>,
    comparator: Comparator<TYPE> | null = null
  ):
    | Array<Boundary<TYPE>>
    | UndefinedComparisonResult
    | ErroneousComparisonResult;
}
