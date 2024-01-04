/**
 * Generate an identifier from a source.
 * @template Id The identifier type.
 * @template Content The content type.
 * @callback IdFunction
 * @param {Content} source The object, whose identifier is generated.
 * @param {number} [salt] The salt of the content.
 * @returns {Id|false} The identifier, if the identifier exists, or a
 * false indicating no identifier exists for the source.
 */
/**
 * A reference library storing and constructing references.
 * @template Id The identifier of the reference.
 * @template Content The referred content type.
 */

export class ReferenceLibrary {
  /**
   * The members of the reference library.
   * @type {Map<Id, Content>}
   */
  #members = new Map();

  /**
   * @type {IdFunction<Id, Content>}
   */
  #idFunction;

  /**
   * The salts of base identifiers.
   * @type {Map<Id, number>}
   */
  #salts = new Map();

  /**
   * Create a new registry.
   * @param {IdFunction} idFunction The identifier function generating an
   * identifier for a content.
   * @param {Map<Id, number>} [salts] The initial salts.
   */
  constructor(idFunction, salts = undefined) {
    this.#idFunction = idFunction;
    if (salts) {
      this.#salts = salts;
    }
  }

  /**
   * Create a new reference identifier for a member.
   * @param {Content} member The new member.
   * @return {Id|undefined} The identifier created for the member.
   * @throws {Error} There is no more identifiers available.
   */
  createId(member) {
    const baseId = this.#idFunction(member);
    if (baseId) {
      // The base id exists - generating the identifier for it.
      let salt = this.#salts.get(baseId);
      let result = baseId;
      while (result && this.#members.has(result)) {
        if (salt) {
          // Increasing the salt.
          salt++;
        } else {
          // The initial salt.
          salt = 1;
        }
        this.#salts.set(baseId, salt);
        salt = this.#salts.get(baseId);
      }
      if (result) {
        this.#salts.set(baseId, salt);
        return result;
      }
    }
    throw new Error("Could not generate identifier");
  }

  /**
   * Add a new member to the registry.
   * @param {Content} member The added member.
   * @returns {Id} The identifier assigned to the member.
   * @throws {TypeError} The member was invalid.
   */
  addMember(member) {
    try {
      const id = this.createId(member);
      this.#members.set(id, member);
      return id;
    } catch (error) {
      throw new TypeError("Invalid member", { cause: member });
    }
  }

  /**
   * Get the member with the identifier.
   * @param {Id} id The identifier.
   * @returns {Content?} The content attached to the identifier.
   */
  getMember(id) {
    return this.#members.get(id);
  }

  /**
   * Remove a member with identifier.
   * @param {Id} id The identifier of the removed key.
   * @returns {boolean} Was an element removed.
   */
  removeId(id) {
    return this.#members.delete(id);
  }
}
