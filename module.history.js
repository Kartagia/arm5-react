
import { HermeticCalendar } from "./modules.calendar.hermetic.js";

/**
 * The Gregorian Calendar.
 */
class GregorianCalendar {

  /**
   * Is the given year starting from 1st of January a leap year.
   * @param {number} year The canonical Gregorian year. 
   * @returns {boolean} True, if and only if the year starting from 1st of
   * January is a leap year.
   */
  static isLeapYear(year) {
    return (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0));
  }

  static daysOfMonthsOfYears = [0, 31, 28, 31.30, 31, 30, 31, 31, 30, 31, 30, 31].reduce(
    (result, daysOfMonth, index) => {
      result.normal.push(daysOfMonth);
      result.leap.push(daysOfMonth + (index === 2 ? 1 : 0))
      return result;
    }, { normal: [], leap: [] }
  )

  /**
   * The days years of a normal year.
   */
  static daysOfYears = [0, 31, 28, 31.30, 31, 30, 31, 31, 30, 31, 30, 31].reduce(
    (arr, val) => {
      if (arr.length) {
        arr.push(arr[arr.length - 1] + (val ? val : 0));
      } else {
        arr.push(val);
      }
      return arr;
    }, []);

  /** Daysvof seasons of the gregorian
   * normal year. The first season is the winter of the previous year.
   * (The Spring equinox is assumed on 20th of March starting Spring on 21st of March.) )
   */
  static daysOfYearsOfSeasons =
    this.daysOfYears.reduce(
      (arr, val, index) => {
        const newVal = (arr ? arr[arr.length - 1] : 0) + (val ? val : 0);
        if (index % 3 == 0) {
          arr.push(newVal);
        } else {
          arr[arr.length - 1] += newVal;
        }
        return arr;
      },
      []
    ).map((v) => (21 - 31 - 1 + v));

}

class JulianCalendar extends GregorianCalendar {

  static isLeapYear(year) {
    return year % 4 === 0;
  }

  isLeapYear(year) {
    return this.constructor.isLeapYear(year);
  }
}

/**
 * Class of a season.
 */
export class Season {

  constructor(name, abbrev = null, value = undefined) {
    this._name = name;
    this._value = value;
    this._abbrev = abbrev;
  }

  get name() {
    return this._name;
  }

  get abbrev() {
    return this._abbrev || this.name.substring(0, 2);
  }

  get value() {
    return this._value;
  }

  valueOf() {
    return this.value;
  }

  toString() {
    return this.name;
  }

  compare(other) {
    let target;
    if (other instanceof Season) {
      target = other.value;
    } else {
      target = 0 + other;
      if (!Number.isSafeInteger(target)) {
        return undefined;
      }
    }
    return (this.value < target ? -1 : this.value > target ? 1 : 0);
  }
}


let seasonIndex = 1;

/**
 * Season enumeration defines enumeration of seasons.
 * @typedef {Object} SeasonEnum
 * 
 * @property values
 * @description Get the seasons of enumeration.
 * @type {Array<Season>} 
 * 
 * @method parse 
 * @description Parses given source finding first season with the 
 * parsed string as the abbreviation or the name of the season.
 * @param {string} source The parsed value.
 * @returns {Season?} The parse season.
 * 
 * @method ofValue
 * @description Get the season equivalent with the given value.
 * @param {number} value The value, whose season is queried.
 * @returns {Season?} The season of the given value.
 * 
 * @method from
 * @param {string|number|Season} value the converted value.
 * @returns {Season?} The season of the given value.
 * @description Converts a value to a season.
 * If the value is a string, it will be parsed.
 * If the value is an integer or another Season, the Season with same value is returned.
 */

/**
 * Seasons contains the seasons of year. The season value is 1 based.
 * @readonly
 * @enum {Season}
 * @extends {SeasonEnum}
 */
export const seasons = {
  Spring: new Season("Spring", null, seasonIndex++),
  Summer: new Season("Summer", null, seasonIndex++),
  Autumn: new Season("Autumn", null, seasonIndex++),
  Winter: new Season("Winter", null, seasonIndex++),
  /**
   * The list of seasons.
   */
  get values() {
    return [this.Spring, this.Summer, this.Autumn, this.Winter];
  },
  /**
   * Parse a string into season.
   * @param {string} value
   * @returns {Season?} the parsed season, if any exists.
   */
  parse(value) {
    return this.values().find((v) => (v.name === value || v.abbrev === value));
  },
  /**
   * @inheritdoc
   */
  ofValue(value) {
    return this.values().find((v) => (v.value === value));
  },

  /**
   * Converts a value to a season.
   * If the value is a string, it will be parsed.
   * If the value is an integer or another Season, the Season with same value is returned.
   * @param {string|number|Season} value the converted value.
   * @returns {Season?} The season of the given value.
   */
  from(value) {
    switch (typeof value) {
      case "string":
        return this.parse(value);
      case "number":
        return this.ofValue(value);
      case "object":
        if (value instanceof Season) {
          return this.ofValue(value.value);
        }
      // eslint-disable-next-line no-fallthrough
      default:
        return undefined;
    }
  },
  compare(a, b) {
    const comparee = this.from(a);
    const compared = this.from(b);
    if (comparee == null || compared == null) {
      return undefined;
    }
    return comparee.compare(compared);
  }
}
Object.freeze(seasons);

/**
 * Season of yearnrepresents a season of a specific hernetic year.
 */
export class seasonOfYear {

  /**
   * Create Season of a julian year.
   * @param {number} year the canoncial year of the Julian calendar.
   * @param {number|string|Season} season the season of the year.
   * @param {SeasonEnum} [allSeasons] The enumeration of the seasons.
   * Defaults to the {@link seasons}
   */
  constructor(year, season, allSeasons = null) {
    this._year = year;
    this._allSeasons = allSeasons;
    this._season = this.allSeasons.from(season);
  }

  /**
   * Get the Season implementation of the current class.
   * @return {SeasonEnum} the seasons enumeration inplementation the season of year uses.
   */
  static get Seasons() {
    return seasons;
  }

  /**
   * The canonical Julian year of the season.
   * @type {number}
   */
  get year() {
    return this._year;
  }

  /**
   * The season.
   */
  get season() {
    return this._season;
  }

  get allSeasons() {
    return this._allSeasons || this.constructor.Seasons;
  }

  /**
   * Get the season of year from Julian date.
   * @param {number} day the day of month or the day of year, if month is not defined.
   * @param {number} year the julian year.
   * @param {number} [month] the month of year. If omitted, the day is the day of year instead
   * of the day of month. 
   * @return {seasonOfYear} the season of year of the given julian date. The value is 1 based unlike in Date objects.
   */
  static fromJulianDate(day, year, month = undefined) {
    const isJulianLeapYear = (y) => (y % 4 == 0);

    const dayDiff = 7 - 12 + 3 + Math.floor((year) / 100) - Math.floor((year) / 400);
    let dayOfYear = (month == null ? 0 : (month < 2 ? 0 : daysOfYears[month - 2])) - dayDiff;
    // Update the first day of year  of a month
    if (isJulianLeapYear(year) && (dayOfYear > daysOfYears[1])) {
      dayOfYear++;
    }
    dayOfYear += day;
    // Changing the leap day back to get day of a normal year
    if (isJulianLeapYear(year) && (dayOfYear > daysOfYears[1])) {
      dayOfYear--;
    }
    // Normalizing the day of year
    let amount = 0;
    while (dayOfYear < 0) {
      year--;
      amount = 365 + (isLeapYear(year) ? 1 : 0);
      dayOfYear += amount;
    }
    while (dayOfYear > (amount = 365 + (isLeapYear(year) ? 1 : 0))) {
      dayOfYear -= amount;
      year++;
    }

    // Calculating the season of the day of year of the current year.
    let baseSeason = daysOfYearsOfSeasons.findIndex((v) => (dayOfYear <= v));
    if (baseSeason <= 0) {
      if (baseSeason == 0) {
        year--;
      }
      baseSeason += 4;
    }
    return new seasonOfYear(year, baseSeason);
  }

  /**
   * Convert a Date into its season of year.
   * @param {Date} other The date donverted into its season of year.
   * @returns {seasonOfYear} The season of a hermetic year into which the date belongs 
   */
  static fromDate(other) {
    // Get the day of year
    let year = other.getFullYear();
    let dayOfYear = other.getDate() + daysOfYears[other.getMonth()];
    if (isLeapYear(year) && dayOfYear > daysOfYears[1]) {
      // Add leap day to dates following it
      dayOfYear++;
    }
    if (isLeapYear(year) && dayOfYear > daysOfYears[1]) {
      // Remove leap day
      dayOfYear--;
    }
    let quarter = daysOfYearsOfSeasons.findIndex((v) => (dayOfYear <= v));
    if (quarter < 0) {
      quarter = 4;
    } else if (quarter == 0) {
      year--;
      quarter += 4;
    }
    return new seasonOfYear(year, quarter);
  }

  /** Compares the current season of yeat
   * with given value.
   * @param {string|Date|Season|saesonOfYear} other The value the season of year is compared with.
   * @returns {number?} The comparison result, if the other was valid. Otherwise, qn  undefined value
   */
  compare(other) {
    let target = {
      year: undefined,
      season: undefined
    };
    let result = undefined;
    switch (typeof other) {
      case "string":
        target = this.constructor.parse(other);
        if (target == null) {
          return result;
        } else if (target.year != null) {
          result = this.year - target.year;
        }
        if (result == null || result === 0) {
          result = this.season - target.season;
        }
        return result;
      case "object":
        if (other instanceof Date) {
          const date = this.constructor.fromDate(other);

          result = this.year - date.year;
          if (result === 0) {
            result = this.season - date.season;
          }
        } else if (other instanceof seasonOfYear) {
          result = this.year - other.year;
          if (result === 0) {
            result = this.season.compare(other.season);
          }
        } else if (other instanceof Season) {
          result = this.season.compare(other);
        }
      // eslint-disable-next-line no-fallthrough
      default:
        return result;

    }
  }

  /**
   * Parse a string repeesentation
   * to its date of year.
   * @param {string} rep the converted string.
   * @returns {seasonOfYear?} the season of year the given string represents. An undefined value on error.
   */
  static parse(rep) {
    if (rep) {
      const asStr = "" + rep;
      const regex = new RegExp("^(?<season>\\p{Lu}\\p{Ll}+)\\s*(?<year>\\d+)$", "u");
      const match = regex.exec(asStr);
      if (match) {
        let quarter = seasons.from(match.groups["season"]);
        let year = Number.parseInt(match.groups["year"]);
        return new seasonOfYear(year, quarter);
      } else {
        return undefined;
      }
    }
    return undefined;
  }

  toString() {
    return `${this.season} ${this.year}`
  }
}

const yearRegex = createYearRegex();

function createYearRegex(max = null, min = 1, requireEra = false) {
  return `(?<year>\\d{${min},${max == null ? "" : max}})(?<era>AD|BC)${requireEra ? "" : "?"}`;
}

/**
 * Parse season from Julian date string.
 * @param {string} str The Julian date string.
 * @returns {seasonOfYear?} The season of year parsed from the string.
 */
function parseJulianDate(str) {
  let result = undefined;
  [
    new RegExp("^(?<day>\\d{1,2}))\\(?:\\.(?<month>1?\\d))?\\." + yearRegex + "$"),
    new RegExp("^(?<month>1?\\d)/" + yearRegex + "$"),
    new RegExp("^" + createYearRegex(null, null, true) + "/" +
      "(?<month>1?\\d)$")
  ].forEach(
    (pattern) => {
      if (result) { return; }
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
  );
  return result;
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

  /**
   * Create a new entry.
   * @param {string} title The title of the entry.
   * @param {string|number|seasonOfYear|JulianDate|DateMap} date The date of the event. 
   * @param {string} desc The description of the entry. 
   * @param {string} [id] The unique identifier of the entry. 
   */
  constructor(title, date, desc, id = undefined) {
    this.title = title;
    this.date = (Number.isInteger(date) ? date : (date instanceof seasonOfYear || date instanceof JulianDate) ? date
      : this.constructor.parseDate(date));
    this.description = desc;
    this.id = id;
  }


  /**
   * Parse a date of the calendar.
   * @param {string} str The parsed season or string.
   * @returns {number|seasonOfYear|JulianDate|undefined} The parsed date.
   */
  static parseDate(str) {
    return Number.isInteger(Number.parseInt(str)) ? Number.parseInt(str) : (Season.parse(str) || parseJulianDate(str));
  }

}

/**
 * Class representing history.
 */
export class History {

  /**
   * 
   * @param {HistoryParam} param0 
   */
  constructor({ entries, currentYear = 1220 }) {
    this.currentYear = currentYear;
    this.entries = (entries instanceof History ? entries.entries
      : (entries instanceof Array && entries.every(entry => entry instanceof Entry)) ? entries : []);
  }


  /**
   * Get the current entries.
   * @type {Array<Entry>} The list of entries, which has already happened.
   */
  get currentEntries() {
    return this.entries.filter(entry => {
      switch (typeof entry.date) {
        case "number":
          // Year.
          return entry.date < this.currentYear;
        case "object":
          if (entry.date instanceof seasonOfYear) {
            return entry.date.year < this.currentYear;
          } else if (entry.date instanceof JulianDate) {
            return entry.date.year < this.currentYear;
          }
        // eslint-disable-next-line no-fallthrough
        default:
          return false;
      }
    })
  }

}

/**
 * The package containing history related methods.
 * @package module.history.js
 */



