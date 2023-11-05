/**
 * Library tools.
 *  
 * @module 
 */

import { initializeApp } from "firebase/app";
import { getDatabase, ref as getRef, set as setRecord, child as getChild, push as pushRecord, onValue as listenDbChange} from "firebase/database";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  // ...
  // The value of `databaseURL` depends on the location of the database
  databaseURL: "https://dune-rpg-assistant-default-rtdb.europe-west1.firebasedatabase.app/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

/**
 * The library data structure
 */
const library = {
  sagas: new Map(),
  collections: new Map(),
  books: new Map()
}



function updateSaga(data) {
  
}

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);
listenDbChange(
  getRef(database, getBasePath() + "/saga"), 
(snapshot) => {
  if (snapshot.exists()) {
    updateSaga(snapshot.val());
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
     * @type {Map<string,Collection>}
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

function createSaga(name, startDate) {
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

/**
 * Calculate normalized pyramid cost.
 * @param {number} score The current score.
 * @param {number} xp The current xo  
 * @param {number|null} [min] The smallest allowed score.
 * @param {number|null} [max] The largest qllowed score.
 * @param {number} [multiplier=1] The score multiplier.
 * @return {[number, number]} The new score and experience.
 */
function pyramidAdvance(score, xp, { multiplier = 1, max = null, min = null } = {}) {
  const result = [score, xp];
  if (score >= 0) {
    if (xp >= 0) {
      // Increasing
      while ((result[1] > multiplier * result[0]) && (max == null || result[0] < max)) {
        result[0]++;
        result[1] -= result[0] * multiplier;
      }
    } else {
      // Reducing
      while ((result[1] < 0 && result[0] > 0) && (min == null || result[0] > min)) {
        result[1] += result[0] * multiplier;
        result[0]--;
      }
      if (result[1] < 0 && (min == null || result[0] > min)) {
        return pyramidAdvance(result[0], result[1], { multiplier, min, max });
      }
    }
  } else if (score <= 0) {
    if (xp <= 0) {
      while ((min == null || result[0] > min) && (result[1] < multiplier * result[0])) {
        result[0]--;
        result[1] -= multiplier * result[0];
      }
    } else {
      while (result[1] > 0 && (max == null || result[0] < max) && result[0] < 0) {
        result[1] += result[0] * multiplier;
        result[0]++;
      }
      if (result[1] > 0 && (max == null || result[0] < max)) {
        return pyramidAdvance(result[0], result[1], { multiplier, min, max });
      }
    }
  }
  return result;
}

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
      return this.qualities.filter((mod) => (types.length === 0 || types.find( (type) => (type === undefined || mod.type === type)) != null)).reduce((result, value) => {
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
    result = result.concat(options.collections.map( (c) => (`collection/${c}`)).join("/"), "/")
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
export function createBook(book, options={}) {
  const stored = new BookModel(book);
  const booksPath = getDbPath({
    saga: options.saga
  });
  const dbPath = getDbPath(options);
  const storedKey = pushRecord(getRef(database, booksPath), stored.toJSON());
  const updates = {};
  if (options.collection) {
    const ref = getRef(database,
    {saga: options.saga, 
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
 * 
 */

/**
 * Stores book to the data storage.
 * 
 * @param {Book} book The stored book.
 * @param {BookLocation} [options] The options of the ztoringm
 * @return {string} The book access identifier.
 */
export function storeBook(book, options = {}) {
  setRecord(getBookUrl(options), JSON.stringify)
}

export function updateBook(id, book) {
  
}

export function deleteBook(id) {
  
}