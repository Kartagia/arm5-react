
/**
 * A class representing a covenant.
 */
export default class Covenant {
  
  constructor({name, id=null, magi=[], companions=[], grogs=[],  options}) {
    this.name = name;
    this.tribunal = options.tribunal;
    this.id = id;
    this.magi = [...magi];
    this.companions = [...companions];
    this.grogs = [...grogs];
    this.people = optional.peopleRegistry;
    
    //TODO: Library support
    //TODO: Resources support
  }
  
  toJSON(key="") {
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
        name: this.name,
        id: this.id,
        tribunal: this.tribunal,
        people: this.people,
        magi: this.magi.map(encoder),
        grogs: this.grogs.map( encoder ),
        companions : this.companions.map( encoder )
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
        value.magi = value.magi.map( revert);
        value.grogs = value.grogs.map(revert);
        value.companions = value.companions.map(revert);
      }
      
      return new Covenant(value);
    }
  }
}