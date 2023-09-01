import Covenant from './modules.covenant.js';
import { getMaxId, idGenerator } from './modules.idGenerator.js';


/**
 * @typedef {object} DAO 
 * @template CONTENT, ID
 * 
 * @method update 
 * @param {ID} id The updated identifier.
 * @param {ChangesType} changes The changes.
 * @returns {ID?} The new identifeir of the modified covenant, or undefined if nothing changed.
 * 
 * @method create 
 * @returns {import('./modules.covenant.js').CovenantProperties} The identifier of the created content.
 * @throws {RangeError} The identifier provided was already taken.
 * @throws {Error} The construction of a new identfiier failed.
 * 
 * @method remove
 * @param {ID} id The removed identifier.
 * 
 * @method retrieve 
 * @param {ID} id The identifier of the fetched value.
 * @return {CONTENT|undefined} The content assigned with the given identifier
 * @throws {TypeError} The type of the identifier is invalid.
 * 
 * @method all
 * @returns {Array<CONTENT>} The contents of the DAO.
 */

/**
 * Data access object used to access covenants.
 * @implements DAO<Covenant, number>
 */
export default class CovenantDAO {

  /**
   * Create a new covenant storing DAO.
   * @param {Array<Covenant>} [content=[]] The initial contents of the dao. 
   */
  constructor(content = []) {
    this.content = [...(content)];
    this.idGen = idGenerator(this.content.reduce(getMaxId, 0) + 1);
  }

  /**
   * @inheritdoc
   */
  all() {
    return this.filter(() => (true));
  }

  /**
   * @inheritdoc
   */
  filter(filter) {
    return this.content.filter(filter);
  }

  /**
   * @inheritdoc
   * @param {number} id the identifier of the updated covenant. 
   * @param {CovenantProperties|Array<CovenantProperties>} changes The changes of the covenant.
   * @returns {number} The new identifier of the updated covenant.
   * An undefined value, if there was no changes.
   */
  update(id, changes) {
    const target = this.retrieve(id);
    if (target) {
      if (changes instanceof Covenant) {
        // Changing the covenant to the covenant equal to teh current one.
        return target.update(changes);
      } else {
        // The both 
        return target.update(changes);
      }
    } else {
      // Nothing to change.
      return undefined;
    }
  }

  /**
   * Get the covenant with identifier.
   * @param {number} id the idnetifier of the retrieved covenant. 
   * @returns {Covenant|undefined} The covennat with the given identifier, or
   * an undefined value.
   */
  retrieve(id) {
    return this.content.find((entry) => (entry && entry.id === id));
  }

  /**
   * Create a new covenant. 
   * @param {Covenant|CovenantProperties|CovenantChanges} source 
   * @return {number} The identifier of the created covenant.
   * @throws {RangeError} THe covenant with the same identfier already
   * exists.
   */
  create(source) {
    const created = new Covenant(source);
    if (created.id == null) {
      // Determining the identifier of the created automatically.
      let newId;
      do {
        newId = this.idGen.next().value;
      } while (newId != null && this.fetch(newId) != null);
      if (newId == null) {
        // The identifier supply exhausted.
        return new Error("The identifier supply exhautes");
      } else {
        created.id = newId;
      }
    } else if (this.fetch(created.id) != null) {
      // The created object already exists - the update is required.
      throw new RangeError("Covenant with the identifier already exists");
    }
    this.content.push(created);
    return created.id;
  }
}
