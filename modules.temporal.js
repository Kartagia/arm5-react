

/**
 * An era
 * @typedef {object} Era
 * @property {string} name The name of the era.
 * @property {number} value The value of hte era.
 * @method test
 * @param {number} canonicalYear The tested year.
 * @returns {boolean} True, if and only if the given canonical year belongs to the era.
 * @method canonical
 * @param {number} yearOfEra The year of era converted to a canonical year.
 * @return {number|undefined} The canonical year of the given year of era. An undefined value,
 * if the given year of Era was not valid.
 * @method validYear
 * @param {number} yearOfEra The tested year of era.
 * @return {boolean} True, if and only if the given year of era is valid year of era.
 * @method convert
 * @param {number} canonicalYear The converted canonical year.
 * @return {number|undefined} The year of era for the given canonical year. An undefined value
 * indicates the canonical year does not belong to the era.
 * @method toString
 * @return {string} The name of the era.
 * @method valueOf
 * @return {number} The value of the era.
 */

/**
 * Create a era.
 * @param {string} name The name of the era.
 * @param {Function} yearOfEraFunction The function returning the year of era for a canonical year.
 * @param {Function} canonicalYearFunction The function returning the canonical year of the year of era.
 * @param {Function} [isMemberFunction] The function determining if a canonical year is a member of the era.
 * Defaults to a function returning true, if and only if the year of era is defined.
 */
export function createEra(name, value, yearOfEraFunction, canonicalYearFunction, isMemberFunction = null) {
  return {
    name: name,
    convert: yearOfEraFunction,
    canonical: canonicalYearFunction,
    test: (isMemberFunction ? isMemberFunction : (canonicalYear) => (this.yearOfEra(canonicalYear) != null)),
    value: value,
    valueOf() {
      return this.value;
    },
    toString() {
      return this.name;
    },
    validYear(yearOfEra) {
      return this.canonical(yearOfEra) != null;
    }
  };

}

/**
 * A definition of a year.
 * @typedef {object} YearDefinition 
 * @property {number} firstDay The first day of year.
 * @property {number|undefined} [lastDay] The last day of year. 
 * Defaults to the first day + day count -1, if the day count is defined.
 * @property {number|undefined} [dayCount] The day count of the year.
 * Defauls to teh last day - first day +1, if last day is defined.
 * @property {YearDefinition|null} [next=null] The definition of the next year.
 * @property {YearDefinition|null} [previous=null] The definition of the previous year.
 * @method validDayOfyYear 
 * @param {number} dayOfYear The day of year.
 * @return {boolean} True, if and only if the given day of year is valid
 * for the year defintion.
 */

/**
 * A solar year is defined by the number of days of the year.
 * @typedef {YearDefinition} SolarYearDefinition
 */

/**
 * The definition of a lunar year.
 * @typedef {YearDefinition} LunarYearDefinition 
 * @property {LunarYearDefinition|null} [next=null]
 * @property {LunarYearDefintiion|null} [previous=null]
 * @property {Array<Month>} [months] The months of year.
 * @property {number} [firstMonth=1] The first month of year.
 * @property {number|null} [lastMonth=null] The last month of year.
 * @method validMonth
 * @param {number|Month}
 * @returns {boolean} True, if and only if the given month is valid month of the year definition.
 */

/**
 * A year.
 * @class Year 
 * @property {number} value The value of the year.
 * @method valueOf
 * @return {number} The value of the year.
 * @method validMonth
 * @param {number|Month} month The tested month of year.
 * @return {boolean} True, if and only if the given month is valid month of year.
 * @method getMonth
 * @param {number|Month} month The target month of year. 
 * @return {MonthOfYear?} The month of year created by combining this year and given month.
 */
class Year {

  constructor({ value, monthsOfYear = undefined, weeksOfYear = undefined, firstDay = 1, lastDay = undefined, dayCount = undefined }) {
    this.value = value;
    this.monthsOfYear = monthsOfYear;
    this.weeksOfYear = weeksOfYear;
    this.firstDayOfYear = firstDay;
    this.lastDayOfYear = (lastDay == undefined ? (dayCount != undefined ? firstDay + dayCount - 1 : undefined) : lastDay);
    this.dayCount = (dayCount == null ? (lastDay == null ? undefined : lastDay - firstDay + 1) : undefined);
  }

  /**
   * The string representation of the year.
   * @returns {string} The string representation of the year.
   */
  toString() {
    return "" + this.valueOf();
  }

  /**
   * Converts the year to JSON.
   */
  toJSON(key = "") {
    return {

    };
  }

  static fromJSON(str) {

  }

  static fromString(str) {
    return str ? new Year(Number.parseInt(str)) : undefined;
  }

  /**
   * The value of the year.
   * @returns {number} The value of the year.
   */
  valueOf() {
    return this.value;
  }
}

/**
 * The canonical year.
 * @class CanonicalYear
 * @extends Year
 * @property {number} canonicalYear The canonical year.
 * @property {number} value The canonical year. 
 */

/**
 * The year of an era.
 * @class YearOfEra
 * @extends Year
 * @property {number|Year} yearOfEra The year of era.
 * @property {Era} era The era.
 * @property {number} value The year of the era. 
 */

/**
 * @param {number} month The month of year.
 * @param {YearOfEra} yearOfEra The year of era.
 */
function createMonthOfEra(month, yearOfEra) {
  yearOfEra.value;
}

/**
 * A data structure repesnting a day.
 * @typedef {object} Day 
 * @property {number} value The value of the day.
 */

/**
 * A data structure representing a month.
 * @typedef {object} Month
 * @property {number} value The value of the month.
 * @property {string} [name] The name of the month.
 * @property {string} [shortName] The short name of the month.
 * @property {number} [dayCount] The number of days the month has.
 * @property {number} [firstDay=1] The first day of the month.
 * @property {number} [lastDay=(firstDay + dayCount -1)] The last day of month.
 * @method validDay
 * @param {number} dayOfMonth The tested day of month.
 * @returns {boolean} True, if and only if the given day is valid day of the month.
 * @method toString
 * @return {string|undefined} The name of the month.
 * @method valueOf
 * @return {number} The value of the month.
 */


/**
 * Create a month.
 * @param {number} value The value of the month.
 * @param {string} [name] The name of the month.
 * @param {string} [shortName] The short name of the month.
 * @param {dayCount} [number] The number of days in the month.
 * Defaults to the last day - first day + 1
 * @param {firstDay} [number=1] The first day of the month.
 * @param {lastDay} [number] lastDay The last day of the month. if undefined,
 * the value is defined by the first day and the day count. 
 */
export function createMonth(value, name = undefined, shortName = undefined, dayCount = undefined, firstDay = 1, lastDay = null) {
  return {
    name: name,
    value: value,
    shortName: shortName,
    firstDay: Math.trunc(firstDay),
    dayCount: (dayCount == null ? (lastDay == null ? undefined : Math.trunc(lastDay) - Math.trunc(firstDay) + 1) : Math.trunc(dayCount)),
    lastDay: (lastDay == null ? (dayCount == null ? undefined : Math.floor(dayCount + firstDay - 1)) : Math.trunc(lastDay)),

    /**
     * Test validity of the day of month.
     * @param {number} dayOfMonth The day of month 
     */
    validDay(dayOfMonth) {
      if (this.firstDay) {
        return dayOfMonth >= this.firstDay && (Number.isInteger(this.lastDay) || dayOfMonth <= this.lastDay);
      } else if (this.lastDay) {
        return dayOfMonth < this.lastDay;
      } else {
        return true;
      }
    },
    toString() {
      return this.name;
    },
    valueOf() {
      return this.value;
    }
  };
}


/**
 * Temporal type implementing day of month.
 */
export class DayOfMonth {

  /**
   * Create a day of month.
   * @param {number} day The day of month starting from 1.
   * @param {number|Month|MonthOfYear} month The month of year as a number starting from 1 or a Month.
   */
  constructor(day, month) {
    this._dayOfMonth = day;
    if (typeof month === "object") {
      this._month = month;
    } else {
      this._month = createMonth(month);
    }
  }

  /**
   * Is the date valid for the given year.
   * @param {Year} year The tested year of era. 
   * @returns True, if and only if the day of month is a valid day of month for the given year.
   */
  isValid(year) {
    if (year) {
      // Using the year to determine the days of months.
      return year.validMonth(this.month) && year.getMonth(this.month).validDay(this.day);
    } else if (this.month instanceof MonthOfYear) {
      // Using the month of year.
      return (this.day >= this.month.firstDay && this.day <= this.month.lastDay);
    } else {
      // TODO: Change these fixed values to variables.
      return (this.day >= 1 && this.day <= 31) && (this.month >= 1) && (this.month <= 12);
    }
  }

  /**
   * Get the day of month.
   * @type {number}
   */
  get dayOfMonth() {
    return this._dayOfMonth;
  }

  /**
   * Is the current day of month valid.
   * @return {boolean} True, if and only if the current day of month is valid. 
   */
  get isValid() {
    if (typeof this.month === object) {
      return this.month.validDay(+this.dayOfMonth);
    } else {
      return true;
    }
  }

  /**
   * Get the month.
   * @type {Month|MonthOfYear}
   */
  get month() {
    return this._month;
  }

  toString() {
    return `${+this.dayOfMonth}.${+this.month}`;
  }
}

/**
 * Create a regular expressoin string matching to a year.
 * @param {number} [max] The maximum length of the year number.
 * @param {number} [min=1] The minimum length of the yera number. 
 * @param {Array<Era>} [eras=[Era.BC, Era.AD]] The eras of the regex.
 * @param {boolean} [requireEra=false] Does the created expression
 * require era. 
 * @returns The regular expresion string with capturing groups "year" and "era"
 * storing the year and era matched in the patterm.
 */
export function createYearRegex(max = null, min = 1, eras = Eras.values, requireEra = false) {
  return `(?<year>\\d{${min},${max == null ? "" : max}})(?<era>${eras.reduce(
    (result, era) => ((result ? "|" : "") + era.toString()), "")
    }${requireEra ? "" : "?"}`;
}

////////////////////////////////////////////////////////////////////////////////////
// Grego-Julian Calendar
////////////////////////////////////////////////////////////////////////////////////

let gregoJulianEraIndex = 0;

/**
 * The eras of the years.
 * 
 * Eras are functions determining which canonical years
 * belongs to the era.
 * @enum {Era} 
 */
export const Eras = {
  /**
   * The era of the before christ.
   */
  BC: createEra("BC", gregoJulianEraIndex++,
    (canonicalYear) => (1 - canonicalYear),
    (year) => (1 - year),
    (canonicalYear) => (canonicalYear <= 0)),
  /**
   * The era of the common era. This is equivalent of the AD.
   */
  CE: createEra("CE", gregoJulianEraIndex,
    (canonicalYear) => (canonicalYear), (year) => (year), (canonicalYear) => (canonicalYear > 0)),
  Epoch: createEra("Epoch", gregoJulianEraIndex++,
    (canonicalYear) => (canonicalYear < 1970 ? undefined : canonicalYear - 1970),
    (year) => (year >= 0 ? year + 1970 : undefined),
    (canonicalYear) => (canonicalYear >= 1970)
  ),
  /**
   * The era of the anno domini.
   */
  AD: createEra("AD", gregoJulianEraIndex++,
    (canonicalYear) => (canonicalYear), (year) => (year), (canonicalYear) => (canonicalYear > 0)),
  /**
   * The computer epoch. 
   */
  Epoch: createEra("Epoch", gregoJulianEraIndex++,
    (canonicalYear) => (canonicalYear < 1970 ? undefined : canonicalYear - 1970),
    (year) => (year >= 0 ? year + 1970 : undefined),
    (canonicalYear) => (canonicalYear >= 1970)
  ),

  /**
   * The values of the eras.
   */
  get values() {
    return [this.BC, this.AD, this.CE, this.Epoch];
  },

  /**
   * Get the era of the string representation.
   * @param {string} str The string representation of the era.
   * @return {Era} The era of the given string.
   */
  parse(str) {
    return this.values().find((era) => (era.toString() == str));
  },

  /**
   * Get the era from value.
   * @param {number} value The value of the era.
   * @returns {Era|undefined} The era of the given value, if any exists.
   */
  fromValue(value) {
    return this.values().find((era) => (era.valueOf() === value));
  }
};


////////////////////////////////////////////////////////////////////////////////////////////
// The Gregorian calendar 
////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Is the given canonical gregorian year a leap year.
 * @param {number} canonicalYear The canonical year of the Gregorian reckoning. 
 * @returns True, if and only if the given year is a leap year.
 */
export function isGregorianLeapYear(canonicalYear) {
  return (canonicalYear % 4 == 0 && (canonicalYear % 100 != 0 || canonicalYear % 400 == 0));
}

/**
 * Regular expression matching to a year with optional era.
 */
export const gregoJulianYearRegex = createYearRegex();


///////////////////////////////////////////////////////////////////////////////////
// Computer epoch
///////////////////////////////////////////////////////////////////////////////////

/**
 * The epoch year. 
 * @extends {YearOfEra}
 */
export class EpochYear {

  constructor(canonicalYear) {
    this.era = Eras.Epoch;
    if (this.era.validYear(canonicalYear)) {
      this.value = this.era.convert(canonicalYear);
    } else {
      throw new RangeError("Year does not belong to the epoch");
    }
  }

  valueOf() {
    return this.value;
  }
}

///////////////////////////////////////////////////////////////////////////////////
// Julian Calendar methods
///////////////////////////////////////////////////////////////////////////////////

/**
 * Parse a Julian Calendar date from a string.
 * @param {string} str The parsed string. 
 * @returns {JulianDate|JulianMonthOfYear|JulianDayOfYear} If the given string is a valid julian date, the Julian Date object is returned.
 * Otherwise, an undefined value is returned to indicate an invalid date.
 */
export function parseJulianDate(str) {
  let result = undefined;
  [
    new RegExp("^(?<day>\\d{1,2}))\\(?:\\.(?<month>1?\\d))?\\." + gregoJulianYearRegex + "$"),
    new RegExp("^(?<month>1?\\d)/" + gregoJulianYearRegex + "$"),
    new RegExp("^" + createYearRegex(null, null, true) + "/" +
      "(?<month>1?\\d)$")
  ].forEach(
    (pattern, index) => {
      if (result == undefined) {
        let match = pattern.exec(str);
        if (match) {
          result = {
            day: match.groups.day,
            month: match.groups.month,
            year: match.groups.year,
            era: match.group.era || "AD"
          };
        }
      }
    }
  );

  if (result == undefined) {
    return undefined;
  }
  if (result.month != null && result.day != null) {
    // We do have a date.
    return result;
  } else if (result.day == null) {
    // We do have a month of year.
    return result;
  } else {
    // We do have a day of year.
    return result;
  }

}



/**
 * Predicate testing validity of a day of a month.
 * @callback DayValidator
 * @param {number} dayOfMonth The tested day of month,.
 * @return {boolean} True, if and only if the validator passes the given day of the month.
 */

/**
 * @typedef {object} Month
 * @property {number} value The value of the month.
 * @property {number} dayCount The number of days in the month.
 * @property {DayValidator} validDay The day predicate testing whether the day is valid.
 * @property {Function} valueOf The function returning the value of the month.
 * @property {Function} toString The function returning the string representation
 * of the month.
 */

/**
 * The month of the year. 
 */
export class JulianMonthOfYear {

  /**
   * Create a new month of year.
   * @param {Month|number} month The month of the year starting with index of 1.
   * @param {JulianYear|number} year The year of the julain year. If it is a 
   * number, then it is interpreted as canonical year.
   */
  constructor(month, year) {
    this.year = (typeof year === "number" ? new JulianYear(year) : year);
    if (this.year.validMonth(month)) {
      this.month = 0 + month;
    } else {
      throw new RangeError("Invalid month of year");
    }
  }

  /** Test validity of the day.
   * @param {number} dayOfMonth The tested day of month.
   * @return {boolean} True, if and only if the given day of month is a valid
   * day of month.
   */
  validDay(dayOfMonth) {
    return dayOfMonth >= 1 && this.year.daysOfYear[this.month];
  }

  /**
   * Get the date of a day of this month.
   * @param {number} dayOfMonth The day o fmonth. 
   * @returns {JulianDate} The julian date of the given day of month of the current
   * month of the year.
   */
  dayOfMonth(dayOfMonth) {
    if (this.validDay(dayOfMonth)) {
      return new JulianDate(dayOfMonth, this.month, this.year.year, this.year.month);
    } else {
      throw new RangeError("Invalid day of month");
    }
  }
}

/**
 * A class representing a Julian Year.
 */
export class JulianYear {

  /**
   * Get the days of years of each month of a year.
   */
  static get daysOfYearsOfNormalMonths() {
    return this.daysOfMonths.reduce(
      (result, dayCount) => {
        result.push(result[result.size() - 1] + dayCount);
      });
  }

  /**
   * Get the days of years for each month of a leap year.
   */
  static get daysOfYearsOfLeapMonths() {
    return this.daysOfYearsOfMonths.map((value, index) => (value + (index >= 2 ? 1 : 0)));
  }



  /**
   * Get the default days of months of years.
   */
  static get daysOfMonths() {
    return [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  }

  /**
   * Get the months of the leap years.
   */
  static get monthsOfLeapYear() {
    const result = this.daysOfMonths;
    result[1]++;
    return result.map((dayCount, index) => {
      return {

        value: index,
        minDay: 1,
        dayCount: dayCount,
        validDay(dayOfMonth) {
          return dayOfMonth >= minDay && dayOfMonth <= this.dayCount;
        },
        valueOf() {
          return this.value;
        },
        toString() {
          return `${this.value}`;
        }

      }
    });
  }

  /**
   * Get the months of normal year.
   */
  static get monthsOfNormalYear() {
    const result = this.daysOfMonths;
    return result.map((dayCount, index) => {
      return {

        value: index,
        maxDays: dayCount,
        validDay(dayOfMonth) {
          return dayOfMonth > 0 && dayOfMonth <= this.maxDays;
        },
        valueOf() {
          return this.value;
        },
        toString() {
          return `${this.value}`;
        }

      }
    });
  }

  /**
   * Is the given canonical year a leap year.
   * @param {number} canonicalYear The canonical year. 
   * @returns True, if and only if the given canonical year
   * is a leap year.
   */
  static isLeapYear(canonicalYear) {
    return (canonicalYear % 4 == 0);
  }

  /**
   * Create a new Julian eyar.
   * @param {number} year The year of the era.
   * @param {Eras} [era=Eras.AD] The era of the year. 
   * @param {DayOfMonth|number} [startOfYear=1] The first day of the year.
   * the start of the year. If number, it is the day of the year starting the year.
   */
  constructor(year, era = Eras.AD, startOfYear = 1) {
    this.year = year;
    this.era = era;
    if (this.isLeapYear) {
      this.daysOfMonths = this.constructor.daysOfYearsOfLeapMonths;
      this.months = this.constructor.monthsOfLeapYear;
    } else {
      this.daysOfMonths = this.constructor.daysOfYearsOfNormalMonths;
      this.months = this.constructor.monthsOfNormalYear;
    }

    // Determining the start of year.
    if (startOfYear instanceof DayOfMonth) {
      this.starOfYear = this.getDaysOfYearsOfMonths[startOfYear.month] + startOfYear.day;
    } else {
      // It is a number.
      if (day < 1 || day > daysOfYear()) {
        throw new RangeError("Invalid start of a year: The day of year not in the year");
      } else {
        this.startOfYear = startOfYear;
      }
    }
  }

  /**
   * Is the current year leap year.
   * @returns True, if and only if the current year is a leap year.
   */
  isLeapYear() {
    return this.constructor.isLeapYear(this.era.canonical(this.year));
  }

  /**
   * Check the validity of a month.
   * @param {number|Month} month The tested month of year as number or a month. 
   * @returns True, ifa nd only if the year has the given month.
   */
  validMonth(month) {
    // TODO: replace with a property.
    return this.months.some((e) => (e.value == month));
  }

  /**
   * Get the month of year.
   * @param {number|Month} month The month of year. 
   * @returns {JulianMonthOfYear} The month of year of the given month.
   * @throws {RangeError} The given month was an invalid value.
   */
  getMonth(month) {
    return this.validMonth(month) ? new JulianMonthOfYear(this.months[month], this) : null;
  }

  /**
   * The canonical form of the year.
   * @return {number} The canonical year of the julian year.
   */
  get canonical() {
    return this.era.canonical(this.year);
  }

  /**
   * The number of milliseconds to the start of the year of 2000. 
   * @return The number of epoch milliseconds to the start of the year 2000.
   */
  static get GregorianEpochMilliseconds_20000101() { return 0 + (new Date(`2000-1-1`)); }

  /**
   * Get the julian date difference.
   * @param {number} canonicalYear The cannical year. 
   * @returns  The number of days the Julian Calendar date is ahead of Gregorian Calendar dates.
   */
  static getJulianDateDifference(canonicalYear) {
    return (7 - 12 + 3) + (Math.floor(canonicalYear / 100) - Math.floor(canonicalYear / 400));
  }

  /**
   * Get the number of milliseconds to the epoch at the beginning of the year.
   * @return {number} The number of milliseconds to the start of epoch at the start of the year.
   */
  getEpochMilliseconds() {
    const canonicalYear = this.canonical;
    const yearsTo2000 = (this.canonical - 2000);
    const dayDifference = this.constructor.julianDateDifference(canonicalYear);
    return GregorianEpochMilliseconds_20000101 + (yearsTo2000 * 365 + dayDifference) * 1000 * 3600 * 24;
  }

  /**
   * Get the Julian Year from canonical.
   * @param {year} canonicalYear The canonical year.
   * @param {number} [startOfYear=1] The start of the year as day of a year.
   * @returns {JulianYear} The Julian year of the given canonical year.
   */
  static from(canonicalYear, startOfYear = 1) {
    let era = Eras.values().find((e) => (e.test(canonicalYear)));
    return new JulianYear(era.convert(canonicalYear), era, startOfYear);
  }
}

/**
 * A class representing a day of year of the Julian Calendar.
 */
export class JulianDayOfYear {

  /**
   * Create a new julian day of year.
   * @param {number} dayOfYear The day of year. 
   * @param {JulianYear|number} year The canonical year or the Julian Year.
   */
  constructor(dayOfYear, year) {
    this.year = (year instanceof JulianYear ? year : new JulianYear(year));
    if (this.year.validDay(dayOfYear)) {
      this.dayOfYear = dayOfYear;
    } else {
      throw new RangeError("Invalid day of year");
    }
  }

  /**
   * The value of the day of year is the number of milliseconds to the start of the epoch
   * at the start of the day.
   * @return {number} The number of milliseconds to the start of the epoch.
   */
  get value() {
    return this.year.getEpochMilliseconds + this.dayOfYear * 24 * 3600 * 1000;
  }

  toString() {
    return `${this.dayOfYear}.${this.year.canonical}`
  }

  toJSON() {
    return {
      year: this.year.canonical,
      dayOfYear: this.dayOfYear
    };
  }

  toEpochMilliseconds() {
    return this.year + (this.dayOfYear - 1) * (24 * 3600 * 1000);
  }

  toDate() {
    return new Date(this.toEpochMilliseconds());
  }

}

/**
 * A date of the Julian Calendar.
 */
export class JulianDate {

}

/**
 * Entry represents an entry with title, name, id, and description.
 */
export class Entry {

  constructor(title, date, desc, id = undefined) {
    this.title = title;
    this.date = this.constructor.parseDate(date);
    this.description = desc;
    this.id = id;
  }


  static parseDate(str) {
    return Season.parse(str) || parseJulianDate(str);
  }

}




/**
 * This package contains modules related to the temporal functions.
 * 
 * As the Temporal is still experimental state, the library does not support
 * temporal yet, but implements result similar to the Temporal easily adapted
 * to the Temporal later.
 * @package
 */