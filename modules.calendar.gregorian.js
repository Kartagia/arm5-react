
/**
 * The module contains simple Gregorian Calendar 
 * easily convertible to the Temporal.
 * 
 * @module calendar.gregorian
 */

import JsonMap from "./module.JsonMap";

/**
 * The constant of the day of month.
 * @type {string}
 */
const DAY_OF_MONTH = "DayOfMonth";
/**
 * The constant of the month of year.
 * @type {string}
 */
const MONTH_OF_YEAR = "MonthOfYear";
/**
 * The constant of the canonical year.
 * @type {string}
 */
const CANONICAL_YEAR = "Year";
/**
 * The constant of the day of year.
 * @type {string}
 */
const DAY_OF_YEAR = "DayOfYear";

/**
 * The constant of the normal year key.
 * @type {string}
 */
const NORMAL_YEAR = "normal";

/**
 * The constant of the leap year key.
 * @type {string}
 */
const LEAP_YEAR = "leap";

/**
 * The enumeration containing the Gregorian Calendar fields.
 * @enum {string}
 */
export class GregorianCalendarFields {
  DAY_OF_MONTH;
  MONTH_OF_YEAR;
  CANONICAL_YEAR;
  DAY_OF_YEAR;
}

/**
 * The mapping from date field names to the date field values.
 * @typedef {Map<string, number>} DateMap
 */

/**
 * The days of months of gregorian year types.
 * @readonly 
 * @type {Map<string, number[]>}
 */
export const DAYS_OF_MONTHS_OF_STANDARD_GREGORIAN_YEARS = new Map([
  [NORMAL_YEAR, [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]],
  [LEAP_YEAR, [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]]]);
Object.freeze(DAYS_OF_MONTHS_OF_STANDARD_GREGORIAN_YEARS);
DAYS_OF_MONTHS_OF_STANDARD_GREGORIAN_YEARS.keys().forEach((key) => {
  Object.freeze(DAYS_OF_MONTHS_OF_STANDARD_GREGORIAN_YEARS[key]);
})

/**
 * The last days of months of gregorian year types.
 * @readonly 
 * @type {Map<string, number[]>}
 */
export const LAST_DAYS_OF_YEARS_STANDARD_GREGORIAN_YEARS = new Map(
  DAYS_OF_MONTHS_OF_STANDARD_GREGORIAN_YEARS.keys().map(
    ([key, daysInMonths]) => {
      const daysOfMonthsOfKey = [key, daysInMonths.reduce((result, daysInMonth) => {
        result.push((result.length ? result[result.length - 1] : 0) + daysInMonth);
        return result;
      }, [])];
      Object.freeze(daysOfMonthsOfKey);
      return daysOfMonthsOfKey;
    }));
Object.freeze(LAST_DAYS_OF_YEARS_STANDARD_GREGORIAN_YEARS);

/**
 * A gregorian calendar.
 */
export class GregorianCalendar {

  /**
   * Get the month names of the year.
   * @return 
   */
  static get monthNamesOfYear() {
    return [null, "January", "February", "March",
      "April", "May", "June",
      "July", "August", "September",
      "October", "November", "December"]
  }

  /**
   * The days of months of years for the 
   * @type {Map<string, number[]>}
   */
  static get daysOfMonthsOfYear() {
    return DAYS_OF_MONTHS_OF_STANDARD_GREGORIAN_YEARS;
  }

  /**
   * The last days of years for each month of each year type.
   * @type {Map<string, number[]>}
   */
  static get lastDaysOfYearsOfMonthsOfYear() {
    return LAST_DAYS_OF_YEARS_STANDARD_GREGORIAN_YEARS;
  }

  /**
   * Create a new gregorian calendar.
   * @param {DateMap|Object.<string, number>} 
   */
  constructor(startOfYear = { day: 1, month: 1 }) {
    if (startOfYear instanceof Map) {
      this.startOfYear = new Map([[DAY_OF_MONTH, startOfYear[DAY_OF_MONTH]], [MONTH_OF_YEAR, startOfYear[MONTH_OF_YEAR]]]);
    } else if (startOfYear instanceof Object) {
      this.startOfYear = new Map([[DAY_OF_MONTH, startOfYear.day || startOfYear.dayOfMonth], [MONTH_OF_YEAR, startOfYear.month || startOfYear.monthOfYear]]);
    } else if (typeof startOfYear === "number") {
      this.startOfYear = GregorianCalendar.getMonthDayOfDayOfYear(startOfYear);
    } else {
      throw new TypeError("Invalid start of year!");
    }

    // Getting the days of months, and last days of months.
    const startMonth = this.startOfYear.get(MONTH_OF_YEAR);
    const startDay = this.startOfYear.get(DAY_OF_MONTH);
    if (startMonth === 1 && startDay === 1) {
      this.daysInMonths = GregorianCalendar.daysOfMonthsOfYear;
      this.lastYearDaysOfMonths = GregorianCalendar.lastDaysOfYearsOfMonthsOfYear;
    } else {
      // Generating the days in months for the calendar.
      this.daysInMonths = this.getDaysInMonths();
      this.lastYearDaysOfMonths = [...(this.daysInMonths.entries())].reduce(
        (result, [key, daysInMonths]) => {
          result.set(key, daysInMonths.reduce((result, daysInMonth, index) => {
            if (index) {
              result.push(daysInMonths + result[index - 1]);
            } else {
              // Adding the first two elements as is.
              result.push(daysInMonth);
            }
          }, []))
        },
        new Map()
      )
    }
    Object.freeze(this.daysInMonths);
  }

  /**
   * @typedef {Object} DateFromDayOfYearOptions
   * @property {number} [year] The canonical year of the day of year. The result will contain
   * {@link CANONICAL_YEAR}
   * @property {boolean} [lenient=false] Is the determination lenient with year. Lenient will
   * change the year to get the day of year withing legal bounds.
   * @property {string} [yearType=NORMAL_YEAR] The year type in the case the year is not given.
   * Defaults to the {@link NORMAL_YEAR}.
   */

  /**
   * Get the month day of year from day of year.
   * 
   * @param {number} dayOfYear The day of year.
   * @param {DateFromDayOfYearOptions} options The options of the month day convserion.
   * @returns {DateMap} The mapping containing the day of year and the day of year.
   */
  static getMonthDayOfDayOfYear(dayOfYear, options = {}) {
    const result = new Map();
    const daysOfYearsOfMonths = this.lastDaysOfYearsOfMonthsOfYear.get(
      options.year != null
        ? (this.isLeapYear(options.year) ? LEAP_YEAR : NORMAL_YEAR)
        : (options.yearType || NORMAL_YEAR));
    if (dayOfYear < 1 || dayOfYear > daysOfYearsOfMonths[daysOfYearsOfMonths.length - 1]) {
      if (options.year != null && options.lenient) {
        // Determining the correct year with leniency.
        let year = options.year;
        let day = dayOfYear;
        if (day < 1) {
          while (day < 1) {
            year--;
            day += this.getDaysInYear(year);
          }
        } else {
          let daysInYear = this.getDaysInYear(year);
          while (day > daysInYear) {
            day -= daysInYear;
            year++;
            daysInYear = this.getDaysInYear(year);
          }
        }
        return this.getMonthDayOfDayOfYear(day, { ...options, year });
      } else {
        return undefined;
      }
    }
    // Find the index of hte first days of the years index which contains the day of month.
    const month = daysOfYearsOfMonths.findIndex((lastDayOfYear) => (dayOfYear <= lastDayOfYear));
    // If month is always between 1 and 12 as the day of year is valid day of year. 
    result.set(MONTH_OF_YEAR, month);
    // The day of month is acquired by reducing the day of year with the last day of year of the
    // previous month. The first month reduction is 0 in the first index.
    result.set(DAY_OF_MONTH, dayOfYear - daysOfYearsOfMonths[result.get(MONTH_OF_YEAR) - 1]);
    if (options.year != null) {
      result.set(CANONICAL_YEAR, options.year);
    }
    return result;

  }

  /**
   * Get days in months.
   * @param {number|string} yearOrYearType Either the canonical year or the year type.
   * @returns {number[]} The strcture containing the days in months for a month of year by
   * index. If the year type is invalid, returns a structure indicating a year wtihout single day
   * or month.
   */
  static getDaysInMonths(yearOrYearType) {
    switch (typeof yearOrYearType) {
      case "number":
        return this.daysInMonths[(this.isLeapYear(yearOrYearType) ? LEAP_YEAR : NORMAL_YEAR)];
      case "string":
        return this.daysInMonths[yearOrYearType] || [0];
      default:
        return [0];
    }
  }

  /**
   * Get the last days of years of each month.
   * @param {number|string} yearOrYearType Either the canonical year or the year type.
   * @returns {number[]} The strcture containing the days in months for a month of year by
   * index. If the year type is invalid, returns a structure indicating a year wtihout single day
   * or month.
   */
  static getDayOfYearsInMonths(yearOrYearType) {
    switch (typeof yearOrYearType) {
      case "number":
        return this.daysOfYearsOfMonths[(this.isLeapYear(yearOrYearType) ? LEAP_YEAR : NORMAL_YEAR)];
      case "string":
        return this.daysOfYearsOfMonths[yearOrYearType] || [0];
      default:
        return [0];
    }
  }

  /**
   * Get the year standard gregorian calendar year of the standard change of year.
   * @param {number} year The canonical year of the calendar.
   * @returns {number} The standard gregorian year of the 1st of Janaury.
   */
  getStandardGregorianYear(year) {
    return year + (this.startOfYear.get(MONTH_OF_YEAR) > 2 ? 1 : 0);
  }

  /**
   * Is a year a leap year.
   * @param {number} year The year of the calendar.
   * @returns {boolean} True, if and only if the given year of
   * calendar is a leap year.
   */
  isLeapYear(year) {
    return GregorianCalendar.isLeapYear(this.getStandardGregorianYear(year));
  }

  /**
   * Get the months of year for the standard year starting 1.1.
   * 
   * @returns {Map<string, number[]>} The maping from year types to the days in months
   * in the index of the month value. The first index of 0 contains the negative offset
   * to the day of month of the first month when converting a standard year. 
   */
  getDaysInCanonicalMonths() {
    return GregorianCalendar.daysOfMonthsOfYear;
  }

  /**
   * The days of months of years. The month at index 0 is special.
   * @type {Map<string, Array<number>>}
   */
  getDaysInMonths() {
    const deltaDay = 1 - this.startOfYear.get(DAY_OF_MONTH);
    const deltaMonth = 1 - this.startOfYear.get(MONTH_OF_YEAR);
    const standardDaysOfMonthsOfYears = this.getDaysInCanonicalMonths();
    if (deltaDay || deltaMonth) {
      // The start of year is not 1.1. and we have to generate the days in months
      // from the standard days of years.
      const resultMap = standardDaysOfMonthsOfYears.keys().reduce(
        (result, key) => {
          // Getting the map of days in months created by transforming the standard year to start from other day.
          const daysInMonths = standardDaysOfMonthsOfYears.get(key);
          const resultDaysInMonths = daysInMonths.reduce(
            (result, daysInMonth, monthIndex) => {
              if (monthIndex) {
                const currentMonthIndex = (((12 + monthIndex + deltaMonth) % 12) + 1);
                if (deltaDay) {
                  const previousMonthIndex = currentMonthIndex - 1;
                  result[previousMonthIndex] -= deltaDay;
                  result[currentMonthIndex] += daysInMonth + deltaDay;
                } else {
                  result[currentMonthIndex] = daysInMonth;
                }
              }
              return result;
            }, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
          // A dding the 13th  month if necessary.
          if (deltaDay !== 0) {
            resultDaysInMonths.push(resultDaysInMonths[resultDaysInMonths.lenght - 1] + (deltaDay < 0 ? -1 : 1) * deltaDay);
          }

          // Freezing the result and returning it.
          Object.freeze(resultDaysInMonths);
          result.set(key, resultDaysInMonths);
          return result;
        },
        new Map()
      )
      // Freezing the result and returnign it.
      Object.freeze(resultMap);
      return resultMap;
    } else {
      // The day sare the standard days.
      return GregorianCalendar.daysOfMonthsOfYear;
    }
  }

  /**
   * Get the number of days in the year.
   * @param {number} year The canonical year of the calendar. 
   * @returns {number} The number of days in the year.
   */
  getDaysInYear(year) {
    const daysOfMonthsOfYear = GregorianCalendar.daysOfYearsOfMonths.get(this.isLeapYear(year) ? LEAP_YEAR : NORMAL_YEAR);
    return daysOfMonthsOfYear == null ? 0 : daysOfMonthsOfYear[daysOfMonthsOfYear.length - 1];
  }

  /**
   * Test validty of the date.
   * @param {string|year} year Either the year type or the canonical year.
   * @param {number} month The month of year.
   * @param {number} day The day of month.
   * @returns {boolean} True, if and only if the given date is valid.
   */
  validDate(year, month, day) {
    let yearType, daysInMonths;
    switch (typeof year) {
      case "string":
      case "number":
        yearType = (typeof year === "string" ? yearType
          : (this.isLeapYear(year) ? LEAP_YEAR : NORMAL_YEAR));
        daysInMonths = this.daysInMonths.get(yearType) || [0];
        return (month >= 1 && month < daysInMonths.length &&
          (day >= 1 && day <= daysInMonths[month]))
      default:
        return false;
    }
  }
  validCanonicalDate(year, month, day) {
    return GregorianCalendar.validDate(year, month, day);
  }

  /**
   * Create a date from canonical day of year.
   * @param {number} year The canonincal year of the calendar.
   * @param {number} month The canonical month of hte calendar.
   * @param {number} day The canonical day of month of the calendar.
   * @returns {DateMap} The date map of the calendar date.
   * @throws {RangeError} The given date was not correct canonical date.
   */
  createDate(year, month, day) {
    const result = new JsonMap();
    if (!(this.validCanonicalDate(year, month, day))) {
      return result;
    }
    const startDay = this.startOfYear.get(DAY_OF_MONTH);
    const startMonth = this.startOfYear.get(MONTH_OF_YEAR);
    let yearType, daysInMonths, monthsInYear;
    switch (typeof year) {
      case "number":
        result.set(CANONICAL_YEAR, year);
        yearType = (typeof year === "string" ? yearType
          : (this.isLeapYear(year) ? LEAP_YEAR : NORMAL_YEAR));
        daysInMonths = this.daysInMonths.get(yearType) || [0];
        monthsInYear = daysInMonths.length - 1;
        if (month === startMonth && startDay > 1) {
          // The first month is split between first and last month of the year.
          if (day < startDay) {
            result.set(MONTH_OF_YEAR, monthsInYear);
            result.set(DAY_OF_MONTH, day);
          } else {
            result.set(MONTH_OF_YEAR, 1);
            result.set(DAY_OF_MONTH, day + daysInMonths[0]);
          }
        } else {
          // The first month is a full month, transformed to different index.
          result.set(MONTH_OF_YEAR, (monthsInYear + month - startMonth) % (monthsInYear) + 1);
          result.set(DAY_OF_MONTH, day);
        }
      // eslint-disable-next-line no-fallthrough
      case "string":
      default:
        return result;
    }
  }


  /**
   * Create a date from canonical day of year.
   * @param {number} year The canonincal year of the calendar.
   * @param {number} month The canonical month of hte calendar.
   * @param {number} day The canonical day of month of the calendar.
   * @returns {DateMap} The date map of the calendar date.
   * @throws {RangeError} The given date was not correct canonical date.
   */
  static createDate(year, month, day) {
    const result = new JsonMap();
    if (!(this.validDate(year, month, day))) {
      return result;
    }
    const startDay = this.startOfYear.get(DAY_OF_MONTH);
    const startMonth = this.startOfYear.get(MONTH_OF_YEAR);
    let yearType, daysInMonths, monthsInYear;
    switch (typeof year) {
      case "number":
        result.set(CANONICAL_YEAR, year);
        yearType = (typeof year === "string" ? yearType
          : (this.isLeapYear(year) ? LEAP_YEAR : NORMAL_YEAR));
        daysInMonths = this.daysOfMonthsOfYear.get(yearType) || [0];
        monthsInYear = daysInMonths.length - 1;
        if (month === startMonth && startDay > 1) {
          // The first month is split between first and last month of the year.
          if (day < startDay) {
            result.set(MONTH_OF_YEAR, monthsInYear);
            result.set(DAY_OF_MONTH, day);
          } else {
            result.set(MONTH_OF_YEAR, 1);
            result.set(DAY_OF_MONTH, day + daysInMonths[0]);
          }
        } else {
          // The first month is a full month, transformed to different index.
          result.set(MONTH_OF_YEAR, (monthsInYear + month - startMonth) % (monthsInYear) + 1);
          result.set(DAY_OF_MONTH, day);
        }
      // eslint-disable-next-line no-fallthrough
      case "string":
      default:
        return result;
    }
  }

  /**
   * Test validity of the canonical date.
   * @param {number} year The canonical year.
   * @param {number} month The cannonical month of year.
   * @param {number} day The canonical day of month.
   * @returns {boolean} True, if and only if the date is valid.
   */
  static validDate(year, month, day) {
    let yearType, daysInMonths;
    switch (typeof year) {
      case "string":
      case "number":
        yearType = (typeof year === "string" ? yearType
          : (this.isLeapYear(year) ? LEAP_YEAR : NORMAL_YEAR));
        daysInMonths = this.daysInMonths.get(yearType) || [0];
        return (month >= 1 && month < daysInMonths.length &&
          (day >= 1 && day <= daysInMonths[month]))
      default:
        return false;
    }
  }

  /**
   * Get the day of year.
   * @param {string|year} year Either the year type or the canonical year.
   * @param {number} month The month of year.
   * @param {number} day The day of month.
   * @param {Object} options The options for convrsion. 
   * @returns {number?} The day of year of hte given month and year.
   */
  getDayOfYear(year, month, day, options = {}) {
    if (year == null) return undefined;
    const yearType = (typeof year === "string" ? yearType
      : (typeof year === "number" ? (this.isLeapYear(year) ? LEAP_YEAR : NORMAL_YEAR) : null));
    if (yearType == null) return undefined;
    if (this.validDate(year, month, day)) {
      const lastYearDaysOfMonths = this.lastDaysOfYearsOfMonthsOfYear.get(yearType);
      if (lastYearDaysOfMonths instanceof Array) {
        if (month === 1 && day <= lastYearDaysOfMonths[0]) {
          // The month belongs to the first month, but at the end of the year.
          return day + lastYearDaysOfMonths[lastYearDaysOfMonths.length - 1];
        } else {
          return day + lastYearDaysOfMonths[month - 1];
        }
      } else {
        // The year was invalid.
        return null;
      }
    } else if (options.lenient) {
      // Lenient parsing tries to find the closest matching day.
      const actualMonth = Math.max(1, Math.min(12, month));
      const daysInMonths = this.daysInMonths.get(yearType);
      if (daysInMonths) {
        const actualDay = Math.max(1, Math.min(daysInMonths[month]));
        return this.getDayOfYear(year, actualMonth, actualDay);
      } else {
        return undefined;
      }
    }

    return undefined;

  }


  /**
   * Get date field values.
   * @param {string} fieldName The field name.
   * @param {DateMap|Object.<string, number>} dateMap The map from date fields to date field values.
   */
  getFieldValue(fieldName, dateMap) {
    if (dateMap instanceof Map) {
      if (dateMap.has(fieldName)) return dateMap.get(fieldName);
      switch (fieldName) {
        case DAY_OF_YEAR:
          return this.getDayOfYear(dateMap.get(MONTH_OF_YEAR), dateMap.get(DAY_OF_MONTH));
        case MONTH_OF_YEAR:
          return this.getMonthDayOfDayOfYear(dateMap.get(DAY_OF_YEAR, { year: dateMap.get(CANONICAL_YEAR) })).get(MONTH_OF_YEAR);
        case DAY_OF_MONTH:
          return this.getMonthDayOfDayOfYear(dateMap.get(DAY_OF_YEAR, { year: dateMap.get(CANONICAL_YEAR) })).get(DAY_OF_MONTH);
        case CANONICAL_YEAR:
        default:
          // The field is not supported.
          return undefined;
      }
    } else if (dateMap instanceof Object) {
      if (fieldName in dateMap && Number.isInteger(dateMap[fieldName])) {
        return dateMap[fieldName];
      }
      switch (fieldName) {
        case DAY_OF_YEAR:
          return this.getDayOfYear(dateMap.month, dateMap.day);
        case MONTH_OF_YEAR:
          return dateMap.month;
        case DAY_OF_MONTH:
          return dateMap.day;
        case CANONICAL_YEAR:
          return dateMap.year;
        default:
          // The field is not supported.
          return undefined;

      }
    }
    // The field is not supported.
    return undefined;
  }
}

/**
 * The constant containing the stardard gregorian calendar with 
 * start of year at 1st of January. The instance is immutable.
 * @readonly
 */
const GREGORIAN_CALENDAR = new GregorianCalendar();
GREGORIAN_CALENDAR.freeze();

/**
 * The default export is an instance of gregorian calendar using
 * 1st of January as first day of year.
 */
export default GREGORIAN_CALENDAR;