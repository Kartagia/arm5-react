import { getArts } from './modules.art.js';
import { Item } from './modules.items.js';
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
