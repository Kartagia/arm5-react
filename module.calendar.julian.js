
import { Calendar, CalendarField } from "./module.calendar.common.js";

/**
 * A calendar implementing Julian Calendar. 
 */
export class JulianCalendar extends Calendar {

  static getSupportedFields() {
    const map = new Map();
    map.put("Day", new CalendarField("Day", 1, 1, 31));
    map.put("Month", new CalendarField("Month", 1, 1, 12));
    map.put("Year", new CalendarField("Year", 1));
    map.put("MonthOfYear", new CalendarField("MonthOfYear", 2, 1, 12, map.get("Year")));
    const MonthsOfYears =
      [["January", 1, 31], ["Feburuary", 1, 29], ["March", 1, 31],
      ["April", 1, 30], ["May", 1, 31], ["June", 1, 30],
      ["July", 1, 31], ["August", 1, 31], ["September", 30],
      ["October", 31], ["November", 1, 30], ["December", 1, 31]];
    MonthsOfYears.forEach((monthDef, index) => {
      map.put(`MonthOfYear:${monthDef[0]}`, new CalendarField(monthDef[0], 1,
        [undefined, index + 1], [undefined, index + 1], map.get("Year")))
    });
    map.put(new CalendarField("Year:leapYear", 1));
    return map;
  }

  constructor(startOfYear = { day: 1, month: 1 }) {
    super(JulianCalendar.getSupportedFields());
    this.startOfYear = startOfYear;
  }
}

export default JulianCalendar;