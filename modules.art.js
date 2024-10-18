

 /**
  * The Art Type defines enumeration of the Art types.
  * @typedef {Object} ArtType
  * @readonly
  * @enum {string}
  */

 /**
  * @type {Record<string, ArtType>}
  */
 export const ArtTypes = {
  TECHNIQUE: "Form",
  FORM: "Technique"
}


/**
 * Hermetic Art defines an Art of the mages.
 * @typedef {Object} Art
 * @property {string} name The name of the art.
 * @property {string} abbrev The short abbreviation of the art.
 * @property {ArtType} type The art type.
 */
 


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
export const FORM = ArtTypes.FORM;

/**
 * Constant of the Art type for Hermetic Techniques.
 * @type {ArtType}
 */
export const TECHNIQUE = ArtTypes.TECHNIQUE;

/**
 * Get all techniques.
 * @return {List<Art>} The list containing all Hermetic Techniques.
 */
export function getTechniques() {
  return arts.filter( art => (art.type === TECHNIQUE));
}

/**
 * Get all Hermetic Forms.
 * @return {List<Art>} The list containing all Hermetic Forms.
 */
export function getForms() {
  return arts.filter( art => (art.type === FORM));
}

/**
 * Create a new art.
 * @param {string} name The name of the created art.
 * @param {string} [abbrev] The abbreviation of the art. @default The two first letters of the name.
 * @param {ArtType} [type=FORM] The art type of the created art.
 * @throws {Error} Any parameter was invalid.
 */
export function createArt(name, abbrev = undefined, type=FORM) {
  const abbreviation = (abbrev == null? name.substring(0,2) : abbrev);
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
  return createArt(name, abbrev, TECHNIQUE);
}

export function createForm(name, abbrev = undefined) {
  return createArt(name, abbrev, FORM);
}


/**
 * Get all arts.
 * @return {List<Art>} - the list of arts
 */
export function getArts() {
  return [
    ...(["Creo", "Intellego", "Muto", "Perdo", "Rego"].map((name) => (createTechnique(name)))),
    ...(["Animal", "Auram", "Aquam", "Corpus", "Herbam",
    "Ignem", "Imaginem", "Mentem", "Terram", "Vim"].map((name) => (createForm(name)))),
  ];

}


export default {
  
  ArtType: ArtTypes, 
  getArts,
  getForms,
  getTechniques,
  createArt,
  createTechnique,
  createForm
  
};