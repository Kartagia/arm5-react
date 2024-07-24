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
  { name: "id", title: "Id", type: "string" }
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

export function getDefaultAlphabet(lang) {
  switch (lang) {
    case 'Arabic':
    case "Latin":
    case "Greek":
      return lang;
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