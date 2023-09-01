

/**
 * Hermetic Art defines an Art of the mages.
 */
export class Art {

  /**
   * Create a new art.
   * @param {string} name The name of the created art.
   * @param {string} abbrev The abbreviation of the created art.
   * @param {string} type The type of the art.
   */
  constructor(name, abbrev, type) {
    this._name = name;
    this._abbrev = abbrev == null ? this.name.substring(0, 2) : abbrev;
    this._type = type;
  }

  /**
   * The name of the art.
 * @type {string}
   */
  get name() {
    return this._name;
  }

  /**
   * Tte abbreviation of the art.
   * @type {string}
   */
  get abbrev() {
    return this._abbrev;
  }

  /**
   * The type of the art.
   * @type {string}
   */
  get type() {
    return this._type;
  }
}

/**
 * The Art Type defines enumeration of the Art types.
 * @readonly
 * @enum {string}
 */
export const ArtType = {
  TECHNIQUE: "Form",
  FORM: "Technique"
}

/**
 * @typedef {Art} Technique
 */
export class Technique extends Art {
  constructor(name, abbrev) {
    super(name, abbrev, ArtType.TECHNIQUE);
  }
}

export class Form extends Art {
  constructor(name, abbrev) {
    super(name, abbrev, ArtType.FORM);
  }
}

/**
 * Mapping from art name to Art implementation.
 */
const arts = getArts().reduce(
  (result, art) => {
    if (art != null) {
      if (art instanceof Object) {
        result[art.name] = art;
      } else {
        var newArt = createArt(art);
        result[newArt.name] = newArt;
      }
    }
    return result;
  }
  , {});


/**
 * Constant of the Art type for Hermetic Forms.
 * @type {ArtType}
 */
export const FORM = ArtType.FORM;

/**
 * Constant of the Art type for Hermetic Techniques.
 * @type {ArtType}
 */
export const TECHNIQUE = ArtType.TECHNIQUE;

/**
 * Get all techniques.
 * @return {List<Art>} The list containing all Hermetic Techniques.
 */
export function getTechniques() {
  return arts.filter(art => (art.type === ArtType.TECHNIQUE));
}

/**
 * Get all Hermetic Forms.
 * @return {List<Art>} The list containing all Hermetic Forms.
 */
export function getForms() {
  return arts.filter(art => (art.type === ArtType.FORM));
}

/**
 * Create a new art.
 * @param {string} name The name of the created art.
 * @param {string} [abbrev] The abbreviation of the art. @default The two first letters of the name.
 * @param {ArtType} [type=FORM] The art type of the created art.
 * @throws {Error} Any parameter was invalid.
 */
export function createArt(name, abbrev = undefined, type = ArtType.FORM) {
  const abbreviation = (abbrev == null ? name.substring(0, 2) : abbrev);
  /**
   * A Hermetic Art as POJO.
   * @class Art
   */
  return {
    /**
     * The name of the art.
     * @type {string}
     */
    name: name,
    /**
     * The short abbreviation of the art.
     * @type {string}
     */
    abbrev: abbreviation,
    /**
     * The type of the art.
     * @type {ArtType}
     */
    type: type,
  };
}
export function createTechnique(name, abbrev = undefined) {
  return new Technique(name, abbrev);
}

export function createForm(name, abbrev = undefined) {
  return new Form(name, abbrev);
}


/**
 * Get all arts.
 * @return {List<Art>} - the list of arts
 */
export function getArts() {
  return [
    ...(["Creo", "Intellego", "Muto", "Perdo", "Rego"].map((name) => (new Technique(name)))),
    ...(["Animal", "Auram", "Aquam", "Corpus", "Herbam",
      "Ignem", "Imaginem", "Mentem", "Terram", "Vim"].map((name) => (new Form(name)))),
  ];

}

/**
 * The enumeration of the Hermetic Arts
 * @readonly
 * @enum {Art} 
 */
export const HermeticArts = getArts().reduce(
  (result, art) => {
    result[art.name] = art;
    result[art.abbrev] = art;
    return result;
  },
  {});


export default {

  ArtType,
  getArts,
  getForms,
  getTechniques,
  createArt,
  createTechnique,
  createForm

};