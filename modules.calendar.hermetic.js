

/**
 * The module implementing Hermetic Calendar with each year stating from March equinox
 * on Gregorian 21st of March.
 * 
 * @module calendar.hermetic
 */

import { GregorianCalendar } from './modules.calendar.gregorian.js';

/**
 * The Hermetic Calendar using Zodiac Months starting from Aries, and due that the 
 * years are called Anno Aries.
 * 
 * The calendar reckoning starts from 138BC.
 */
export class HermeticCalendar {

  /**
   * The mapping from year types to the days of months of each month.
   */
  static daysOfMonthsOfYears = {
    normal: [0],
    leap: [0]
  }

  /**
   * The mapping from year types to the last day of year for each month of the year.
   * @type {Object.<string, Array<number>>}
   */
  static daysOfYearsOfMonths = [Object.entries(this.daysOfMonths)].reduce(
    (resultObject, [key, daysOfMonths]) => {
      resultObject[key] = daysOfMonths.reduce(
        (result, daysOfMonth) => {
          result.push((result.length ? result[result.length - 1] : 0) + daysOfMonth);
          return result;
        },
        []);
      return resultObject;
    }, {}
  );


  constructor(startOfYear = { day: 1, month: 1 }) {
    this.startOfYear = startOfYear;
    this.startOfGregorianYear = GregorianCalendar.fromDayOfYear({ day: 21, month: 3 }, { lenient: true });
  }

  /**
   * The day sof years of the months.
   * @type {Object.<string, Array<number>>}
   */
  get daysOfYearsOfMonths() {
    return HermeticCalendar.daysOfYearsOfMonths;
  }

  /**
   * Get the day of year for given date.
   * @param {number} year The canonical year.
   * @param {number} month The month of year starting with 1 or January.
   * @param {number} day The day of month.  
   * @returns {number?} The day of year for the given date. 
   */
  getDayOfYear(year, month, day) {
    if (month < 0 || month >= 12) return undefined;
    const daysOfYearsOfMonths = this.daysOfYearsOfMonths[(this.isLeapYear(year) ? "leap" : "normal")];
    const result = daysOfYearsOfMonths[month - 1] + day;
    if (result < 1 || result > daysOfYearsOfMonths[12]) {
      return undefined;
    } else {
      return result;
    }
  }

  /**
   * Is the given year of aries leap year.
   * @param {number} year The canonical year of Aries.
   * @returns {boolean} True, if and only if the year is leap eyar.
   */
  isLeapYear(year) {
    const gregorianYear = year - 139;
    return ((gregorianYear - 1) % 4 == 0) && ((gregorianYear - 1) % 100 !== 0 || (gregorianYear - 1) % 400 === 0);
  }

}


export default HermeticCalendar;