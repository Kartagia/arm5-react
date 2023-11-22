/**
 * Library tools.
 *  
 * @module 
 */

import { initializeApp } from "firebase/app";
import { getDatabase, ref as getRef, set as setRecord, child as getChild, push as pushRecord, onValue as listenDbChange } from "firebase/database";
import { getDatabaseUrl } from ".env.db.js";
import JsonMap from "./module.JsonMap";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  // ...
  // The value of `databaseURL` depends on the location of the database - insert your own database url here
  databaseURL: getDatabaseUrl()
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

/**
 * @template TYPE
 * A POJO with all own property keys containing value of {@link TYPE}
 * @typedef {Object.<string, TYPE>} POJODict
 * 
 */

/**
 * The book content type.
 * @typedef {TitleData & Object} BookContent
 * @property {BookContentType} type
 * @property {number} [quality]
 * @property {number} [level]
 */

/**
 * @typedef {Object} BookQuality
 * @property {string} type The type of the quality.
 * @property {string} caption The caprion of the quality.
 * @property {number} modifier The modifier of thr quality.
 */

/**
 * A book represents single copy
 * of a book.
 * @typedef {TitleData & Object} Book
 * @property {Array<BookContent>} [contents] The book contents.
 * @property {Array<BookQuality>} [qualities] The booknquality modifiers.
 * @property {History} [history] The book history.
 */

/**
 * The title status.
 * @typedef {Object} TitleData
 * @property { string } [title] 
 * @property { string } [author]
 */

/**
 * The book status.
 * @typedef {Object} BookStatus
 * @property {BookStatuses} [bookStatus='Available'] The book status.
 * @property {string} [location] 
 */

/**
 * The list of book statuses.
 * @enum {string} BookStatuses
 */
export const BookStatuses = ["Promised", "Planned", "Written", "Illuminated", "Bound", "Available", "Repaired", "Borrowed", "Lost"].map((entry) => {
  const result = {};
  result[entry] = entry;
  return result;
});
BookStatuses.freeze();

/**
 * The book history.
 * @typedef {Object} History
 * @property {Entry[]} [history=[]] The history entries.
 */

/**
 * The book types.
 * 
 * @enum {string} BookType
 */
export const BookType = {
  Summa: "Summa",
  Tractatus: "Tractatus",
  Commentary: "Commentary",
  Folio: "Folio",
  values() {
    return Object.getOwnPropertyNames(this).filter((value) => (typeof value === "string"));
  },
  parse(str) {
    return this.values().find((value) => (value === str));
  }
};
BookType.freeze();

/**
 * The content types.
 * @enum {string} BookContentType
 * 
 */
export const BookContentType = {
  Summa: {
    caption: "Summa",
    quality: true,
    level: true,
    toString() {
      return this.caption;
    },
    toJSON() {
      return this.toString()
    }
  },
  Tractatus: {
    caption: "Tractatus",
    quality: true,
    toString() {
      return this.caption;
    },
    toJSON() {
      return this.toString()
    }
  },
  values() {
    return Object.getOwnPropertyNames(this).filter((value) => (typeof value === "object" && !(value instanceof Function)));
  },
  parse(str) {
    return this.values().find((value) => (value.toString() === str));
  }
}
BookContentType.freeze();


/**
 * The book instance.
 * @constructor
 * @extends {Book}
 * @returns {Book}
 */
function BookModel(options) {
  return {
    title: options.title,
    author: options.author,
    content: options.content || [],
    type: options.type || BookType.Tractatus,
    qualities: options.qualities || [],
    history: options.history || [],
    getQualityTotal(...types) {
      return this.qualities.filter((mod) => (types.length === 0 || types.find((type) => (type === undefined || mod.type === type)) != null)).reduce((result, value) => {
        result.modifier += value.modifier;
        return result;
      }, { modifier: 0, xp: 0 }).modifier;
    },
    totalQuality() {
      return this.getQualityTotal(undefined)
    },
    physicalQuality() {
      return this.getQualityTotal("Physical")
    },
    contentQuality() {
      return this.getQualityTotal("Content")
    }
  };
}



/**
 * The storage of books
 * @typedef {Map<string, Book>|POJODict<Book>} Books
 */

/**
 * The storage of book contents
 * @typedef {Map<string, BookContent>|POJODict<BookContent>} BookContents
 */

/**
 * The storage of book collections
 * @typedef {Map<string, BookCollection>|POJODict<BookCollection>} Books
 */


/**
 * The library data structure
 */
const library = {
  sagas: new Map(),
  library: new Library(),
  listeners: []
}

/**
 * Add library change listener.
 * @param {LibraryChangeListener} listener 
 * @returns {boolean} True, if and only if the listener was added.
 */
export function addLibraryChangeListener(listener) {
  if (listener instanceof Function && listener.find((value) => (value === listener)) == null) {
    // No listener was found - we can add the listener to the set of listeners.
    library.listeners.push(listener);
    console.log(`Added library listener ${listener}`);
    return true;
  } else {
    console.log("Failed to add non-function listener");
    return false;
  }
}

/**
 * Remove library change listener.
 * @param {LibraryChangeListener} listener 
 * @returns {boolean} True, if and only if the listener was removed.
 */
export function removeLibraryChangeListener(listener) {
  if (listener instanceof Function) {
    const index = listener.findIndex((value) => (value === listener));
    if (index >= 0) {
      // Deleting the found listener
      delete library.listeners[index];
      console.log(`Removed library change listener ${listener}`);
      return true;
    } else {
      // LIstener not found.
      console.log(`Could not remove non-existing library chagne listener ${listener}`);
      return false;
    }
  } else {
    console.log("Failed to remove non-function listener");
    return false;
  }
}

/**
 * The object handling the library change.
 * @callback LibraryChangeHandler
 * @param {Change<Library|BookCollections|Books|BookContents>} event The handled change.
 */

/**
 * The object handling library changes.
 * @typedef {Object} LibraryChangeListenerObject
 * @property {LibraryChangeHandler} handler The handler function handling the event. 
 * @property {Predicate<Change<Library|BookCollections|BookCollection>>} [test] Test whether
 *  the handler handles the change.
 */

/**
 * @typedef {LibraryChangeHandler} LibraryChangeListener
 */

/**
 * The function determing the changes required to change source into target.
 * @template TYPE
 * @callback ChangeDiff
 * @param {TYPE} source The source of the changes.
 * @param {TYPE} target The target of the changes.
 * @param {Array<string>} [sourcePath] The path to the source. The last element should be the key.
 * @param {Array<string>} [targetPath] The path to the target. The last element should be the key.
 * @returns {Array<Change<TYPE>>} The changes required to alter the source into target.
 */

/**
 * @template TYPE
 * @type {ChangeDiff<TYPE>}
 */
function getBasicChanges(source, target, sourcePath = [], targetPath = []) {
  const sourceId = sourcePath.length === 0 ? null : sourcePath[sourcePath.length - 1];
  const sourceParent = sourcePath.slice(0, sourcePath.length - 1);
  const targetId = targetPath.length === 0 ? null : sourcePath[targetPath.length - 1];
  const targetParent = targetPath.slice(0, targetPath.length - 1);
  if (source == null) {
    // The change is adding the target.
    if (target == null) {
      return null;
    } else {
      // The change is adding the target.
      return [{ action: "add", target: [...targetParent], payload: { id: targetId, value: target } }];
    }
  } else if (target == null) {
    // The change is removing the source.
    return [{ action: "remove", target: [...sourceParent], payload: { id: sourceId } }];
  } else {
    // The change is removing source and adding the target.
    return [{ action: "update", target: [...sourcePath], payload: { path: targetPath, value: target } }];
  }
}

/**
 * @type {ChangeDiff<BookContent>}
 */
function getContentChanges(source, target, sourcePath = [], targetPath = []) {
  return getBasicChanges(source, target, sourcePath, targetPath);
}

/**
 * @type {ChangeDiff<BookCollection>}
 */
function getCollectionChanges(source, target, sourcePath = [], targetPath = []) {
  return getBasicChanges(source, target, sourcePath, targetPath);
}

/**
 * @type {ChangeDiff<Book>}
 */
function getBookChanges(source, target, sourcePath = [], targetPath = []) {
  return getBasicChanges(source, target, sourcePath, targetPath);
}


/**
 * Get changes.
 * @template TYPE
 * @param {Map<string, TYPE>|POJODict<TYPE>} source The source with which the target is compared.
 * @param {Map<string, TYPE>|POJODict<TYPE>} target The target of the comparison.
 * @param {Array<string>} [path=[]] The location of the changes as array of keys. 
 * @param {ChangeDiff<TYPE>} [createChange] The function determining the changes from TYPE source to TYPE target. 
 * @returns {Array<Change<TYPE>>} The list of changes creating target from source.
 */
function getListChanges(source, target, path = [], createChange = getBasicChanges) {
  const sourceGet = (source instanceof Map ? (key) => (source.get(key)) : (key) => (source[key]));
  const targetGet = (target instanceof Map ? (key) => (target.get(key)) : (key) => (target[key]));
  const sourceHas = (source instanceof Map ? (key) => (source.has(key)) : (key) => (source.find((e) => (e === key)) != null));
  const targetHas = (target instanceof Map ? (key) => (target.has(key)) : (key) => (target.find((e) => (e === key)) != null));
  const sourceKeys = (source instanceof Map ? source.keys() : Object.getOwnPropertyNames(source));
  const targetKeys = (target instanceof Map ? target.keys() : Object.getOwnPropertyNames(target));
  // Get updates and inserts.
  const result = targetKeys.reduce((result, key) => {
    if (sourceHas(key)) {
      // We have update from source to target
      result.get("updated").push({
        target: [...path, key], action: "update",
        payload: createChange(sourceGet(key), targetGet(key), [...path, key], [...path, key])
      })
    } else {
      // The key is added to the source.
      result.get("added").push({ target: [...path], action: "add", payload: { id: key, value: targetGet(key) } });
    }
  }, new JsonMap({ added: [], updated: [], removed: [] }));
  // Adding removals.
  result.get("removed").push(...(sourceKeys.filter((key) => (!targetHas(key)))));
  return result;
}
/**
 * Get changes required for converting source to target.
 * @param {BookCollections} source The source book collections.
 * @param {BookCollections} target The target book collections.
 * @returns {Array<Change<BookCollections|BookCollection>>} The changes required to 
 * change source to target.
 */
function getCollectionsChanges(source, target) {
  return getListChanges(source, target, ["collections"], getCollectionChanges)
}

/**
 * Get changes required for converting source to target.
 * @param {Books} source The source books.
 * @param {Books} target The target books.
 * @returns {Array<Change<Books|Book>>} The changes required to 
 * change source to target.
 */
function getBooksChanges(source, target) {
  return getListChanges(source, target, ["books"], getBookChanges)
}

/**
 * Get changes required for converting source to target.
 * @param {Books} source The source contents.
 * @param {Books} target The target contents.
 * @returns {Array<Change<BookContents|BookContent>>} The changes required to 
 * change source to target.
 */
function getContentsChanges(source, target) {
  return getListChanges(source, target, ["contents"], getContentChanges)
}

/**
 * Generate change list for the library. The changes are in the order
 * of execution - the adding of a branch precedes the adding of sub-branches,
 * and the removal of the branch supercedes the removal of the sub-branches.
 *
 * @param {Library} source The original library.
 * @param {Library} target The new library.
 * @returns {Array<Change>} The list of changes for the library. 
 */
function createLibraryChange(source, target, sourcePath = [], targetPath = []) {
  // Contents are added first and removed last.
  const result = [];
  // TODO: Create getStorageGetFunc method to deal with both cases.
  const sourceGet = (source instanceof Map ? (key) => (source.get(key)) : (key) => (source[key]));
  const targetGet = (target instanceof Map ? (key) => (target.get(key)) : (key) => (target[key]));

  // TODO: Replace section def list with method: getLibrarySectionsChangeDefinitions(library)
  // Adding first contents addition and update events, then books, then collections, and 
  // the removals of collections, removals of books, and removals of contents.
  result.push(...([["contents", getContentsChanges], ["books", getBooksChanges], ["collections", getCollectionsChanges]].reduce(
    (removesStack, sectionDef) => {
      const [section, changesGet] = sectionDef;
      const changes = changesGet(sourceGet(section), targetGet(section), sourcePath, targetPath);
      result.push(...(changes.get("added")));
      result.push(...(changes.get("updated")));
      removesStack.push([changes.get("removed")]);
      return removesStack;
    }, []
  )));
  // Return results.
  return result;
}

/**
 * Change library state and send library change notices to the listeners.
 * @param {Library} data The new library state. 
 * @param {string} [saga] The saga owning the library. 
 */
export function fireLibraryChange(data, saga = null) {
  // Determining the changed items. 
  const change = {
    target: ["library"]
  };
  if (saga == null) {
    // Updating the library.
    // Determinin the payload.
    change.payload = createLibraryChange(library.library, data);
  } else {
    // Updating the library of saga.
    if (library.sagas.has(saga)) {
      // Setting the change notice target to contain the saga before the library.
      change.target.unshift(["saga", saga]);
      change.payload = createLibraryChange(library.sagas.get(saga).library, data);
    } else {
      // No saga exists - we cannot update saga library before creating the saga.
      const msg = `Cannot fire change on a non-existing saga ${saga}`;
      console.error(msg);
      throw Error(msg);
    }
  }

  [...(library.listeners)].forEach((listener) => {
    if (listener.test == null || listener.test(change)) {
      listener.handle(change);
    }
  })
}

/**
 * Retriee the library fron the servare.
 */
export const fetchLibrary = (saga = null) => {
  const target = {

  };
  const fetchParam = {
    method: "GET",
    headers: {
      "Content-Type": "applicaton/json"
    }
  };
  if (saga) {
    target.url = getBasePath().append(`saga/${saga}/library.json`);
  } else {
    target.url = getBasePath().append("library.json");
  }
  fetch(target.url, fetchParam).then(
    (response) => {
      if (response.ok) {
        if (target.saga) {
          fireLibraryChange(response.json(), saga);
        } else {
          fireLibraryChange(response.json());
        }
      }
      console.log(`${target.saga == null ? "L" : `Saga[${target.saga}] l`}ibrary loaded.`);
    },
    (error) => {
      console.error(`Fetching ${target.saga == null ? "" : `Saga[${target.saga}]`} library failed: ${error.message}`);
    }
  );
}

/**
 * Pushes the library data into the database.
 */
export const pushLibrary = (saga = null) => {
  const target = {};
  const fetchParam = {
    method: "POST",
    headers: {
      "Content-Type": "applicaton/json"
    }
  };
  if (saga) {
    if (library.sagas.has(saga)) {
      // Setting the saga.
      fetchParam.body = JSON.stringify(library.sagas.get(saga));
      target.url = getBasePath().append(`saga/${saga}/library.json`)
      target.saga = saga;
    } else {
      // Removing the saga.
      fetchParam.method = "DELETE";
      target.url = getBasePath().append(`library.json`)
    }

    if (target.url) {
      fetch(target.url, fetchParam).then(
        () => {
          // The operation succeeded.
          console.log(`${target.saga == null ? "L" : `Saga[${target.saga}.l`}ibrary updated`);
        }
      ).catch(
        (error) => {
          // The operation failed.
          console.error(`${target.saga == null ? "L" : `Saga[${target.saga}.l`}ibrary update failed: ${error.message}]`);
        }
      );
    }
  }
}

/**
 * Update saga.
 * @param {string|string[]} sagaId The saga identifier or the path to the altered data.
 * @param {Saga} data The new saga information.
 */
function updateSaga(sagaId, data) {
  if (library.sagas.has(sagaId)) {
    //TODO: validate data.
    library.sagas.set(sagaId, data);
    return true;
  } else {
    return false;
  }
}

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);
listenDbChange(
  getRef(database, getBasePath() + "/saga/{sagaid}/library"),
  (snapshot) => {
    if (snapshot.exists()) {
      updateSaga(snapshot.id, snapshot.val());
    }
  })

/**
 * Create a new lobrary.
 * @constructor
 */
function Library() {
  const collections = new Map();
  const books = new Map();
  const contents = new Map();
  return {
    /**
     * The collections of the library.
     * @property
     * @type {Map<string,BookCollection>}
     */
    collections,
    /**
     * The books of the library.
     * @property
     * @type {Map<string, BookModel>}
     */
    books,
    /**
     * The contents of the library 
     * @property
     * @type {Map<string, BookContent>}
     */
    contents,
    toPOJO() {
      return {
        collections: Object.fromEntries(this.collections.entries()),
        books: Object.fromEntries(this.books.entries()),
        contents: Object.fromEntries(this.contents.entries())
      }
    },
    toJSON() {
      return JSON.stringify(this.toPOJO());
    }
  };
}

/**
 * @namespace Calendar
 * @description The namespace for calendar types.
 */

/**
 * @interface Calendar 
 * @memberof Calendar
 * @description The interface describing a calendar system. 
 * 
 * @method validField
 * @description TEsts if the given field is valid field for the calendar.
 * If the value is given, also tests if the given value is valid value for the field.
 * @param {CalendarField|string} field The tested field.
 * @param {Object|number|string} [value] The value of the field.
 * @returns {boolean} True, if and only if the given field is a valid field of the calendar,
 * and if given the value is valid value of the field.
 * 
 * @method getField
 * @param {CalendarField|string} field The wanted calendar field.
 * @returns {CalendarField?} The calendar field, or an undeifned value, if the field is not
 * valid field of the calendar.
 * 
 * @method parseEntry 
 * @param {string} source The parsed value.
 * @param {CalendarField} [field] The parsed field, if known. 
 * @description Parses an entry of the calendar.
 * @returns {CalendarFieldValue|CalendarDate<Calendar>|Cycle<Calendar>|Era<Calendar>|Month<Calendar>|Year<Calendar>|Day<Calendar>} 
 * The parsed element of the calendar.
 * @throws {TypeError} The type of hte parsed value was invalid.
 * @throws {SyntaxError} The parsed value was not a valid calendar entry.
 */
/**  
 * @template {Calendar.Calendar} CALENDAR - The calendar of the field.
 * @template {string|number} VALUE - The value type.
 * @interface CalendarFieldValue
 * @memberof Calendar 
 * @description A value of a calendar field.
 * @property {string} field The defined field.
 * @property {VALUE} value The value of the field. The calendar values are
 * 1 based.
 * @property {string|CALENDAR} [calendar] The calendar of the field.
 * 
 * @method validField
 */
/** 
 * @template {Calendar} CALENDAR - The calendar of the field.
 * @interface Year
 * @memberof Calendar 
 * @extends  CalendarFieldValue<CALENDAR,number>
 * @description Either a canonical year or a year of era.
 * @property {string} field The field name of the year. Either "CanonicalYear" or "YearOfEra".
 * @property {number} value The year.
 * @property {string} [era] The era of the year.
 * @property {Calendar} [calendar] The calendar of the year. 
 */

/**
 * Create a date field.
 * @template {number|string|(name|field)} TYPE - The value type.
 * 
 * @returns {CalendarField}
 */
function DateField(fieldName, fieldValueTypes, fieldValueValidator) {


  return {
    fieldName,
    equivalentTo,

  };
}

/**
 * Create a date field value.
 * @template {number|string} TYPE - The value type.
 * @param {string} field - The field.
 * @param {TYPE} value - The value.
 * @param {Calendar} calendar - The calendar of the the created date.
 * @param {Map<string, Function>} [supportedFieldsMap] - The mapping from supported field names
 * to teh functions returning the field.  
 * @returns {DateFieldValue<TYPE>}
 * @throws {TypeError} - The field was invalid.
 * @throws {RangeError} - The value was invalid for the date.
 */
function DateFieldValue(field, value, calendar) {
  const fieldName = (typeof field === "string" ? field : field.field);
  if (calendar.validValue(fieldName, value)) {
    return {
      field,
      value,
      calendar
    }
  } else if (calendar.hasField(field)) {
    throw RangeError(`Invalid field ${field} value`);
  } else {
    throw TypeError("Invlaid field");
  }
}

/**
 * @implements {Calendar.Calendar}
 */
class JulianCalendar {

  /**
   * @constructor
   * @describe Creates a day date field.
   * @param {string} [title] The title of the day field.
   * @param {number} [value=1] The value of the day.
   * @param {Function} [validValue] The validator of a value. 
   * @param {Array<string>} [supportedFields]  The list of supported field names.
   *  Defaults to the list containing "Day".
   * @returns 
   */
  static Day(field, lastDay, title, supportedFields = ["Day"]) {
    return {
      field: field,
      title: title,
      validValue(value) {
        return Number.isInteger(value) && value >= 1 && value <= lastDay;
      },
      supportedFields: [...supportedFields],
      hasField(field) {
        return this.supportedFields.find((tested) => (tested === field)) != null;
      },
      hasDerivedField(field) {
        return field !== field;
      },
      validFieldValue(field, value) {
        const seekedField = this.getField(field);
        return seekedField?.validValue(value);
      },
      getField(field) {
        if (this.hasField(field) && this.hasDerivedField(field)) {
          return this;
        } else {
          return undefined;
        }
      },
      withValue(value) {
        return this.validValue(value) ? new DateFieldValue(this.field, value, this.calendar) : undefined;
      }
    }
  }

  /**
   * The class month constuructor.
   * @param {*} title 
   * @param {*} value 
   * @param {*} lastDay 
   * @param {*} validValue 
   * @returns {Month}
   */
  static Month(title, value, lastDay, validValue) {
    return {
      field: "Month",
      title: title,
      value: value,
      supportedFields: ["Month", "MonthOfYear", "Day", "DayOfMonth"],
      derivedFields: ["Day", "DayOfMonth"],
      hasField(field) {
        if (this.supportedFields.find((supported) => (supported === field))) {
          return (Number.isInteger(value) && value >= 1 && value <= lastDay);
        } else {
          return false;
        }
      },
      validFieldValue(field, value) {
        return (this.hasField(field) && this.getField(field).validValue(value));
      },
      getField(field) {
        if (typeof field === "string") {
          switch (field) {
            case "Month": case "MonthOfYear":
              return this;
            case "Day": case "DayOfMonth":
              return new this.Day(field, lastDay, undefined, ["Day", "DayOfMonth"]);
            default:
              return false;
          }
        } else {
          return false;
        }
      },
      validValue,
      calendar: "JulianCalendar",
      toString() {
        return this.title;
      },
      valueOf() {
        return this.value;
      }
    }
  }

  /**
   * THe mapping from year types to years.
   * @type {Map<string, CalendarField>}
   */
  static yearTypes = new Map([["leapYear", {
    field: "Year",
    value: "leapYear",
    months: [
      ["January", 31], ["Feburary", 29], ["March", 31],
      ["April", 30], ["May", 31], ["June", 30],
      ["July", 31], ["August", 31], ["September", 30],
      ["October", 31], ["Novenber", 30], ["December", 31]
    ].map(([title, lastDay], index) => (new this.Month(title, index + 1, lastDay))),

  }], ["standardYear", {
    field: "Year",
    value: "standardYear",
    months: [
      ["January", 31], ["Feburary", 28], ["March", 31],
      ["April", 30], ["May", 31], ["June", 30],
      ["July", 31], ["August", 31], ["September", 30],
      ["October", 31], ["Novenber", 30], ["December", 31]
    ].map(([title, lastDay], index) => (new this.Month(title, index + 1, lastDay))),
    supportedFields: new Map([["Months", (value) => {
      switch (typeof value) {
        case "string":
          // The name of the month.
          return this.months.find((month) => (month.title === value));
        case "number":
          // Tne number of months.
          if (value >= 1 && value <= 12) {
            return this.months[value - 1];
          }
        // eslint-disable-next-line no-fallthrough
        default:
          return undefined;
      }
    }], ["Year"], ["CanonicalYear"]]),
    withValue(value) {
      return new DateFieldValue(this.field, value, this.calendar);
    },
    /**
     * Get a derived field. 
     * @param {number} value - The value of year.
     * @param {string} field - The field string.
     */
    getField(field) {
      if (this.supportedFields.find((fieldName) => (field === fieldName))) {
        return this.calendar.getField(field);
      }
    },
    getFieldValue(field, value) {
      const calendarField = this.getField(field);
      return calendarField?.withValue(value);
    }
  }]
  ]);

  /**
   * Get the era abbreviation from era title.
   * @param {string} title The title of the era.
   * @returns {string} The abbreviation generated from the title.
   */
  getEraAbbreviation(title) {
    return title.split(" ").filter((part) => (part.length > 0 && /^\p{Lu}/u.test(part))).map().join("");
  }


  /**
   * Create a field value of an era. The field "Year" is interpreted as a year of era, if it is
   * valid year of era for the era, or a canonical year, if it is not valid year of era.
   * @param {string} title the name of the era.
   * @param {string} [value] The value of the era. This is used to determine
   * equivalence of the eras. Defaults to the title.
   * @param {string} [abbrev] The abbreviatiation of the era. If not specified, the abbreviation
   * is generated from the title with {@link getEraAbbreviation}
   * @param {Predicate<number>} [validCanonicalYear] The validator of a canonical year. 
   * @param {{value: number}=>{number}} [toCanonicalYear] The function converting the
   * year of era into canonical year. The default does no conversion.
   * @param {Array<string>} [equivalentValues] The list of the values equivalent to this value.
   * @param {number} [maxYear] The largest allowed year of hte era.
   * @returns {FieldValue<Era>} - The field value of the era.
   */
  createEra(title, value = null, abbrev = null,
    validCanonicalYear = (year) => (Number.isInteger(year)),
    toCanonicalYear = (value) => (value), equivalentValues = [], maxYear = null) {

    try {
      if (typeof ("" + title) !== "string") {
        throw TypeError("Invalid title: The title has to be Stringifiable.")
      }

    } catch (error) {
      throw TypeError("Invalid title: The title has to be Stringifiable.")
    }
    try {
      if (value != null && typeof ("" + value) !== "string") {
        throw TypeError("Invalid value: The a defined value has to be Stringifiable.")
      }

    } catch (error) {
      throw TypeError("Invalid value: The a defined value has to be Stringifiable.")
    }

    if (!(validCanonicalYear instanceof Function)) {
      throw TypeError(`Invalid validCanonicalYear: The canonical year validatorn has to be a function`);
    }

    if (!(toCanonicalYear instanceof Function)) {
      throw TypeError(`Invalid toCanonicalYear: The converter to the canonical year has to be a function`);
    }
    if (!(equivalentValues instanceof Array)) {
      throw TypeError(`Invalid equivalent values has to be an array`);
    }

    const canonicalYearField = this.getField("CanonicalYear");
    const calendar = this;
    const createdEra = {
      field: "Era",
      title,
      fields: ["YearOfEra", "Year", "CanonicalYear"],
      equivalentTo: equivalentValues,
      value: value == null ? title : value,
      abbrev: abbrev == null ? this.getEraAbbreviation(title) : abbrev,
      getField(field, value = null) {
        const fieldName = (typeof field === "string" ? field : field.field);
        if (value == null) {
          if (fieldName === "Year" || fieldName === "YearOfEra") {
            return this.getField(field)
          } else if (fieldName === "CanonicalYear") {
            return canonicalYearField;
          }
        } else if (Number.isInteger(value)) {
          if (fieldName === "YearOfEra" || (fieldName === "Year")) {
            // The value is valid year within era.
            const maximum = this.getFieldMaximum(fieldName);
            if (value >= 1 && (maximum == null || value < maximum)) {
              // TODO: replace with generation of the proper year or the year of era. 
              return {
                field: fieldName + ":value",
                era: createdEra,
                value,
                calendar,
                getField(field, value = null) {
                  if (field === this.field) {
                    return this.value;
                  } else if (["YearOfEra", "Year"].find(
                    (yearField) => (yearField === field || yearField === `${yearField}:value`)) != null) {
                    // The year is year of era or value of year of era.
                    const resultYear = (value ? toCanonicalYear(value) : this.toCanonicalYear(this.value));
                    const [yearFieldName, fieldDescriptor] = field.split(":");
                    const resultField = (this.isLeapYear(resultYear) ? this.calendar.getField(`${yearFieldName}:leapYear`) :
                      this.calendar.getField(`${yearFieldName}:standardYear`));
                    if (fieldDescriptor === ":value") {
                      if (value) {
                        return resultField.getField(field, value);
                      } else {
                        return undefined;
                      }
                    } else if (value) {
                      return resultField.getField(field, value);
                    } else {
                      return resultField;
                    }
                  } else if (["CanonicalYear"].find(
                    (yearField) => (yearField === field || yearField === `${yearField}:value`)) != null) {
                    // THe canonical year.
                    const resultYear = (value ? value : this.toCanonicalYear(this.value));
                    const [yearFieldName, fieldDescriptor] = field.split(":");
                    const resultField = (this.isLeapYear(resultYear) ? this.calendar.getField(`${yearFieldName}:leapYear`) :
                      this.calendar.getField(`${yearFieldName}:standardYear`));
                    if (fieldDescriptor === ":value") {
                      if (value) {
                        return resultField.getField(field, value);
                      } else {
                        return undefined;
                      }
                    } else if (value) {
                      return resultField.getField(field, resultYear);
                    } else {
                      return resultField;
                    }
                  }

                  return undefined;
                }
              };
            }
          } else if (fieldName === "CanonicalYear") {
            // Returning the canonical year.
            const result = toCanonicalYear(value);
            if (validCanonicalYear(result)) {
              // TODO: replace with generation of the proper canonical year. 
              return {
                field: fieldName, value: result,
                getField(field, value = null) {
                  if (field === "Year" || field === "CanonicalYear") {
                    if (field === this.field) {
                      return this.value;
                    } else if (["CanonicalYear", "Year"].find(
                      (yearField) => (yearField === field || yearField === `${yearField}:value`)) != null) {
                      // THe canonical year.
                      const resultYear = (value ? value : this.value);
                      const [yearFieldName, fieldDescriptor] = field.split(":");
                      const resultField = (this.isLeapYear(resultYear) ? this.calendar.getField(`${yearFieldName}:leapYear`) :
                        this.calendar.getField(`${yearFieldName}:standardYear`));
                      if (fieldDescriptor === ":value") {
                        if (value) {
                          return resultField.getField(field, value);
                        } else {
                          return undefined;
                        }
                      } else if (value) {
                        return resultField.getField(field, resultYear);
                      } else {
                        return resultField;
                      }
                    }

                    return undefined;
                  }
                }
              };
            }
          }
        }
        // The value was invalid.
        return undefined;
      },
      /**
       * Get the field value.
       * @param {string} field - The field name. 
       * @returns {(string|number|undefined)} The value of the given field, or an undefined value, if
       * the field is not supported, or does not have a value.
       */
      getFieldValue(field) {
        if (field === this.field) {
          return this.value;
        }
        const fieldValue = this.getField(field);
        if (fieldValue != null) {
          return fieldValue.value;
        } else {
          return undefined;
        }
      },
      getFieldMinimumField(field) {
        if (field === this.field) {
          return undefined; // String valued field does not have minimum.
        }
        if (["Year", "YearOfEra"].find((v) => (v === field))) {
          // The default minimum is 1.
          return 1;
        } else if (field === "CanonicalYear") {
          // The canonical year does not have a minimum.
          // (Optionally add boundary of the dates)
          return null;
        }
      },
      getFieldMaximumField(field) {
        if (field === this.field) {
          return undefined; // String valued field does not have minimum.
        }
        if (["Year", "YearOfEra"].find((v) => (v === field))) {
          // The default minimum is 1.
          return maxYear;
        }
      },
      toString() {
        return this.title;
      }
    };
    return createdEra;
  }

  /**
   * Create a new Julian Calendar.
   * @param {{day: number=1, month: number=1}} startOfYear The start of the year.
   */
  constructor(startOfYear = { day: 1, month: 1 }) {
    this.startOfYear = startOfYear;
    this.eras = new Map([
      ["Before the Common Era", this.createEra("Before the Common Era", "BCE", null, (year) => (year <= 0),
        (year) => (1 - year), ["Before Christ"])],
      ["Common Era", this.createEra("Before Christ", "CE", null, (year) => (year > 0),
        (year) => (year), ["Anno Domini"])],
      ["Before Christ", this.createEra("Before Christ", "BC", null, (year) => (year <= 0),
        (year) => (1 - year), ["Before the Common Era"])],
      ["Anno Domini", this.createEra("Before Christ", "AD", null, (year) => (year > 0),
        (year) => (year), ["Common Era"])],
    ]);
    this.years = this.constructor.yearTypes;
  }

  /**
   * Is the canonical year a leap year.
   * @param {number} year - The tested canonical year.
   * @returns {boolean} True, if and only if the year is a canonical year.
   */
  isLeapYear(year) {
    switch (typeof year) {
      case "number":
        return ((year + (this.startOfYear.month > 2 ? -1 : 0)) % 4 == 1);
      case "object":
        if ("getFieldValue" in year && "validField" in year) {
          // The object is a value of field.
          if (year.validField("CanonicalYear")) {
            return this.isLeapYear(year.getFieldValue("CanonicalYear"));
          }
        } else if ("field" in year && "value" in year) {
          // The object is a field value.
          if (this.validField(year.field, year.value)) {
            return this.isLeapYear(this.getField(year.field).getField("CanonicalYear"));
          }
        } else if ("year" in year) {
          if ("era" in year) {
            // A year of era. 
            if (this.hasEra(year.era)) {
              // The calendar recognizes the era.
              return this.isLeapYear(this.getEra(year.era).getFieldValue("CanonicalYear"));
            }
          } else {
            // A canonical year. 
            return this.isLeapYear(year.year);
          }
        }
      // eslint-disable-next-line no-fallthrough
      default:
        throw TypeError("Invalid year");
    }
  }

  /**
   * Does the calendar have given field.
   * @param {string} field The tested field name.
   * @returns {boolean} True, if and only if the calendar recognizes the given field.
   */
  hasField(field) {
    return this.supportedFields.has(field);
  }

  /**
   * Get a field of the calendar.
   * @param {*} field The filed.
   * @returns {CalendarField?} The calendar field with given field 
   */
  getField(field) {
    // The Calendar supports lots of fields. 
    if (field === "Year:leapYear") {
      return this.years.get("leapYear");
    } else if (field === "Year:standardYear") {
      return this.years.get("standardYear")
    } else if (this.eras.has(field)) {
      return this.eras.get(field);
    } else {
      return undefined;
    }
  }

  /**
   * Get field value.
   * @param {CalendarField|string} field The field, whose value for Calendar is queried.
   * @returns {string|number|undefined} The value of the field, or an undefined value, if
   * field does nto exist.
   */
  getFieldValue(field, value) {
    const resultField = this.getField(field);
    return resultField.withValue(value);

  }


  hasEra(era) {
    switch (typeof era) {
      case "number":
        if (era < 1) return false;
        return (era <= this.eras.length && this.eras.get(era - 1) != null);
      case "string":
        return this.eras.has(era);
      case "object":
        if (["getField", "getFieldValue", "hasField"].every((prop) => (prop in era && era[prop] instanceof Function))) {
          // A field value.
          if (era.field === "Era") {
            return this.hasEra(era.value);
          }
        } else if (["field", "value"].every((prop) => (prop in era))) {
          if (era.feild === "Era") {
            return this.hasEra(era.value);
          }
        }
      // eslint-disable-next-line no-fallthrough
      default:
        return false;
    }
  }

  getEra(era) {
    if (this.hasEra(era)) {
      switch (typeof era) {
        case "number":
          // Era is a number.
          return this.eras.values()[era - 1];
        case "string":
          return this.eras.get(era);
        case "object":
          if (["getField", "getFieldValue", "hasField"].every((prop) => (prop in era && era[prop] instanceof Function))) {
            // A field value.
            if (era.field === "Era") {
              return this.getEra(era.value);
            }
          } else if (["field", "value"].every((prop) => (prop in era))) {
            if (era.feild === "Era") {
              return this.getEra(era.value);
            }
          }
        // eslint-disable-next-line no-fallthrough
        default:
          return undefined;
      }
    } else {
      return undefined;
    }
  }
}

const JuliaCaleandarInstance = new JulianCalendar();

/**
 * @template {Calendar.Calendar} CALENDAR - The calendar of the field.
 * @typedef {Object} YearOfEra
 * @implements {Calendar.Year<CALENDAR>}
 * @property {string} field @inheritdoc
 * @property {number} year @inheirtdoc
 * @property {string} era @inheritdoc
 * @property {Calendar} calendar @inheritdoc
 */
class YearOfEra {

  /**
   * Create a new year of era.
   * 
   * @param {YearOfEra<CALENDAR>} param0
   * @param {number} year The year of the era.
   * @param {number|string} era The era number, era name, or era abbreviation.
   * @param {Calendar} calendar The calendar of the date.
   * @throws {TypeError} The calendar, the era, or the year was invalid.
   */
  constructor({ year, era, calendar }) {
    if (calendar == null || !(calendar instanceof Object)) {
      throw new TypeError("Invalid calendar type");
    }
    if (!calendar.validField("Era", era)) {
      throw new TypeError("Invalid calendar era");
    }
    if (!calendar.getField("Era", era).validField("Year", year)) {
      throw new TypeError("Invalid calendar year of era");
    }
    this.calendar = calendar;
    this.era = era;
    this.year = year;
  }


}
/**
 * @template {Calendar} CALENDAR - The calendar of the field.
 * @typedef {Object} YearOfEra
 * @implements {Year<CALENDAR>}
 * @property {string} field @inheritdoc
 * @property {string} era @inheritdoc
 * @property {Calendar} calendar @inheritdoc
 */


/** 
 * @interface Month
 * @extends CalendarFieldValue
 * @description Either month or a month of year.
 * @property {number} value The month starting from index 1.
 * @property {Year} [year] The year of the month. 
 * @property {string|Calendar} [calendar] The calendar of the month.
 */
/** 
 * @interface Day
 * @extends CalendarFieldValue
 * @descripotion Either a day, a day of month, or a day of year.
 * @property {string} field The calendar field. Either "Day", "DayOfMonth", or "DayOfYear"
 * @property {number} value The day startng from index 1.
 * @property {Month} [month] The month of the date, if day of month.
 * @property {Year} [year] The year of the date, if day of year.
 * @property {string|Calendar} [calendar] The calendar of the day. 
 */
/** 
 * @interface Era
 * @extends CalendarFieldValue
 * @description An era. 
 * @property {string} field The calendar field. Either "Era" or "EraOfCycle"
 * @property {string} [name] The name of the era.
 * @property {Function} formatYearOfEra The format of the year with era.
 * @property {Function} parseYearOfEra The parser of a formatted year.
 * @property {number} value The number of the era.
 * @property {string|Calendar} [calendar] The calendar of the era. 
 */
/** 
 * @interface EraCycle
 * @extends CalendarFieldValue
 * @description A cycle of an era.
 * @property {string} field The calendar field. Either "CalendarCycle"
 * @property {number} cycle Teh cycle of the era.
 * @property {string|Calendar} [calendar] The calendar of the cycle.
 */
/** 
 * @interface HermeticSeason
 * @extends CalendarFieldValue
 * @property {number|string} season The seaons of the season.
 * @property {number|string|Year} year The year of the season. This may
 * be Julian or Hermetic year. The default is Julian Calendar year.
 */
/** 
 * @interface JulianDate
 * @extends CalendarFieldValue
 * @property {number} day The julian calendar day of month.
 * @property {number|string|Month} month The julian calendar month of year.
 * @property {number|string|Year} year The julian calendar year starting from
 * start of March.
 * @property {Calendar} calendar The julian calendar. 
 */
/** 
 * @interface AriesianData
 * @extends {CalendarFieldValue}
 * @property {number} day  The day of month.
 * @property {number|string|Month} month The month of year.
 * @property {string|HermeticSeason} [season] The season of the date.
 * @property {number|string|Year} year The year. 
 * @property {Calendar} calendar The hermetic calendar. 
 */

/**
 * @typedef {Object} SimpleCalendarDate
 * @description A simple calendar date using a day of month, a month of year, and
 * a year of era or a canonical year as numbers.
 * @property {number} day the day of month. First month has index 1.
 * @property {number} month The month of year. First month has index 1.
 * @property {number} year The year of era or the canonical year, if no era is given.
 * @property {number|string} [era] The era of the year. 
 */
/**
 * @typedef {Object} CalendarFieldDate
 * @description A calendar date using fields of calendar.
 * @property {DayOfMonth|DayOfYear} day the day 
 */

/** 
 * @typedef {HermeticSeason|JulianDate|AriesianDate} HermeticDate
 */

/**
 * 
 * @param {string} name The name of the created saga.
 * @param {string|CalendarDate|HermeticDate} startDate The start date of the created saga.
 */
export function createSaga(name, startDate) {
  const saga = {
    title: name,
    start: startDate,
    current: startDate,
    players: {

    },
    library: new Library(),
    people: [],
    history: {
      entries: [{
        date: startDate,
        title: `Saga ${name} begins`,
        desc: "The start of the saga"
      }]
    }
  }
}



function getBasePath() {
  return "arm5/";
}

function getDbPath(options) {
  let result = getBasePath();
  if (options.saga) {
    result = result.concat(`saga/${options.saga}/`);
  }
  result += "library/";
  if (options.collection) {
    result = result.concat("collections/" + options.collection);
  }
  if (options.collections) {
    result = result.concat(options.collections.map((c) => (`collection/${c}`)).join("/"), "/")
  }
  if (options.book) {
    result = result.concat("book/" + options.book, "/");
  }

  return result;
}

/**
 * Create a new book.
 * @param {Partial<Book>} book the stored book
 * @param {LibraryLocatorOptions} [options] The options for the library location of the book.
 * @returns {StringIdentified<Book>} The created book.
 */
export function createBook(book, options = {}) {
  const stored = new BookModel(book);
  const booksPath = getDbPath({
    saga: options.saga
  });
  const dbPath = getDbPath(options);
  const storedKey = pushRecord(getRef(database, booksPath), stored.toJSON());
  const updates = {};
  if (options.collection) {
    const ref = getRef(database,
      {
        saga: options.saga,
        collection: options.collection,
        collections: options.collections
      });
    updates[ref] = insert(storedKey);
  }
  return {
    id: storedKey,
    value: stored
  }
}

/**
 * Get the book REST URL.
 * @param bookId The book ide.
 */
export function getBookUrl(options = {}) {
  if (options.sagaId) {
    return getDbPath({ sagaId: options.sagaId, bookId: options.bookId })
  }
}

/**
 * Stores book to the data storage.
 * 
 * @param {Book} book The stored book.
 * @param {BookLocation} [options] The options of the ztoringm
 * @return {string} The book access identifier.
 */
export function storeBook(book, options = {}) {
  if (book.id) {
    setRecord(getBookUrl({ ...options, bookId: book.id }), JSON.stringify(book));
  } else {
    setRecord(getBookUrl({ ...options }), JSON.stringify(book));
  }
}

export function updateBook(id, book) {
  const url = getBookUrl({ bookdId: id });
  console.log(`Update book: ${url}: to ${book}`);
}

export function deleteBook(id) {
  const url = getBookUrl({ bookdId: id });
  console.log(`Delete book ${url}`);
}