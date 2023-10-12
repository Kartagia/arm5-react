''
export class Person {
  
}

export function personToString(person, registry=[]) {
  if (person instanceof Object) {
    return `${person.name}`;
  } else if (registry) {
    const result = registry.find( (p) => (p.id === person));
    if (result) {
      return `${result.name}`;
    } else {
      console.error(`Invalid person ref [${person}]`);
      return "Invalid person";
    }
  } else {
    return "Invalid person";
  }
}

/**
 * A class representing a covenant.
 */
export class Covenant {
  
  constructor({name, id=null, magi=[], companions=[], grogs=[],  ...options}) {
    this.name = name;
    this.tribunal = options.tribunal;
    this.id = id;
    this.magi = [...magi];
    this.companions = [...companions];
    this.grogs = [...grogs];
    this.people = options.people;
    
    //TODO: Library support
    //TODO: Resources support
    console.log(`Created covenant ${this.name}`);
  }
  
  /**
   * Convert the value to a JSON.
   */
  toJSON(key="") {
    // Characters are stored to
    // registry
    if (this.people) {
      // Encode people stored in registry
      const encoder = (person) => {
        if (person == null) {
          return null;
        } else if (person.id && this.people.find((p)=>((p.id != null) && (p === person)))) {
          return person.id;
        } else {
          return person;
        }
      };
      return JSON.stringify({
        name: this.name,
        id: this.id,
        tribunal: this.tribunal,
        people: this.people,
        magi: this.magi.map(encoder),
        grogs: this.grogs.map( encoder ),
        companions : this.companions.map( encoder )
      });
    } else {
      // Characters are stored in covenant
      return JSON.stringify({
        name: this.name,
        id: this.id,
        tribunal: this.tribunal,
        magi: this.magi,
        companions: this.companions,
        grogs: this.grogs,
      });
    }
  }
  
  static reviver(key, value) {
    if (key) {
      return value;
    } else {
      // value contains the POJO
      if (value.people) {
        // Registry exists - reviving the values
        const revert = (person) => {
          if (Number.isInteger(person)) {
            const result = value.people.find( (v) => (v && v.id === person));
            if (result) {
              return result;
            } else {
              throw SyntaxError(`No people found with id ${person}`);
            }
          } else if (person instanceof Object) {
            return person;
          } else {
            throw new TypeError(`Invalid person ${person}`);
          }
        };
        value.magi = value.magi.map( revert);
        value.grogs = value.grogs.map(revert);
        value.companions = value.companions.map(revert);
      }
      
      return new Covenant(value);
    }
  }
  
  static parseJSON(json) {
    return JSON.parse(json, this.reviver);
  }
  
  toString() {
    return `${this.name}(${this.magi.length} members)`;
  }
}

export default Covenant;