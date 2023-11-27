
/**
 * The module contains simple Gregorian Calendar 
 * easily convertible to the Temporal.
 * 
 * @module calendar.gregorian
 */

import JsonMap from "./module.JsonMap.js";
import { getSomeFieldValue } from "./module.calendar.js";

/**
 * The constant of the day of month.
 * @type {string}
 */
export const DAY_OF_MONTH = "DayOfMonth";
/**
 * The constant of the month of year.
 * @type {string}
 */
export const MONTH_OF_YEAR = "MonthOfYear";

/**
 * The constant of the year of the calendar.
 * @type {string}
 */
export const YEAR = "Year";

/**
 * The constant of the canonical year.
 * @type {string}
 */
export const CANONICAL_YEAR = "CanonicalYear";

/**
 * The constant of hte epoch day field. Epoch day 
 * indicates how many days has passed from 1.1.1970.
 */
export const EPOCH_DAY = "EpochDay";

/**
 * The constant of the era.
 * @type {string}
 */
export const ERA = "Era";

/**
 * The constant of the year of era.
 * @type {string}
 */
export const YEAR_OF_ERA = "YearOfEra";

/**
 * The constant of the calendar field.
 * @type {string}
 */
export const CALENDAR = "calendar";

/**
 * The constant of the day of year.
 * @type {string}
 */
export const DAY_OF_YEAR = "DayOfYear";

/**
 * The constant of the normal year key.
 * @type {string}
 */
export const NORMAL_YEAR = "normal";


/**
 * The constant of the leap year key.
 * @type {string}
 */
export const LEAP_YEAR = "leap";

/**
 * The enumeration containing the Gregorian Calendar fields.
 * @enum {string}
 */
export class GregorianCalendarFields {
  DAY_OF_MONTH;
  MONTH_OF_YEAR;
  YEAR;
  CANONICAL_YEAR;
  ERA;
  YEAR_OF_ERA;
  DAY_OF_YEAR;
}

/**
 * The date field types.
 * @typedef {string} DateFieldType
 */

/**
 * The interface of calendars. 
 * @typedef {import("./module.calendar.js").Calendar} Calendar
 */

/**
 * The mapping from date field names to the date field values.
 * @typedef {Map<string, number>} DateMap
 */


/**
 * The options for date creation.
 * @typedef {Object} CreateDateOptions
 * @property {Calendar} [calendar=GREGORIAN_CALENDAR] The calendar of hte date.
 */



/**
 * Create a date map.
 * @param {string|DateMap|Array.<number,number,number>} source The source of te created date.
 * @param {CreateDateOptions} param1 The options for creation of the date.
 * @returns {DateMap} The date map. 
 * @throws {TypeError} The source was invalid type
 * @throws {SyntaxError} The source was a string, and it did not contain
 * a valid date reprsenttation.
 * @throws {RangeError} The source had an invalid value.
 */
export function createDateMap(source, { calendar = GREGORIAN_CALENDAR } = {}) {
  const fields = [];
  switch (typeof source) {
    case "string":
      throw new TypeError(`Creation from string not yet implemeented`)
    case "object":
      if (source instanceof Map) {
        for (const key in source.keys()) {
          if (key !== CALENDAR) {
            fields.push([key, source.get(key)]);
          }
        }
        break;
      } else if (source instanceof Array && source.length === 3 && source.every((value) => (Number.isInteger(value)))) {
        fields.push([[CALENDAR, calendar], [CANONICAL_YEAR, source[0]], [MONTH_OF_YEAR, source[1]], [DAY_OF_MONTH, source[2]]]);
        break;
      } else if (source instanceof Date) {
        // Conversion from date.
        fields.push([
          [CALENDAR, calendar],
          [CANONICAL_YEAR, source.getFullYear()],
          [MONTH_OF_YEAR, source.getMonth() + 1],
          [DAY_OF_MONTH, source.getDate()]]);
        break;
      } else if (["year", "month", "day"].every((field) => (field in source))) {
        // Temporal POJO reprsentation.
        fields.push([
          [CALENDAR, calendar],
          [CANONICAL_YEAR, source.year],
          [MONTH_OF_YEAR, source.month],
          [DAY_OF_MONTH, source.day]]);
        break;
      } else {
        throw new TypeError(`Unsupported source class ${Object.getPrototypeOf(source)}`);
      }
    default:
      throw new TypeError(`Unsupported source type ${typeof source}`);
  }
  const result = new JsonMap([
    ...fields
  ]);
  if (result.get(CALENDAR)?.validCanonicalDate(
    getCanonicalYear(result), getMonthOfYear(result), getDayOfMonth(result))) {
    return result;
  } else {
    throw new TypeError(
      `Invalid date ${[getCanonicalYear(result), getMonthOfYear(result), getDayOfMonth(result)].join(".")
      } for the calendar ${result.get(CALENDAR)?.name || "(Unkknown)"}`);
  }
}

/**
 * Get the canonical Gregorian calendar day of year.
 * @param {DateMap} dateMap The date map date.
 * @returns {number?} The day of year, if it does exists.
 */
export function getDayOfYear(dateMap) {
  return getSomeFieldValue(dateMap, DAY_OF_YEAR);
}

/**
 * Get the canonical Gregorian calendar day of month.
 * @param {DateMap} dateMap The date map date.
 * @returns {number?} The day of month, if it does exists.
 */
export function getDayOfMonth(dateMap) {
  return getSomeFieldValue(dateMap, DAY_OF_MONTH);
}

/**
 * Get the canonical Gregorian calendar month of year.
 * @param {DateMap} dateMap The date map date.
 * @returns {number?} The month of year, if it does exists.
 */
export function getMonthOfYear(dateMap) {
  return getSomeFieldValue(dateMap, MONTH_OF_YEAR);
}

/**
 * Get the canonical Gregorian calendar canonical year.
 * @param {DateMap} dateMap The date map date.
 * @returns {number?} The canoical year, if it does exists.
 */
export function getCanonicalYear(dateMap) {
  return getSomeFieldValue(dateMap, CANONICAL_YEAR);
}

/**
 * The days of months of the canonical gregorian year types.
 * @readonly 
 * @type {Map<string, number[]>}
 */
export const DAYS_OF_MONTHS_OF_STANDARD_GREGORIAN_YEARS = new Map([
  [NORMAL_YEAR, [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]],
  [LEAP_YEAR, [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]]]);
[...(DAYS_OF_MONTHS_OF_STANDARD_GREGORIAN_YEARS.keys())].forEach((key) => {
  Object.freeze(DAYS_OF_MONTHS_OF_STANDARD_GREGORIAN_YEARS.get(key));
})
Object.freeze(DAYS_OF_MONTHS_OF_STANDARD_GREGORIAN_YEARS);

/**
 * The last days of months of canoncial gregorian year types.
 * @readonly 
 * @type {Map<string, number[]>}
 */
export const LAST_DAYS_OF_YEARS_STANDARD_GREGORIAN_YEARS = new Map(
  [...(DAYS_OF_MONTHS_OF_STANDARD_GREGORIAN_YEARS.keys())].map(
    (key) => {
      const daysInMonths = DAYS_OF_MONTHS_OF_STANDARD_GREGORIAN_YEARS.get(key);
      const daysOfMonthsOfKey = [key, daysInMonths.reduce((result, daysInMonth) => {
        result.push((result.length ? result[result.length - 1] : 0) + daysInMonth);
        return result;
      }, [])];
      Object.freeze(daysOfMonthsOfKey);
      return daysOfMonthsOfKey;
    }));
Object.freeze(LAST_DAYS_OF_YEARS_STANDARD_GREGORIAN_YEARS);

export function formatAsNumber(value, { withText = false, mode = "default" } = {}) {
  if (Number.isInteger(value)) {
    if (withText || mode === "long") {
      const magnitudes = [...([["trillion", "trillions"], ["billion", "billions"], ["million", "millions"],
      ["thousand", "thousands"], ["hundred", "hundreds"]].map(
        (magnitude, index) => {
          const magnitudeDivider = (index < 4 ? 10 ** (3 * (4 - index)) : 100);
          return [magnitudeDivider, (division) => {
            return (division ? `${formatAsNumber(Math.trunc(division / magnitudeDivider), { asText: true })} ${division > 1 ? magnitude[1] : magnitude[0]}` : "");
          }, index - 1];
        })),
      [10, (division) => {
        const map = new JsonMap([...(["ninenty"], ["eighty"], ["seventy"], ["sixty"], ["fifty"],
          ["fourty"], ["thirty"],
          ["twenty"]).map((value, index) => ([(9 - index) * 10, () => (value), 4])),
        [13, (division) => (`${formatAsNumber(division, { withText: true, mode: "long" })}teen`), 4],
        [13, () => "thirteen", 4][12, () => "twelve", 4], [11, () => "eleven", 4][10, () => "ten", 4]])

        return division ? map.find((entry) => (value / entry[0] >= 1))[1](division) : "";
      }, 4],
      [1, (division) => {
        const values = [
          ["ten"], ["nine"], ["eight"], ["seven"], ["six"], ["five"], ["four"], ["three"], ["two"], ["one"], ["zero"]
        ];
        if (division > 9) {
          throw Error("Something went wrong!");
        } else if (division === 0) {
          return values[10];
        } else {
          return values[9 - division];
        }
      }, 5]
      ];
      // Find magntiude building the result on the way.
      return magnitudes.reduce((result, magnitude) => {
        const division = result[1] / magnitude[0];
        const modulo = result[1] % magnitude[0];
        result[0] = result[0].concat(magnitude[1](division));
        result[1] = modulo;
        return result;
      }, ["", value])[0];
    } else {
      return `${value}.`;
    }
  } else {
    return undefined;
  }

}

/**
 * Format an ordinal value.
 * @param {number} value The number converted to ordinal.
 * @param {Object} [param1] The ordinal options.
 * @param {boolean} [withTextSuffix=false] Is with text suffix.
 * @returns {string} The formatted ordinal.
 */
export function formatAsOrdinal(value, { withTextSuffix = false, withText = false } = {}) {
  if (Number.isInteger(value)) {
    if (withText) {
      const magnitudes = [[10 ** 12, "trillionth"], [10 ** 9, "billionth"], [10 ** 6, "millionth"],
      [1000, "thousandth"], [100, "hundredth"], [10, (value) => (value >= 20 ?
        ([["ninen"], ["eigh"], ["seven"], ["six"], ["fif"],
        ["four"], ["thir"],
        ["twen"]].map((value, index) => ([10 * (9 - index), `${value}tieth`, 4])).find((magnitude) => (value % magnitude === 0))
        )
        : [...(["nine", "eight", "seven", "six", "Five", "four", "thir"].map((value, index) => [19 - index, `${value}teenth`, 4])),
        ...([["twelfth"], ["eleventh"], ["tenth"]].map((value, index) => ([12 - index, value, 4])))]), 4],
      [1, (value) => (([["ninth"], ["eighth"], ["seventh"], ["sixth"], ["fifth"], ["fourth"], ["third"], ["second"], ["first"]]
        .map((value, index) => ([9 - index, value, 5]))).find((value % magnitude === 0))), 5]
      ];
      const index = magnitudes.findIndex((magnitude) => (value % magnitude[0] === 0));
      const magnitude = magnitudes[index];
      if (index) {
        const higherMagnitude = magnitudes[magnitude[2]];
        return `${formatAsNumber(value, { withText: true, magnitude: magnitude[2] })} ${magnitude[1](value % higherMagnitude[0])}`;
      } else {
        // The value was trillionth. 
        return `${formatAsNumber(Math.trunc(value / magnitude[0]), { withText: true })} ${magnitude[1](value)}`;
      }
    } else if (withTextSuffix) {
      const modulo = Math.abs(value % 10);
      switch (modulo) {
        case 1:
          return `${value}st`;
        case 2:
          return `${value}nd`;
        case 3:
          return `${value}rd`;
        default:
          return `${value}th`;
      }
    } else {
      return `${value}.`;
    }
  } else {
    return undefined;
  }
}

/**
 * Calculates the era year for a canonical year.
 * @callback EraYearCalculator
 * @param {number} year The canonical year.
 * @returns {number?} The era year, if it exists.
 */

/**
 * The parameters of the CalendarEra construction.
 * @typedef {Object} CalendarEraParams
 * @property {string} eraName The name of the epoch.
 * @property {string} eraAbbrev The epoch abbreviation used as Epoch suffix.
 * @property {number} value The epoch value. 
 * @property {import("./module.comparison.js").Predicate<number>} isEpochYear The predicate testing whether a canonical 
 * year belongs to the epoch.
 * @property {EraYearCalculator} getEpochYear The converter function converting a canonical
 * year belonging to the epoch into epoch year.
 */

/**
 * The era of the calendar.
 */
export class CalendarEra {
  /**
   * 
   * @param {CalendarEraParams} param0 
   */
  constructor({ eraName: eraName, eraAbbrev: eraAbbrev, value, isEpochYear, getEpochYear }) {
    this.value = value;
    this.eraAbbrev = eraAbbrev;
    this.eraName = eraName;
    /**
     * The tester of the canonical year belonging to the era.
     * @type {import("./module.JsonMap.js").Predicate<number>}
     */
    this.isEraYear = isEpochYear;
    this.getYearOfEpoch = getEpochYear;
  }

  toString() {
    return this.eraAbbrev;
  }

  valueOf() {
    return this.value();
  }
  compare(other) {
    switch (typeof other) {
      case "number":
        return (this.value < other ? -1 : this.value > other ? 1 : 0);
      case "object":
        if (other instanceof CalendarEra) {
          // Other is a calendar era.
          return this.compare(this.value <= +other);
        } else if (other instanceof Map) {
          // The date map.
          return this.compare(other.get(ERA));
        }
      // eslint-disable-next-line no-fallthrough
      default:
        return undefined;
    }
  }
}

/**
 * The types allwoed as date types.
 * @typedef {DateMap | Object<string, number> | Array<number>} DateType
 */

/**
 * A gregorian calendar.
 */
export class GregorianCalendar {

  /**
   * The Eras of the Gregorian Calendar.
   * @enum {CalendarEra}
   */
  static Eras = {
    /**
     * The epoch of the Chrictian Before Christ.
     * @type {CalendarEra}
     */
    BC: new CalendarEra("Before Christ", "BC", 0, (year) => (year < 1), (year) => (1 - year)),
    /**
     * The epoch of the Chrictian Anno Domini.
     * @type {CalendarEra}
     */
    AD: new CalendarEra("Anno Dominimi", "AD", 1, (year) => (year > 0), (year) => (year)),
    /**
     * The epoch of the Before Common Era.
     * This era is equivalent of {@link this.BC}.
     * @type {CalendarEra}
     */
    BCE: new CalendarEra("Before Common Era", "BCE", 0, (year) => (year < 1), (year) => (1 - year)),
    /**
     * The epoch of the Common Era.
     * This era is equivalent of {@link this.AD}.
     * @type {CalendarEra}
     */
    CE: new CalendarEra("Common Era", "CE", 1, (year) => (year > 0), (year) => (year)),
    /**
     * Get the list of all eras.
     * @returns {CalendarEra[]} The calendar eras.
     */
    values() {
      return [this.BC, this.AD, this.BCE, this.CE];
    },
    /**
     * Get era from string rpresentaiton.
     * @param {string} rep Either the era name or abbreviation.
     * @return {CalendarEra?} The calendar era with given stirng as name or 
     * abbreviation.
     */
    parse(rep) {
      this.values().find((v) => (v.eraAbbrev === rep || v.eraName === rep));
    },
    /**
     * Get era form given value.
     * @param {number} value The era value.
     * @param {Object} param1 The options of the conversion.
     * @param {boolean} [christian=true] Does the conversion use the christian
     * eras instead of scientific ones.
     */
    fromValue(value, { christian = true } = {}) {
      if (christian) {
        return this.values().slice(0, 1).find((v) => (v.value === value));
      } else {
        return this.values().slice(2).find((v) => (v.value === value));
      }
    },

    /**
     * Get era from year.
     * @param {number} year The canonical year.  
     * @param {Object} param1 The options of the conversion.
     * @param {boolean} [christian=true] Does the conversion use the christian
     * eras instead of scientific ones.
     * @returns {CalendarEra} The calendar era of the given year.
     */
    fromYear(year, { christian = true } = {}) {
      if (christian) {
        return this.values().slice(0, 1).find((v) => (v.isEraYear(year)));
      } else {
        return this.values().slice(2).find((v) => (v.isEraYear(year)));
      }
    }
  }

  /**
   * Get the month names of the year.
   * @return {Array<string>} The array containing the month names
   * of the year with default locale.
   */
  static get monthNamesOfYear() {
    return [null, "January", "February", "March",
      "April", "May", "June",
      "July", "August", "September",
      "October", "November", "December"]
  }

  /**
   * Format date map.
   * @param {DateMap} dateMap The date map of the outputted date. 
   * @param {FormatingOptions} options The formatting options.
   * @returns {string} The formatted date map.
   * @throws {TypeError} The type of teh date map was invalid.
   */
  static formatDateMap(dateMap, options = {}) {
    if (dateMap instanceof Map) {
      return `${options.formatter ? options.formatter(dateMap) :
        `${formatAsOrdinal(dateMap.get(DAY_OF_MONTH), { asText: true })
        } of ${this.monthNamesOfYear.get(MONTH_OF_YEAR)} ${this.get(CANONICAL_YEAR)
        }`}`;
    } else {
      throw new TypeError(`Invalid date map ${dateMap instanceof Object
        ? "class".concat(Object.getPrototypeOf(dateMap))
        : "type ".concat(typeof dateMap)}`)
    }
  }

  /**
   * Is the given canonical year a leap year.
   * @param {number} year Canonical year. 
   * @returns {boolean} True, if and only if the canonical year is a leap year.
   */
  static isLeapYear(year) {
    return Number.isInteger(year) && year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
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
    this.name = this.constructor.name;
    if (startOfYear instanceof Map) {
      this.startOfYear = new JsonMap([[DAY_OF_MONTH, startOfYear[DAY_OF_MONTH]], [MONTH_OF_YEAR, startOfYear[MONTH_OF_YEAR]]]);
    } else if (startOfYear instanceof Object) {
      this.startOfYear = new JsonMap([[DAY_OF_MONTH, startOfYear.day || startOfYear.dayOfMonth], [MONTH_OF_YEAR, startOfYear.month || startOfYear.monthOfYear]]);
    } else if (typeof startOfYear === "number") {
      this.startOfYear = GregorianCalendar.getMonthDayOfDayOfYear(startOfYear);
    } else {
      throw new TypeError("Invalid start of year!");
    }

    // Getting the days of months, and last days of months.
    const startMonth = this.startOfYear.get(MONTH_OF_YEAR) || 1;
    const startDay = this.startOfYear.get(DAY_OF_MONTH) || 1;
    if (!(Number.isInteger(startMonth) && Number.isInteger(startDay))) {
      throw new RangeError(`Invalid start of year: ${startMonth}.${startDay}`);
    }
    if (startMonth === 1 && startDay === 1) {
      this.daysInMonths = GregorianCalendar.daysOfMonthsOfYear;
      this.lastYearDaysOfMonths = GregorianCalendar.lastDaysOfYearsOfMonthsOfYear;
      this.parentCalendar = undefined;
    } else {
      // Generating the days in months for the calendar.
      this.daysInMonths = this.createDaysInMonthsOfYears();
      this.lastYearDaysOfMonths = [...(this.daysInMonths.entries())].reduce(
        (result, [key, daysInMonths]) => {
          result.set(key, daysInMonths.reduce((result, daysInMonth, index) => {
            if (index) {
              result.push(daysInMonths + result[index - 1]);
            } else {
              // Adding the first two elements as is.
              result.push(daysInMonth);
            }
            return result;
          }, []))
          return result;
        },
        new Map()
      )
      this.parentCalendar = GREGORIAN_CALENDAR;
    }
    Object.freeze(this.daysInMonths);
  }

  /**
   * The data type of the options for generating date from day of year.   
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
    const daysOfYearsOfMonths = GregorianCalendar.lastDaysOfYearsOfMonthsOfYear.get(
      options.year != null
        ? (GregorianCalendar.isLeapYear(options.year) ? LEAP_YEAR : NORMAL_YEAR)
        : (options.yearType || NORMAL_YEAR));
    if (dayOfYear < 1 || dayOfYear > daysOfYearsOfMonths[daysOfYearsOfMonths.length - 1]) {
      if (options.year != null && options.lenient) {
        // Determining the correct year with leniency.
        let year = options.year;
        let day = dayOfYear;
        if (day < 1) {
          while (day < 1) {
            year--;
            day += GregorianCalendar.getDaysInYear(year);
          }
        } else {
          let daysInYear = GregorianCalendar.getDaysInYear(year);
          while (day > daysInYear) {
            day -= daysInYear;
            year++;
            daysInYear = GregorianCalendar.getDaysInYear(year);
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
        return GregorianCalendar.daysOfMonthsOfYear.get(GregorianCalendar.isLeapYear(yearOrYearType) ? LEAP_YEAR : NORMAL_YEAR);
      case "string":
        return GregorianCalendar.daysOfMonthsOfYear.get(yearOrYearType) || [0];
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
  static getLastDayOfYearInMonths(yearOrYearType) {
    switch (typeof yearOrYearType) {
      case "number":
        return GregorianCalendar.lastDaysOfYearsOfMonthsOfYear.get(GregorianCalendar.isLeapYear(yearOrYearType) ? LEAP_YEAR : NORMAL_YEAR);
      case "string":
        return GregorianCalendar.lastDaysOfYearsOfMonthsOfYear.get(yearOrYearType) || [0];
      default:
        return [0];
    }
  }


  /**
   * Create a canonical date from canonical day of year.
   * @param {number} year The canonincal year of the calendar.
   * @param {number} month The canonical month of hte calendar.
   * @param {number} day The canonical day of month of the calendar.
   * @returns {DateMap} The date map of the calendar date.
   * @throws {RangeError} The given date was not correct canonical date.
   */
  static createDate(year, month, day) {
    const result = new JsonMap();
    if (!(GregorianCalendar.validDate(year, month, day))) {
      return result;
    }
    const startDay = 1;
    const startMonth = 1;
    let yearType, daysInMonths, monthsInYear;
    switch (typeof year) {
      case "number":
        result.set(CANONICAL_YEAR, year);
        result.set(ERA, GregorianCalendar.Eras.fromCanonicalYear(year));
        result.set(YEAR_OF_ERA, result.get(ERA)?.getYearOfEpoch(year));
        yearType = (typeof year === "string" ? yearType
          : (GregorianCalendar.isLeapYear(year) ? LEAP_YEAR : NORMAL_YEAR));
        daysInMonths = GregorianCalendar.daysOfMonthsOfYear.get(yearType);
        if (daysInMonths == null) {
          daysInMonths = [0];
        }
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
          : (GregorianCalendar.isLeapYear(year) ? LEAP_YEAR : NORMAL_YEAR));
        daysInMonths = GregorianCalendar.daysOfMonthsOfYear.get(yearType) || [0];
        console.debug(`Valid Date for a ${yearType} ${year}`);
        console.debug(`Valid month: ${month} >= 1: ${month >= 1} AND ${month} < ${daysInMonths.length}`);
        console.debug(`Valid day: ${day} >= 1: ${day >= 1} AND ${day} <= ${daysInMonths[month]}`);
        return (month >= 1 && month < daysInMonths.length &&
          (day >= 1 && day <= daysInMonths[month]))
      default:
        return false;
    }
  }

  /**
   * Get the canonical calendar of the current calendar.
   * @returns {Calendar} The canonical calendar of the current calendar.
   */
  getCanonicalCalendar() {
    return this.parentCalendar ? this.parentCalendar.getCanonicalCalendar() : this;
  }

  /**
   * Get the year standard gregorian calendar year of the standard change of year.
   * @param {number} year The canonical year of the calendar.
   * @returns {number} The standard gregorian year of the 1st of Janaury.
   */
  getCanonicalYear(year) {
    return year + (this.startOfYear.get(MONTH_OF_YEAR) > 2 ? 1 : 0);
  }

  /**
   * Is a year a leap year.
   * @param {number} year The year of the calendar.
   * @returns {boolean} True, if and only if the given year of
   * calendar is a leap year.
   */
  isLeapYear(year) {
    return GregorianCalendar.isLeapYear(this.getCanonicalYear(year));
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
  createDaysInMonthsOfYears() {
    const startMonth = this.startOfYear.get(MONTH_OF_YEAR);
    const deltaDay = 1 - this.startOfYear.get(DAY_OF_MONTH);
    const deltaMonth = 1 - startMonth;
    const standardDaysOfMonthsOfYears = this.getDaysInCanonicalMonths();
    if (deltaDay || deltaMonth) {
      // The start of year is not 1.1. and we have to generate the days in months
      // from the standard days of years.
      const resultMap = [...(standardDaysOfMonthsOfYears.keys())].reduce(
        (result, key) => {
          // Getting the map of days in months created by transforming the standard year to start from other day.
          const daysInMonths = standardDaysOfMonthsOfYears.get(key);
          const resultDaysInMonths = daysInMonths.reduce(
            (result, daysInMonth, monthIndex) => {
              if (monthIndex) {
                const currentMonthIndex = (((12 + monthIndex - 1 + deltaMonth) % 12) + 1);
                if (deltaDay && currentMonthIndex === 1) {
                  // The start month is split between excess and start.
                  const previousMonthIndex = currentMonthIndex - 1;
                  result[previousMonthIndex] += deltaDay;
                  result[currentMonthIndex] += daysInMonth + deltaDay;
                } else {
                  result[currentMonthIndex] += daysInMonth;
                }
              }
              return result;
            }, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
          // A dding the 13th  month if necessary.
          if (resultDaysInMonths[0] < 0) {
            console.debug(`Result days in months: ${resultDaysInMonths.join(", ")}`)
            resultDaysInMonths.push(-(resultDaysInMonths[0]));
          }
          console.debug(`Result days in months: ${resultDaysInMonths.join(", ")}`)

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
   * @param {string|number} year Either the year type or the canonical year.
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

  /**
   * Test the validity of the canonical date of the calendar.
   * @param {number} year The canonical year.
   * @param {number} month The canonical month of year.
   * @param {number} day The canonical day of month.
   * @returns {boolean} True, if and only if hte given canonical date
   * is valid.
   */
  validCanonicalDate(year, month, day) {
    return GregorianCalendar.validDate(this.getCanonicalYear(year), month, day);
  }

  /**
   * Converts local calendar date to the canonical calendar date.
   * @param {DateMap|Object.<string, number>} dateMap The local calendar date. The date is assumed to be
   * a date of the current calendar, and the calendar field is not checked.
   * @returns {DateMap} The canonical calendar date of the given local date.
   */
  convertDateToCanonicalCalendarDate(dateMap) {
    if (this.getCanonicalCalendar() === this) {
      // The date is a canonical date.
      return dateMap;
    } else {
      // The start of the year differs - returning the canonical date.
      const calendar = this.getCanonicalCalendar();
      const result = new JsonMap([CALENDAR, calendar]);
      const monthsInYear = 12; // TODO: Calculate value from months in year.
      result.set(CANONICAL_YEAR, this.getCanonicalYear(this.getFieldValue(dateMap, CANONICAL_YEAR)))
      const month = this.getFieldValue(dateMap, MONTH_OF_YEAR);
      const day = this.getFieldValue(dateMap, DAY_OF_MONTH);
      if (month === 1) {
        result.set(DAY_OF_MONTH, day + this.startOfYear.get(DAY_OF_MONTH) - 1);
      } else {
        result.set(DAY_OF_MONTH, day);
      }
      result.set(MONTH_OF_YEAR,
        ((this.startOfYear.get(MONTH_OF_YEAR) + month - 1) % monthsInYear) + 1);

      return result;
    }
  }

  /**
   * Create a date from canonical day of year of the claendar.
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
   * Get the day of year from canonical date of the calendar.
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
   * Get the canonical calendar date field value from the calendar date.
   * @param {DateMap} dateMap The date map, whose value is queries. 
   * @param {string} fieldName The name of the field.
   */
  getCanonicalFieldValue(dateMap, fieldName) {
    if (GregorianCalendar.isEqualMonthDate(this.startOfYear, GregorianCalendar.startOfYear)) {
      return this.getFieldValue(dateMap, fieldName);
    }
    if (dateMap instanceof Map) {
      if (dateMap.get(CALENDAR) === GREGORIAN_CALENDAR) {
        // The calendar is a standard calendar.
        return this.getFieldValue(dateMap, fieldName);
      }
      const calendar = this.getCanonicalCalendar();
      let year, month;
      switch (fieldName) {
        case DAY_OF_YEAR:
          return calendar.getDayOfYear(
            this.getCanonicalFieldValue(dateMap, CANONICAL_YEAR),
            this.getCanonicalFieldValue(dateMap, MONTH_OF_YEAR),
            this.getCanonicalFieldValue(dateMap, DAY_OF_MONTH)
          )
        case MONTH_OF_YEAR:
          year = this.getCanonicalFieldValue(CANONICAL_YEAR);
          month = this.getFieldValue(MONTH_OF_YEAR) + this.startOfYear.get(MONTH_OF_YEAR) - 1;
          if (month < 1) {
            return month + calendar.getDayOfMonths(year - 1).length - 1;
          } else if (month >= calendar.getDaysInMonths(year).lengths) {
            return month - calendar.getDaysInMonths(year).length - 1;
          } else {
            return month;
          }
        case DAY_OF_MONTH:
          month = this.getFieldValue(dateMap, MONTH_OF_YEAR);
          if (month === 1) {
            return this.getFieldValue(dateMap, DAY_OF_MONTH) + this.startOfYear.get(DAY_OF_MONTH) - 1;
          } else {
            return this.getFieldValue(dateMap, DAY_OF_MONTH);
          }
        case CANONICAL_YEAR:
          return this.getCanonicalYear(this.getFieldValue(dateMap, CANONICAL_YEAR));
        default:
          // The field is not supported.
          return undefined;
      }
    } else if (dateMap instanceof Object) {
      return this.getCanonicalFieldValue(new JsonMap(
        [
          [CANONICAL_YEAR, this.getFieldValue(CANONICAL_YEAR)],
          [MONTH_OF_YEAR, this.getFieldValue(MONTH_OF_YEAR)],
          [DAY_OF_MONTH, this.getFieldValue(DAY_OF_MONTH)]
        ]), fieldName);
    }
    // The field is not supported.
    return undefined;
  }

  /**
   * Get date field values of the calendar.
   * @param {DateMap|Object.<string, number>} dateMap The map from date fields to date field values.
   * @param {string} fieldName The field name.
   * @returns {number?} The date field value, if the date field exists in the date map, and undefined
   * value otherwise.
   */
  getFieldValue(dateMap, fieldName) {
    if (dateMap instanceof Map) {
      if (dateMap.has(fieldName)) return dateMap.get(fieldName);
      switch (fieldName) {
        case DAY_OF_YEAR:
          return this.getDayOfYear(dateMap.get(CANONICAL_YEAR), dateMap.get(MONTH_OF_YEAR), dateMap.get(DAY_OF_MONTH));
        case MONTH_OF_YEAR:
          return this.getMonthDayOfDayOfYear(dateMap.get(DAY_OF_YEAR,
            { year: dateMap.get(CANONICAL_YEAR) })).get(MONTH_OF_YEAR);
        case DAY_OF_MONTH:
          return this.getMonthDayOfDayOfYear(dateMap.get(DAY_OF_YEAR,
            { year: dateMap.get(CANONICAL_YEAR) })).get(DAY_OF_MONTH);
        case CANONICAL_YEAR:
          return this.getCanonicalYear(this.getFieldValue(YEAR));
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
          return this.getDayOfYear(dateMap.year, dateMap.month, dateMap.day);
        case MONTH_OF_YEAR:
          return dateMap.month;
        case DAY_OF_MONTH:
          return dateMap.day;
        case YEAR:
          return dateMap.year;
        case CANONICAL_YEAR:
          return this.getCanonicalYear(dateMap.year);
        case EPOCH_DAY:
          return undefined;
        default:
          // The field is not supported.
          return undefined;

      }
    }
    // The field is not supported.
    return undefined;
  }

  /**
   * Get the epoch day of the canonical gregorian calendar date.
   * @param {number} year The canonical gregorian year.
   * @param {number} month The canonical gregorian month of the year with
   * January as first month of 1.
   * @param {number} day The canonican gregorian day of the month with 
   * 1st of January as the start of the year.
   * @returns {number?} The canonical gregorian date, if the given date is
   * a valid date. An undefined value, if it is not.
   */
  static getEpochDay(year, month, day) {
    if (this.validDate(year, month, day)) {
      const epochDay2000 = 30 * 365 + Math.floor(30 / 4);
      let result = (year - 2000) * 365;
      result += (year - 2000) / 4;
      result -= (year - 2000) / 100;
      result += (year - 2000) / 400;

      const lastYearDaysOfMonths = GregorianCalendar.lastDaysOfYearsOfMonthsOfYear.get(GregorianCalendar.isLeapYear(year) ? LEAP_YEAR : NORMAL_YEAR);
      return epochDay2000 + Math.trunc(result) + lastYearDaysOfMonths[month - 1] + day - 1;
    } else {
      return undefined;
    }
  }

  /**
   * Get the epoch day of the calendar.
   * @param {number} year The year of the calendar. 
   * @param {number} month The month of hte calendar. 
   * @param {number} day The day of the calendar.
   * @returns {number?} The epoch day of the calendar.
   */
  getEpochDay(year, month, day) {
    const dateMap = { year, month, day };
    const canonicalDate = {
      year: this.getCanonicalFieldValue(dateMap, CANONICAL_YEAR),
      month: this.getCanonicalFieldValue(dateMap, MONTH_OF_YEAR),
      day: this.getCanonicalFieldValue(dateMap, DAY_OF_MONTH)
    };
    const calendar = this.getCanonicalCalendar();
    if (calendar === this) {
      return GregorianCalendar.getEpochDay(year, month, day);
    } else {
      return calendar.getEpochDay(canonicalDate.year, canonicalDate.month, canonicalDate.day);
    }
  }

  /**
   * The formatting options of the date time.
   * @typedef {Object} DateFormatOptions
   * @property {Map<string, string>|Object.<string, string>} [fieldFormats] The field formats.
   * An absent fields are assumed to have value "default" indicating the default value. 
   * The recognized values are "short", "long", "number", "normal", "default".
   */

  formatCanonicalFieldValue(dateMap, fieldName, options = {}) {
    switch (fieldName) {
      case DAY_OF_MONTH:
        switch (options.fieldFormats[fieldName]) {
          case undefined:
          case "default":
          case "number":
            return `${this.getCanonicalFieldValue(this.getCanonicalFieldValue(dateMap, fieldName))}`
          case "short":
          case "normal":
            return `${formatAsOrdinal(this.getCanonicalFieldValue(dateMap, fieldName), { withTextSuffix: true })}`;
          case "long":
            return `${formatAsOrdinal(this.getCanonicalFieldValue(dateMap, fieldName), { withText: true })}`;
          default:
            return undefined;
        }
      case MONTH_OF_YEAR:
        switch (options.fieldFormats[fieldName]) {
          case undefined:
          case "default":
          case "number":
            return `${this.getCanonicalFieldValue(this.getCanonicalFieldValue(dateMap, fieldName))}`
          case "short":
            return `${GregorianCalendar.monthNamesOfYear[this.getCanonicalFieldValue(dateMap, fieldName).substring(0, 3)]}`;
          case "normal":
          case "long":
            return `${GregorianCalendar.monthNamesOfYear[this.getCanonicalFieldValue(dateMap, fieldName)]}`;
          default:
            return undefined;
        }
      case YEAR:
      case CANONICAL_YEAR:
        return `${this.getCanonicalFieldValue(dateMap, fieldName)}`;
      case ERA:
        return GregorianCalendar.Eras.fromValue(this.getCanonicalFieldValue(dateMap, fieldName))?.eraAbbrev || "";

      default:
        undefined;
    }
  }

  /**
   * Format a date map. 
   * @param {DateType} dateMap The date map.
   * @param {DateFormatOptions} [options] The formatting options.
   */
  formatDateMap(dateMap, options = {}) {
    const getFieldFormatName = (formatMap, fieldName) => {
      switch (typeof formatMap) {
        case "object":
          if (formatMap instanceof Map) {
            return formatMap.get(fieldName) || "default";
          } else {
            return formatMap[fieldName] || "default";
          }
        default:
          return undefined;
      }
    }
    const getFieldFormatter = (formatterMap, fieldName, formatName = "default") => {
      return formatterMap?.get(fieldName)?.get(formatName) || ((value) => (`${value}`));
    }
    const day = this.getCanonicalFieldValue(dateMap, YEAR);
    const month = this.getCanonicalFieldValue(dateMap, MONTH_OF_YEAR);
    const year = this.getFieldValue(dateMap, CANONICAL_YEAR);
    const era = GregorianCalendar.Eras.fromYear(year); // TODO: Replace with calendar era determination
    if (day != null) {
      // The date is a day of month date.
      if (month) {
        if (year != null) {
          // The date. 
          // TODO: THe formatter map containing the date.
          if (era) {
            return `${era.getYearOfEpoch(year)}${era.eraAbbrev}.${month}.${day}`;
          } else {
            return `${year}.${month}.${day}`;
          }
        } else {
          // The month-day.
          const formatterMap = new JsonMap([
            [MONTH_OF_YEAR, new JsonMap([["short", ((number) => (GregorianCalendar.monthNamesOfYear[number]).substring(0, 3))],
            ["long", ((number) => (GregorianCalendar.monthNamesOfYear[number]))],
            ["default", ((number) => (`${number}.`))]
            ])],
            [DAY_OF_MONTH, new JsonMap([
              ["default", (day) => formatAsOrdinal(day, { withTextSuffix: true })]
            ])],
            ["MonthDay", new JsonMap([
              ["default", (month, day) => `${month}.${day}`]
            ])]]);
          const formatter = getFieldFormatter(formatterMap, "MonthDay", getFieldFormatName(options.fieldFormats, "MonthDay"));
          return formatter(month, day);
        }
      } else {
        throw RangeError("Cannot format a day of month without a month.")
      }
    } else if (month != null) {
      // Month of year
      return `${year}.${month}`;
    } else if (year != null) {
      if (era) {
        return `${era.getYearOfEpoch(year)}${era.eraAbbrev}`;
      } else {
        return `${year}`;
      }
    }
  }
}


/**
 * The constant containing the stardard gregorian calendar with 
 * start of year at 1st of January. The instance is immutable.
 * @readonly
 */
const GREGORIAN_CALENDAR = new GregorianCalendar();
Object.freeze(GREGORIAN_CALENDAR);

/**
 * The default export is an instance of gregorian calendar using
 * 1st of January as first day of year.
 */
export default GREGORIAN_CALENDAR;