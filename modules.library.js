
import { compare, numberAsOrdinalText, toOrdinal } from "./module.utils";
import { HermeticRecknoning } from "./modules.temporal";

/**
 * @inheritdoc
 * @typedef {import("./module.utils").ComparisonResult} ComparisonResult
 */


/**
 * The options of the calendar used.
 * @typedef {Object} ReckoningOptions
 * @property {boolean} [ariesian=false] Is the date in Ariesian recknoing..
 * @property {boolean} [julian=false] Is the date in Julian reckoning.
 * @property {boolean} [startOfYear=1] The start of year as day of year of the reckoning.
 */


/**
 * The names of the Zodiac calendar months starting from the Spring equinox.
 */
const ariesianMonthNames = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];


/**
 * The ariesian year monhts.
 */
const ariesianMonths = [
  19 + 31 - 21 + 1, // Aries
  20 + 30 - 20 + 1, // Taurus
  20 + 31 - 21 + 1, // Gemini
  22 + 30 - 21 + 1, // Cancer
  22 + 31 - 23 + 1, // Leo
  22 + 31 - 23 + 1, // Virgo
  22 + 30 - 23 + 1, // Libra
  21 + 31 - 23 + 1, // Scorpius
  21 + 30 - 22 + 1, // Sagittarius
  19 + 31 - 22 + 1, // Capricorn
  18 + 28 - 20 + 1, // Aquarius
  20 + 31 - 19 + 1 // Pisces

].map(
  (daysOfMonth, index) => (createMonth(ariesianMonthNames[index], index + 1, daysOfMonth))
);

/**
 * Ariesian leap year months.
 */
const ariesianLeapMonths = HermeticRecknoning.monthsOfYears.leap;
/**
 * Is the year Gregorian leap year.
 * @param {number} year The year.
 * @returns {boolean} True, if and only if the year is Gregorian leap year.
 */
export function gregorianLeapYear(year) {
  return (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0));
}

/**
 * Is the year Julian leap year.
 * @param {number} year The year.
 * @returns {boolean} True, if and only if the year is Julian leap year.
 */
export function julianLeapYear(year) {
  return (year % 4 === 0);
}

/**
 * Create a new year.
 * @param {number} year The canonical year of the reckoning.
 * @param {ReckoningOptions} [options] The reckoning options. 
 * @returns {Year} The year created with given year.
 */
export function createYear(year, options = {}) {

  if (options.ariesian) {
    const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    const ages = signs.reduce((result, sign) => {
      var length = 1;
      var candidate = `A.${sign.substring(0, length)}.`;
      while (result.includes(candidate)) {
        length++;
        candidate = `A.${sign.substring(0, length)}.`;
      }
      result.push(candidate);
    }, []);
    const hermeticEraIndex = Math.floor((year - 1) / 2150);
    if (hermeticEraIndex < -6 || hermeticEraIndex > ages.length - 6) {
      throw new SyntaxError("Invalid canonical year of Hermetic calendar");
    }

    return {
      get era() {
        return (hermeticEraIndex > 0 ? ages[ages.length - hermeticEraIndex] : ages[-hermeticEraIndex]);
      },
      get year() {
        return year - (hermeticEraIndex * 2150);
      },
      get reckoning() {
        return "Ariesian";
      },
      get isLeapYear() {
        return gregorianLeapYear(this.valueOf() + 1);
      },
      getMonth(month) {
        if (month < 1 || month > 12) {
          throw new SyntaxError("Invalid month");
        } else {
          return (this.isLeapYear ? gregorianLeapMonths[month - 1] : gregorianMonths[month - 1]);
        }
      },
      toString() {
        return `${this.year}${this.era}`;
      },
      valueOf() {
        return year + 139;
      }
    };
  } else {
    // Gregorian and julian years does not differ enough to have any effect.
    return {
      get era() {
        return year < 1 ? "B.C." : "A.D.";
      },
      get year() {
        if (year < 1 ? 1 - year : year);
      },
      /**
       * Is the year leap year.
       * @return {boolean} True, if and only if the year is leap year.
       */
      get isLeapYear() {
        switch (this.reckoning) {
          case "Julian":
            return julianLeapYear(year);
          case "Gregorian":
          case undefined:
            return gregorianLeapYear(year);
        }
      },
      getMonth(month) {
        if (month < 1 || month > 12) {
          throw new SyntaxError("Invalid month");
        } else {
          return (this.isLeapYear ? gregorianLeapMonths[month - 1] : gregorianMonths[month - 1]);
        }
      },
      get reckoning() {
        return options.julian ? "Julian" : "Gregorian";
      },
      toString() {
        return `${this.year}${this.era}`;
      },
      valueOf() {
        return year;
      }
    };
  }
}

/**
 * Convert a year to different reckoning.
 * @param {Year} year The converted year.
 * @param {ReckoningOptions} [options] The reckoning options of the conversion result.
 * @returns {Year} The converted season of year.
 */
export function convertYear(year, options = {}) {
  switch (year.reckoning) {
    case "Ariesian":
      return createYear(year.valueOf() + (options.ariesian ? 0 : -139), options);
    case "Julian":
    case undefined:
    case "Gregorian":
      return createYear(year.valueOf() + (options.ariesian ? 139 : 0), options);
    default:
      throw new SyntaxError("Unrecognized Reckoning");
  }
}


/**
 * The season of year.
 * @typedef {"Spring"|"Summer"|"Autumn"|"Winter"} Season
 */

/**
 * The seasons of year in order from Spring equinox.
 * @type {Season[]}
 */
const seasonsOfYear = ["Spring", "Summer", "Autumn", "Winter"];

/**
 * The type of a season.
 * @typedef {Object} SeasonOfYear
 * @property {Year} year The year.
 * @property {Season} season The season of year.
 * @property {(brief=false) => string} toString Convert the season to string.
 */

/**
 * Create a season.
 * @param {Year} year The year of the season.
 * @param {Season|string|number} season The season. 
 * @returns {SeasonOfYear} The season.
 */
export function createSeasonOfYear(year, season) {
  if (year == null) {
    throw new SyntaxError("Cannot create season of year without year");
  }

  switch (typeof season) {
    case "number":
      return {
        year,
        season: seasonsOfYear[season],
        toString(brief = false) {
          if (brief) {
            return `${this.season.substring(0, 2)}${this.year.toString()}`;
          } else {
            return `${this.season} ${this.year.toString()}`
          }
        }
      };
    case "string":
      if (seasonsOfYear.includes(season)) {
        return {
          year,
          season,
          toString(brief = false) {
            if (brief) {
              return `${this.season.substring(0, 2)}${this.year.toString()}`;
            } else {
              return `${this.season} ${this.year.toString()}`
            }
          }
        }
      } else if (seasonsOfYear.find(cursor => (cursor.substring(0, 2) === season))) {
        // Abbreviated season
        const actualSeason = seasonsOfYear.find(cursor => (cursor.substring(0, 2) === season));
        return {
          year,
          season: actualSeason,
          toString(brief = false) {
            if (brief) {
              return `${this.season.substring(0, 2)}${this.year.toString()}`;
            } else {
              return `${this.season} ${this.year.toString()}`
            }
          }
        };
      }
    default:
      throw new SyntaxError("Invalid season");
  }
}

/**
 * Comparision of seasons.
 * @param {Season} compared The compared season.
 * @param {Season} comparee The season compared with.
 * @returns {ComparisonResult} The comparison result.
 */
export function compareSeason(compared, comparee) {
  const comparedKey = seasonsOfYear.indexOf(compared);
  const compareeKey = seasonsOfYear.indexOf(comparee);
  if (comparedKey < 0) return undefined;
  if (compareeKey < 0) return undefined;
  return (comparedKey < compareeKey ? -1 : comparedKey > compareeKey ? 1 : 0);
}



/**
 * Compare seasons of year.
 * @param {SeasonOfYear} compared The compared season of year.
 * @param {SeasonOfYear} comparee The season of year compared with.
 * @returns {ComparisonResult} The comparison result.
 */
export function compareSeasonsOfYear(compared, comparee) {
  var result = compare(compared.year.valueOf(), comparee.year.valueOf());
  if (result === 0) {
    result = compareSeason(compared.season, comparee.season);
  }
  return result;
}


/**
 * The month of year.
 * @typedef {Object} MonthOfYear
 * @property {Readonly<Year>} year The year.
 * @property {Readonly<number>} month The month of year starting with index of 1.
 * @property {Readonly<number>} daysOfMonth The number of days in the month.
 * @property {() => string} toString Convert the month of year into string.
 */

/**
 * Create a month of a year.
 * @param {Year} year The year.
 * @param {Month|number} month The month. 
 */
export function createMonthOfYear(year, month) {
  return {
    year,
    month: (typeof month === "number" ? year.getMonth(month) : month),
    toString(mode = undefined) {
      switch (mode) {
        case "brief":
          return `${this.month.valueOf()}.${this.year.toString()}`;
        case "short":
          return `${this.month.toString(mode)} ${this.year.toString(mode)}`;
        case "long":
        default:
          return `${this.month.toString()} ${this.year.toString()}`;
      }
    }
  };
}

/**
 * The day of month.
 * @typedef {Object} DayOfMonth
 * @property {number|Month|MonthOfYear} month The month of day.
 * @property {Readonly<number>} day The day of month.
 * @property {() => string} toString Convert the day of month into string.
 */

/**
 * Create a day of month.
 * @param {number|MonthOfYear} month The month of the day.
 * @param {number} day The day of month. 
 * @returns {DayOfMonth}
 */
export function createDayOfMonth(month, day) {
  switch (typeof month) {
    case "number":
      if (month < 1 || month > 12) {
        throw new SyntaxError("Invalid month");
      } else {
        return {
          get month() {
            return gregorianMonths[month - 1];
          },
          get day() {
            return day;
          },
          toString() {
            return `${toOrdinal(this.day)} of ${this.month.toString()}`
          }
        }
      }
    case "object":
      if (["year", "month"].every(prop => (prop in month))) {
        if (day < 0 || day >= month.daysOfMonth) {
          throw new SyntaxError("Invalid day of month for the month");
        }
        return {
          month,
          day,
          toString() {
            `${toOrdinal(this.day)} of ${this.month.toString()}`
          }
        }
      }
    default:
      throw new SyntaxError("Invalid month for day of month");
  }
}

/**
 * The day of month of a year is a day of month ensuring the month is month of year.
 * @typedef {Omit<DayOfMonth, "month"> & {month: MonthOfYear}} DayOfMonthOfYear
 */

/**
 * Create day of month of a year.
 * @param {MonthOfYear} month The month of year.
 * @param {number} dayOfMonth The day of month. 
 * @returns {DayOfMonthOfYear} The day of month of year.
 */
export function createDayOfMonthOfYear(month, dayOfMonth) {
  return createDayOfMonth(month, dayOfMonth);
}

/**
 * Create a day temporal.
 * @param {number} day The day.
 * @returns {Day} The day object created from the day.
 * @throws {SyntaxError} The day was invalid.
 */
export function createDay(day) {
  if (!Number.isSafeInteger(day)) {
    throw new SyntaxError("Invalid day - not a number");
  }

  return {
    day,
    valueOf() {
      return this.day;
    },
    toString(mode = undefined) {
      switch (mode) {
        case "brief": 
          return `${this.valueOf()}`;
        case "long":
          return `${numberAsOrdinalText(this.valueOf())}`;
        case "short":
        default:
            return `${toOrdinal(this.valueOf())}`;
      }
    }
  };
}

/**
 * Create a day of year.
 * @param {*} year 
 * @param {number|Day} dayOfYear The day of year. 
 */
export function createDayOfYear(year, dayOfYear) {
  if (dayOfYear < 1 || dayOfYear > (year.isLeapYear ? 366 : 365)) {
    throw new SyntaxError("Invalid day of year");
  }
  return {
    year,
    dayOfYear,
    valueOf() {
      return dayOfYear;
    },
    toString(mode = undefined) {
      switch (mode) {
        case "brief":
          return `${this.dayOfYear}.${this.year.toString()}`
        case "short":
        case "long":
        default:
          return `${toOrdinal(this.dayOfYear)} of ${this.year.toString(mode)}`
      }
    }
  };
}

/**
 * The event of history.
 * @typedef {Object} HistoryEvent
 * @property {string} title The title of the event.
 * @property {string} type The type of the event.
 * @property {Date|DayOfMonthOfYear|SeasonOfYear|MonthOfYear|Year} [start] The starting time of the event.
 * @property {Date|DayOfMonthOfYear|SeasonOfYear|MonthOfYear|Year} [end] The end of the event. Defaults to the 
 * end of the period start indicates. 
 */

/**
 * The temporal value. 
 * @typedef {Day|Month|Year|MonthOfYear|DayOfYear|DayOfMonthOfYear|DayOfMonth} Temporal
 */

/**
 * Get a temporal value of the given value.
 * @param {Date|Temporal|string|number} value The value converted to a temporal.
 * @param {TemporalOptions} [options] The temporal options. 
 * @returns {Temporal} The temporal derived from the value.
 * @throws {SyntaxError} The value was not a proper source of temporal value.
 */
export function getTemporal(value, options = {}) {
  if (value instanceof Date) {
    // The old date.
    const epochDay = value.getTime();
    return createArsTemporal(options);
  } else {
    switch (typeof options) {
      case "number":
      case "string":
      case "object":
        if ("recknoning" in value && value.reckoning !== "Gregorian") {
          // The day has reckoning. 
        } else if ("year" in value) {
          if ("month" in value) {
            const monthOfYear = createMonthOfYear(value.year, value.month);
            if ("day" in value) {
              return createDayOfMonthOfYear(monthOfYear, value.day);
            } else {
              return monthOfYear;
            }
          } else if ("day" in value) {
            return createDayOfYear(value.year, value.day);
          } else {
            return createYear(value.year);
          }
        } else if ("month" in value) {

        } else if ("day" in value) {
          // Just day.
          return createDay(value.day);
        }
      default:
        throw new SyntaxError("Invalid temporal value");
    }
  }
}


/**
 * Create a history event model.
 * @param {string} title The title of the event.
 * @param {Date|DayOfMonthOfYear|SeasonOfYear|MonthOfYear|Year} start The start of the event. 
 * @param {Date|DayOfMonthOfYear|SeasonOfYear|MonthOfYear|Year} [end] The end of the event.
 * @returns {HistoryEvent}
 */
export function createHistoryEvent(title, start, end = undefined) {


  return {
    title,
    start: getTemporal(start),
    end: end === undefined ? getEndOfPeriod(start) : end
  }
}

/**
 * The library history model.
 * @typedef {Object} LibraryHistory
 * @property {string} [title] The title of the history.
 * @property {HistoryEvent[]} [events=[]] The events of the history.
 */



/**
 * A simple field definition 
 * @typedef {Object} BasicFieldDef
 * @property {string} name The field name.
 * @property {string} [title] The title of the property, if any.
 * @property {FieldDef} type The type of the property.
 * - Array inficates list of possible types.
 * - FieldDef is the definition of the field.
 * - String is the name of the type.
 * @property {string} [target] The target of the type.
 * @property {FieldDef} [entry] The  type of the entries of the type.
 */

/**
 * The field definition.
 * @typedef {BasicFieldDef|string|FieldDef[]} FieldDef
 */


/**
 * The common properties of the library models.
 * @typedef {Object} CommonProps
 * @property {string} [title] The title of the item.
 * @property {string} [id] The unique  reference identifier.
 * @property {string} [description] The description of the object.
 */

/**
 * The author properties.
 * @typedef {Object} AuthorProps
 * @property {string} [author] The author of the book.
 * @property {string} [authorRef] The referenxe to the author id.
 */
/**
 * The properties defining the language used.
 * @typedef {Object} LanguageProps
 * @property {string} [lang] The language used 
 * @property {string} [alphabet] The script used.
 * @property {string} [langSpeciality] The language speciality. 
 */

/**
 * The content properties.
 * @typedef {Object} ContentProps
 * @property {number} [quality] The study quality of the content.
 * @property {number} [level] The target level of the content
 * @property {string} [spellName] The name of the spell. 
 * @property {string} [spellRef] The reference to the spell.
 * @property {string} [itemRef] The reference to the item.
 */

/**
 * Quality related field definitions.
 * @type {FieldDef[]}
 */
export const qualityFields = [
  { name: "quality", title: "Quality", type: "integer" }
];
/**
 * Level related field definitions.
 * @type {FieldDef[]}
 */
export const levelFields = [
  { name: "level", title: "Level", type: "integer" }
];
export const spellLabtext = [
  { name: "spellName", title: "Spell", type: "string" }
];
export const itemLabtext = [
  { name: "spellRef", title: undefined, type: "ref", target: "spell" },
  { name: "options", title: "Item Options", type: "list", entry: "itemModifier" },
  { name: "itemRef", title: undefined, type: "ref", target: "item" }
];

/**
 * The common field definitions.
 * @type {FieldDef[]}
 */
export const commonFieldDefs = [
  { name: "title", title: "Title", type: "string" },
  { name: "description", title: "Description", type: "string" },
  { name: "id", title: "Id", type: "hidden", entry: "string" }
];
/**
 * The language field definition.
 * @type {FieldDef[]}
 */
export const langFieldDefs = [
  { name: "lang", title: "Language", type: "string" },
  { name: "alphabet", title: "Alphabet", type: "string" },
  { name: "langSpec", title: "Speciality", type: "string" }
];
/**
 * The content field definition.
 * @type {FieldDef[]}
 */
export const contentFieldDefs = [
  {
    name: "contentType",
    title: "Type",
    type: [
      {
        name: "tractatus",
        title: "Tractatus",
        type: [
          ...qualityFields
        ]
      },
      {
        "name": "summa",
        title: "Summa",
        type: [
          ...levelFields,
          ...qualityFields
        ]
      }
    ]
  }
];


/**
 * @typedef {Object} BookProps
 * @property {ContentModel[]} contents The contents of the book.
 */

/**
 * The book model.
 * @typedef {CommonProps & LanguageProps & BookProps} BookModel
 */

/**
 * The content model.
 * @typedef {CommonProps & LanguageProps & ContentProps} ContentModel
 */

/**
 * @typedef {Object} CollectionProps
 * @property {BookModel[]} books The books of the collection.
 * @property {ContentModel[]} contents Yhe contents of the collection.
 */

/**
 * The collection model.
 * @typedef {CommonProps & CollectionProps} CollectionModel
 */


/**
 * @typedef {Object} LibraryProps
 * @property {CollectionModel[]} collections The collections of the library.
 * @property {BookModel[]} books The books of the collection.
 * @property {ContentModel[]} contents Yhe contents of the library.
 */

/**
 * @typedef {CommonProps & LibraryProps} LibraryModel
 * 
 */

/**
 * Get default alphabet.
 * @param {string} lang The language.
 * @param {string} [dialect] The dialect of the language.
 */
export function getDefaultAlphabet(lang, dialect = null) {
  switch (lang) {
    case 'Arabic':
    case "Latin":
    case "Greek":
      return lang;
    case "West Slavonic":
      return "Latin";
    case "East Slavonic": 0
    case "South Slavonic":
      return "Glacolitic";
    default:
      return "Latin";
  }
}

/**
 * Get well defined language props.
 * @param {LanguageProps} props
 * @return {Required<Pick<LanguageProps,("lang"|"alphabet">)>> & Omit<LanguageProps,("lang"|"alphabet">)}
 */
export function getLanguage(props) {
  const lang = props.lang || "Latin";
  const alphabet = props.alphabet || getDefaultAlphabet(lang);
  const langSpeciality = props.langSpeciality;
  return { lang, alphabet, langSpeciality };
}

/**
 * Create a tractatus book.
 * @returns {BookModel}
 */
export function TractatusModel(props) {
  if (props.contents.length != 1) {
    throw Error(`Invalid number of contents`);
  }
  const { lang, alphabet, langSpeciality } = getLanguage(props);
  const result = /** @type {BookModel} */ {
    title: props.title,
    author: props.author,
    authorRef: props.authorRef,
    contents: [],
    lang,
    alphabet,
    langSpeciality
  };
  /**
   * @type {ContentModel}
   */
  const content = {
    lang,
    alphabet,
    langSpeciality,
    ...props.contents[0]
  };
  [
    ["lang", new Error("Invalid language")],
    ["alphabet", new Error("Invalid alphabet")]
  ].forEach(([prop, error]) => {
    if (content[prop] !== result[prop]) {
      throw error;
    }
  });
  result.contents.push(content);
  return result;
}