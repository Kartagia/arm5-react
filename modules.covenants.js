import Covenant  from './modules.covenant.js';


/**
 * Identifier generator.
 * @param {number} [id=1] The first identifier.
 * @param {number} [max=Number.MAX_SAFE_INTEGER] The smallest id nonlonger returned.
 */
function *nextId(id=1, max=Number.MAX_SAFE_INTEGER) {
  while (id < max) {
    yield id++;
  }
  return undefined;
}
/**
 * Apply changes to the target.
 * If the taget is a map, the changes affect the map entries instead of object properties.
 * 
 * @param {object} target of the changes.
 * @param {Map|Array|Function|object} changes The changes to the target.
 * @throws {TypeError} The target was not an object.
 */
export function applyChanges(target, changes) {
  if (typeof target === "object") {
    if (changes instanceof Array) {
      changes.forEach(change => {
        applyChanges(target, change);
      })
    } else if (changes instanceof Function) {
      changes(target);
    } else if (changes instanceof Map) {
      changes.forEach((prop, val) => {
        if (target instanceof Map) {
          target.set(prop, val);
        } else {
          target[prop] = val;
        }
      })
    } else if (typeof changes == "object") {
      for (var prop in changes) {
        if (target instanceof Map) {
          target.set(prop, val);
        } else {
          target[prop] = val;
        }
      }
    }
  } else {
    throw new TypeError("Missing covenant");
  }
}

const getMaxId = (result, value, index, arr) => {
  if (value && Number.isInteger(value.id) && value > result) {
    return value;
  }
  return result;
}
/**
 * The data access object of the 
 * covenants.
 */
export class CovenantDAO {
  constructor(content=[]) {
    this.contents = [...(content)];
    const firstId = this.contents.reduce(getMaxId, 0)+1;
    this.idGen = nextId(firstId);
    console.log(`Created DAO<Covenant> with ${firstId} and ${this.contents}`);
  }
  
  create({...param}) {
    console.log(`Create covenant: `, ...param);
    let created = new Covenant(...param);
    if (created) {
      if (created.id == null) {
        // Generating id.
        let result;
        do {
          result = this.idGen.next().value;
        } while (result != null && this.retrieve(result) != null);
        created.id = result;
      } else if (this.retrieve(created.id)) {
        throw new Error("Cannot create an existing covenant");
      }
      this.content.push(created);
      return created;
    }
    return undefined;
  }
  
  remove(id) {
    this.contents = this.contents.filter( (c) => (c.id === id));
  }
  
  retrieve(id) {
    return this.contents.find( (c) => (c.id === id));
  }
  
  update(id, changes) {
    let target = this.retrieve(id);
    applyChanged(target, changes);
    return target;
  }
  
  filter(predicate) {
    return this.contents.filter(predicate);
  }
  
  /**
   * Get all contents.
   */
  all() {
    return this.filter(() => true)
  }
}

/**
 * The default export is the default
 * DAO.
 */
export default new CovenantDAO();