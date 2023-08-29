
import {getArts, getForms, getTechniques, createArt, createTechnique,
  ArtType, createForm, FORM, TECHNIQUE} from './modules.art.js';
  
import {modifier, multiplier} from './modules.rules.js';

/**
 * Create a new tribunal.
 */
export function createTribunal(name, covenants = [], magi = []) {
  return {
    name: name,
    covenants: [...covenants],
    magi: [...magi]
  };
}

/**
 * a regular expression matching to
 * a vis amount. The regular expression
 * has two unnamed groups. The first
 * matches to amount, and second to art.
 * @type {RegExp}
 */
export const VIS_AMOUNT = new RegExp('(\\d+)\\s+(' +
  getArts().map((art) => (art.abbrev)).join('|') +
  ')');

/**
 * Every visAmount represents an amount of a single art vis in pawns.
 */
export class visAmount {
  /**
   * Create a vis amount.
   * @param {number} amount The qmount of Vis.
   * @param {Art|string} art The art of the vis.
   */
  constructor(amount=1, art="Vi") {
    this.amount = amount;
    if (art instanceof Art) {
      this.art = art;
    } else {
      this.art = getArts().filter( name => (art.name === name || art.abbrev === name) )[0];
    }
    if (this.art == null) {
      throw new Error("Missing art");
    }
  }
    
  toString() {
    if (this.amount == 1) {
      return `${this.art.abbrev}`;
    } else {
      return `${this.amount}${this.art.abbrev}`;
    }
  }
  
  
    
  /**
   * Parse a string representation.
   * @param {string} source The parsed vis amount.
   * @return {visAmount} The parsed vis amount.
   * @throws {Error} The given string was not a proper vis amount.
   */
  static parse(source) {
    const matcher = VIS_AMOUNT.exec(source);
    if (matcher && matcher.index == 0 && VIS_AMOUNT.lastIndex == source.length) {
      return this.getFromExec(matcher);
    } else {
      throw new Error('Invalid vis amount');
    }
  }
  
  /**
   * Create a vis amount from regular expression match array.
   * If the matcher contains named groups "amount" and "art", they are used to define vis amount.
   * Otherwise, the first two matching groups define the amount and the art.
   * @param {Array|null} matcher - the handled match.
   * @return {visAmount|undefined} If the matcher matched a vis amount, the vis amount is returned. Otherwise, an undefined value is returned.
   */
  static getFromExec(matcher) {
    if (matcher instanceof Array) {
      if (matcher.groups != null && ["amount", "art"].every(name => name in matcher.groups)) {
        return new visAmount(
          (amount == null || amount === ""? 1 : Number.parseInt(matcher.groups.amount)),
          matcher.groups.art)
        ;
            
      } else if (matcher.length > 2) {
        return new visAmount(
          (matcher[1] === "" ? 1 : Number.parseInt(matcher[1])),
          matcher[2]
          );
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }
}

/**
 * Class representing multiple vis amounts.
 */
export class visAmounts {
  constructor(contents=[]) {
    if (contents) {
      this.contents = contents.map(
        amount => {
          if (amount instanceof visAmount) return amount;
          else return visAmount.parse(amount);
        }
        );
    } else {
      this.contents = [];
    }
  }

  
  /**
   * Get value of members matching the filter.
   * @param {Predicate<visAmount>} filter The function counted members must pass.
   * @default A filter passing all members.
   * @return {number} The integer number of the total pawns matching the filter.
   */
  totalValue(filter=()=>true) {
    return this.contents.filter(filter).reduce(
      (result, member) => {
        return result += member.amount;
      },
      0
    );
  }
}

/**
 * A vis container is a physical item storing vis.
 */
export class visContainer extends visAmounts {
  constructor(name, shape, material={name: 'wood', baseCapacity: 1}, size=1, capacity=undefined, ...amounts) {
    super(amounts);
    this.name = name;
    this.shape = shape;
    this.material = marerial;
    this.capacity = (capacity ? int(capacity) : material.baseCapacity * size);
  }
  
  /**
   * Get the available capacity.
   * @returns {number} The number of pawns the container may still store.
   */
  availableCapacity() {
    return this.capacity - this.totalValue();
  }
  
  /**
   * @param {Item} item The item storing the vis.
   * @param {number} [capacitt] The capacity of the container. Defaults to the capacity of the item.
   * @param {List<visAmounts>} the vis amounts stored in the container.
   */
  static create(item, capacity=undefined, ...visAmounts) {
    
  }
}

export class roll {
  
  constructor(sides=6, count=1, modifiers=[]) {
    this.count = count;
    this.sides = sides;
    this.modifiers = modifiers;
  }
    
  roll() {
    var result = {
      value: 0,
      dice: []
    };
    if (this.sides instanceof Array) {
      var sideCount = this.sides.length;
      for (var i=0; i < this.count; i++) {
      var roll = this.sides[Math.floor(Math.random()*sideCount)];
      result.dice.push(roll);
      if (typeof roll === "number") {
        result.value += roll;
      } else {
        result.value += roll.value;
      }
      }
    } else {
      var sideCount = this.sides;
      for (var i=0; i < this.count;i++) {
        var roll = (Math.floor(Math.random()*sideCount)+1);
        result.value += roll;
        result.dice.push(roll);
      }
    }
  }
}

function visContainerMapper( container, index, list ) {
  switch (typeof container) {
    case "string": 
      // Parse
      
    case "object":
      // One of object types
    default:
      // Unknown type
      return null;
  }
}

/**
 * A vis source implies a single
 * source of vis.
 */
export class visSource {
  constructor(name, amount=1, containers=[]) {
    this.amount = amount;
    this.containers = containers.map(visContainerMapper);
  }
  
  harvest() {
    const result = [];
    if (typeof amount === "number") {
      
    } else if (amount instanceof roll) {
      var roll = amount.roll();
      if (this.containers) {
        
      } else {
        result,push(VisContainer.create(roll.value, arts.vim))
      }
      result.push();
    }
    return result;
  }
}

export function createVisSource(
  name, arts, amount, value=undef) {
  return
}

export function createCovenant(name, magi=[], companions=[], grogs=[], library=[], vis=[]) {
  
  // TODO: create method
  const visStores = {
    totals: {},
    contents: [],
  };
  const visSources = {
    owned: [],
    contested: [],
    hidden: [],
  }
  vis.forEach(
    entry => {
      if (entry instanceof visSource) {
        
      } else if (entry instanceof visAmount) {
        if (entry.art.name in visStores.totals) {
          visStore.totals[entry.art.name].amount += entry.amount;
        } else {
          visStores.totals[entry.art.name] = new visAmount(entry.amount, entry.art)
        }
      } else if (entry instanceof visContainer) {
        
      }
    }
  );
  
  
  return {
    name: name,
    members: {
    magi: [...magi],
    companions: [...companions],
    grogs: [...grogs],
    },
    resources: {
      wealth: [],
      items: {
        mundane: [],
        magical: [],
      },
      library: {
        "public": [],
        peregrinatores: [],
        restricted: [],
      },
      vis: {
        stores: visStores,
        sources: visSources
      }
    }
  };
}

export function getTribunals() {
  return [
    createTribunal('Rhine'),
    createTribunal('Rome'),
    createTribunal('Greater Alps'),
    createTribunal('Iberia', [
      createCovenant('Jaferia'),
      createCovenant('Barcelona')
      ])
  ];
}


