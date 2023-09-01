
/**
 * @typedef {object} CovenantProperties
 * @property {string} name The name of the covenant.
 * @property {string|Tribunal} [tribunal] The tribunal of the covenant.
 * @property {Array<Person>} [magi=[]] The magi of the covenant.
 * @property {Array<Person>} [grogs=[]] The grogs of the covenant.
 * @property {Array<Person>} [companions=[]] The companions of the covenant.
 * @property {Array<Boon>} [boons=[]] The boons of the covenant.
 * @property {Array<Hook>} [hooks=[]] The hooks of the covenant.
 */

/**
 * A class representing a covenant.
 */
export default class Covenant {

  /**
   * Create a new covenant.
   * @param {CovenantParameters} param0 The covenant construction parameters.
   */
  constructor({ name, id = null, magi = [], companions = [], grogs = [], ...options }) {
    this.name = name;
    this.tribunal = options.tribunal;
    this.id = id;
    this.magi = [...magi];
    this.companions = [...companions];
    this.grogs = [...grogs];
    this.people = options.peopleRegistry;

    //TODO: Library support
    //TODO: Resources support
  }

  /**
   * Update the covenant. 
   * @param {CovenantProperties|Function|List<CovenantProperties|Function>} changes The changes applied to the
   * covenant.
   * @return {boolean} True, if and only if the covenant was updated.  
   */
  update(changes) {
    let result = false;
    if (changes instanceof Array) {
      // Array of changes.
      return changes.some((change) => (this.update(change)));
    } else if (changes instanceof Function) {
      // Function.
      return changes(this);
    } else if (changes instanceof Map) {
      // MAP
      return changes.reduce((result, [property, value]) => {
        if (property && property in this) {
          if (this[property] !== value) {
            this[property] = value;
            return true;
          }
        }
        return result;
      }, false);
    } else if (typeof changes === "object") {
      // POJO
      for (let property in changes) {
        if (property && property in this && changes[property] !== this[property]) {
          this[property] = changes[property];
          result = true;
        }
      }
    } else {
      // Unown chagne.
    }
    return result;
  }

  // eslint-disable-next-line no-unused-vars
  toJSON(key = "") {
    // Characters are stored to
    // registry
    if (this.people) {
      // Encode people stored in registry
      const encoder = (person) => {
        if (this.people.contains(person)) {
          return person.id;
        } else {
          return person;
        }
      };
      return {
        constructor: this.constructor,
        name: this.name,
        id: this.id,
        tribunal: this.tribunal,
        people: this.people,
        magi: this.magi.map(encoder),
        grogs: this.grogs.map(encoder),
        companions: this.companions.map(encoder)
      };
    } else {
      // Characters are stored in covenant
      return {
        name: this.name,
        id: this.id,
        tribunal: this.tribunal,
        magi: this.magi,
        companions: this.companions,
        grogs: this.grogs,
      }
    }
  }

  /**
   * Parsecovenant from JSON.
   * @param {string} [key=""] The current element key. If the element is an intannce of an Array,
   * the key is a string representation of an index. An empty strign indicates the value contains the
   * whole recovered POJO.
   * @param {number|string|Array|object|date|null|undefined} value The value of the key. If the key is empty, the value of whole object.
   * @returns {number|string|Array|object|date|null|undefined} The JSONiffied value. If this is undefined,
   * the key is removed from the JSON.
   */
  static parseJSON(key, value) {
    if (key) {
      return value;
    } else {
      // value contains the POJO
      if (value.people) {
        // Registry exists - reviving the values
        const revert = (person) => {
          if (Number.isInteger(person)) {
            return value.people.fetch(person);
          } else {
            return person;
          }
        };
        value.magi = value.magi.map(revert);
        value.grogs = value.grogs.map(revert);
        value.companions = value.companions.map(revert);
      }

      return new Covenant(value);
    }
  }
}