let data = {
  collections: [],
  books: [
    {
      id: "ability.hermetic.summa.Principia_Magica",
      title: "Principia Magica",
      author: "Bonisagus",
      contents: [
        {
          id: "principia_magica.magic_theory",
          type: "Summa",
          targetType: "Hermetic Ability",
          target: "Magic Theory",
          level: 5,
          quality: 15
        }
        ]
        },
    {
      title: "Summae Vitae",
      type: "Summa",
      targetType: "Art",
      contents: [
        {
          target: "Vim",
          level: 4,
          quality: 10
          },
        { target: "Corpus", level: 4, quality: 9 },
        { target: "Creo", level: 4, quality: 9 }
            ]
        },

    {
      title: "Flaws of the Founders",
      author: "Flavicus ex Tytalus",
      contents: [
        {
          target: "Order of Hermes Lore",
          quality: 7
            },
        {
          targetType: "Art",
          target: "Vim",
          quality: 7
            },
        {
          targetType: "Art",
          target: "Ignem",
          quality: 8
            }
            ]
        }],
  pending: [],
  history: []
};

/**
 * Get the current library.
 * @return {import("./modules.library.js").LibraryModel} 
 */
export function getLibrary() {
  return { ...data };
}

/**
 * The content identifier.
 * @typedef {Object} ContentId
 * @property {string} contentId
 */

/**
 * @typedef {Optional<ContentId> & {bookId: string}} BookId
 */

/**
 * @param {BookId} props
 * @returns {[BookModel|undefined] The sought book model,or undefined value, if no such book exists.
 */
export function getBook(props) {
  const source = getTarget(props);
  if (source) {
    return source.books.find(
      book => (book.id === props.bookId));
  } else {
    return undefined;
  }
}

function createBookId(bookModel, options = {}) {
  const segments = [];
  if (options.collectionId) {
    segments.push(options.collectionId);
  }
  segments.push("book");
  let candidate = segments.join(".");
  let counter = undefined;
  while (getBook({collectionId: options.collectionId, bookId: candidate})) {
    if (counter) {
      counter++;
      segments[segments.length - 1] = `copy-${counter}`
    } else {
      counter = 1;
      segments.push(`copy-${counter}`)
    }
    candidate = segments.join(".");
  }
  return candidate;
}

/**
 * @param {import("./module.library.js").BookModel} bookModel The added book.
 * @param {Object} [options={}]
 * @param {string} [,options.collectionId] The collection of the book. 
 */
export function addBook(bookModel, options = {}) {

  function getTarget(options) {
    if (options.collectionId) {
      const target = data.collections.find(cursor => (cursor.id === collectionId));
      return target;
    } else {
      return data;
    }
  }
  const target = getTarget(options);
  if (target) {
    let newId = bookModel.id || createBookId(bookModel, options);
    target.books.push({
      ...bookModel,
      id: newId
    });
  } else {
    throw Error("Could not add book to non-existing collection");
  }
}