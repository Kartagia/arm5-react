/**
 * Library tools.
 *  
 * @module 
 */

import { initializeApp } from "firebase/app";
import { runTransaction, getDatabase, ref as getRef, set as setRecord, child as getChild, push as pushRecord, onValue as listenDbChange } from "firebase/database";
import { getDatabaseUrl } from ".env.db.js";
import JsonMap from "./module.JsonMap";
import { Entry, History } from "./module.history.js";

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
 * @property {Array<Entry>|History} [history=[]]
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
 * @property {History|Array<Entry>} [history] The book history.
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
 * The hermetic date as a string.
 * This can be either season, date of Julian calendar, o rdate of Hermetic calendar.
 * 
 * @typedef {string} HermeticDate
 */

/**
 * 
 * @param {string} name The name of the created saga.
 * @param {HermeticDate} [startDate] The start date of the created saga. Defaults
 * to the start of year 1220AD.
 */
export function createSaga(name, startDate = "Spring 1220AD") {
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

  return saga;
}


/**
 * Get the base path of the library database.
 * @returns {string} The database base path. 
 */
function getBasePath() {
  return "arm5/";
}

/**
 * Get database path.
 * @typedef {Object} DBPathOptions
 * @property {string} [saga] The saga identifier of the library path.
 * @property {string} [collection] The collection of the libraryidentifier. Takes precedence over
 * the collections.
 * @property {string[]} [collections] The collections list of the collections. 
 * @property {string} [book] The book identifier of the book.
 * @property {string} [content] The content identifier.
 */

/**
 * Get the database path of with the given options.
 * @param {DBPathOptions} options 
 * @returns The firebase reference to the path.
 */
function getDbPath(options) {
  let result = getBasePath();
  if (options.saga) {
    result = getChild(result, `saga/${options.saga}/`);
  }
  result = getChild(result, "library/");
  if (options.collection) {
    result = getChild(result, "collection/" + options.collection);
  }
  if (options.collections) {
    result = getChild(result, options.collections.map((c) => (`collection/${c}`)).join("/") + "/");
  }
  if (options.book) {
    result = getChild(result, `book/${options.kook}`);
  }

  if (options.content) {
    result = getChild(result, `content/${options.content}`);
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
  const dbPath = getChild(getDbPath({ saga: options.saga }), "book");
  const storedKey = pushRecord(dbPath, stored.toJSON());

  // Add book to the collection
  const updates = {};
  if (options.collection) {
    const collectionPath = getChild(getDbPath({ saga: options.saga, collection: options.collection, collections: options.collections }), "books");

    runTransaction(collectionPath, (collection) => {
      if (collection) {
        collection.push(storedKey);
      }
      return collection;
    });
    updates[collectionPath] = (storedKey);
  }
  // Adding contents.
  // TODO: Test which contents does not yet belong to the contents of the library.

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