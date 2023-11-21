
/**
 * @module boundary
 * The module containing virtual interface using documentation comments.
 */

/**
 * An interface for classes representing a boundary of values.
 * @interface Boundary
 */

/**
 * The lower boundary of the boundary, if any exists.
 * 
 * @property
 * @name Boundary#lowerBoundary
 * @readonly
 * @returns {TYPE} The lower boundary value.
 * @throws {Error} The lower boundary does not exist.
 */

/**
 * The upper boundary of the boundary, if any exists.
 * 
 * @property
 * @name Boundary#upperBoundary
 * @readonly
 * @returns {TYPE} The upper boundary value.
 * @throws {Error} The upper boundary does not exist.
 */


/**
 * Does the boundary lack lower boundary.
 * 
 * @property
 * @name Boundary#isLowerUnbounded
 * @readonly
 * @returns {boolean} Does the boundary lack lower boudnary. 
 */

/**
 * Does the boundary lack upper boundary.
 * 
 * @property
 * @name Buondary#isUpperUnbounded
 * @readonly
 * @returns {boolean} Does the boundary lack upper boundary.
 */

/** 
 * Does the current boundary contain the given value.
 * 
 * @function 
 * @name Boundary#withinBounds
 * @param {TYPE} value The tested value.
 * @param {import("./module.comparison.js").Comparator<TYPE>} [baseComparator] The comparator comparing the values.
 * @returns {boolean} True, if and only if the value is within bounds.
 */

/**
 * Get the intersection of the current boundary and an other boundary.
 * The intersection only contains values within both boundaries.
 * 
 * @function 
 * @name Boundary#intersect
 * @param {Boundary<TYPE>} other The boundary this value is intersected with.
 * @param {import("./module.comparison.js").Comparator<TYPE>} [comparator] The comparator comparing the values.
 * @returns {Boundary<TYPE>} The boundary of the intersection.
 */

/** 
 * Get the union of hte current boundary and an other boundary.
 * The resulting boundary will contain no values, if both boundaries are empty boundaries.
 * An overlapping boundaries are represented with an array containing the boundary containing members of both
 * boundaries. 
 * If the boundaries are distinct, the resulting array will contain the both members of the union.
 * 
 * If either boundary lacks comparator, a new boundary with given comaparator is returned instead.
 * 
 * @function
 * @name Boundary#union
 * @param {Boundary<TYPE>} other The boundary this value is extended with.
 * @param {import("./module.comparison.js").Comparator<TYPE>} [comparator] The comparator comparing the values.
 * Defaults to the {@link this.comparator}.
 * @returns {Boundary<TYPE>[]|import("./module.comparison.js").ErroneousComparisonResult|import("./module.comparison.js").UndefinedComparisonResult} The array containing the resulting boundaries. 
 * - An undefined value, if hte other and this are not comparable with given comparator.
 * - An erroneous value, if the comparison triggered an error.
 */

/** 
 * @function
 * @name Boundary#difference
 * @param {Boundary<TYPE>} other The boundary cut from this boundary.
 * @param {import("./module.comparison.js").Comparator<TYPE>} [comparator] The comparator comparing the values.
 * Defaults to the {@link this.comparator}.
 * @returns {Boundary<TYPE>[]|import("./module.comparison.js").ErroneousComparisonResult|import("./module.comparison.js").UndefinedComparisonResult} The array containing the resulting boundaries. 
 * - An undefined value, if hte other and this are not comparable with given comparator.
 * - An erroneous value, if the comparison triggered an error.
 */
