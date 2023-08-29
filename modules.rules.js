import {UnsupportedError} from "./modules.exceptions.js";


export class modifier {
  constructor(name, amount, target = undefined) {
    this.name = name;
    this.amount = Number.parseInt(amount);
    this.target = target;
  }
  
  /**
   * @param {number} the modified number.
   * @return {number} the result of the modification.
   */
  modify(value) {
    return value + this.amount;
  }
  
  toString() {
    return `${this.name}[${this.amount}]`;
  }
}

/**
 * @callback NumericConversion
 * @param {number} value The converted number.
 * @return {number} The conversion result.
 * @throws {Error} The operation failed.
 */

function convertNumber(value, converter) {
  return (Number.isFinite(value) && Number.isNaN(value))? converter(value): value;
}
/**
 * Rounding methods.
 * @readonly
 * @type {NumericConversion}
 */
export const Rounding = {
  normal: value => Math.round(value),
  up: value => Math.ceil(value),
  down: value => Math.floor(value),
  none: value => value,
  even: value => convertNumber(value, (number) => ((number < 0) ^(number % 2 == 0) ? Math.floor(number) : Math.ceil(Number))),
  odd: value => (convertNumber(value, (number) => ((number < 0 ^ (number % 2 != 0))? Math.floor(number) : Math.ceil(Number)))),
  zero: value => (convertNumber(value, (number) => (value < 0 ? Math.ceil(value) : Math.floor(value)))),
  infinity: value => (convertNumber(value, (number) => (value > 0 ? Math.ceil(value) : Math.floor(value))))
};


/**
 * A multiplicative modifier.
 */
export class multiplier extends modifier {
  /**
   * Create a multiplier.
   * @param {string} name
   * @param {number} [amount=1]
   * @param {string} [target]
   * @param {Rounding} [rounding=Rounding.normal]
   */
  constructor(name, amount=1, target=undefined, rounding=Rounding.normal) {
    super(name, amount, target);
    this.rounding = rounding;
  }
  
  toString() {
    if (this.amount < 0) {
      return `${this.name}[x(${this.amount}])`;
    } else {
      return `${this.name}[x${this.amount}]`;
    }
  }
  
  modify(value) {
    return (this.rounding)(this.amount*value);
  }
}

export class die {
  
  /**
   * Roll the die.
   * @return {rollResult?}
   */
  roll() {
    return undefined;
  }
}

/**
 * A modifier altering a roll.
 */
export class rollModifier {
  
  /**
   * Modifies a roll result.
   * @param {rollResult} roll The modified roll.
   * @returns {rollResult} The modified roll result.
   */
  modify(roll) {
    return roll;
  }
}

/**
 * A complex die defines random base value combined with modifiers.
 * The base random is defined by a die, an array of dieResults, or by the number of the sides of a
 * simple die.
 * 
 * The result is modified with given
 * modifiers.
 */
export class complexDie extends die {
  /**
   * A complex die.
   * @param {Array<dieResult>|die|number} sides The definition of the base random value.
   * @param {Array<rollModifier>} ...mods The modifiers to the random result.
   */
  constructor(sides, ...mods) {
    super();
    this.sides = sides;
    this.mods = [...mods];
  }
  
  /**
   * @inheritdoc
   */
  roll() {
    let result = undefined;
    if (this.sides instanceof die) {
      result = this.sides.roll();
    } else if (this.sides instanceof Array) {
      result = this.sides[
        Math.floor(Math.random()*this.sides.length)];
    } else {
      let sideCount = number.parseInt(this.sides);
      if (Number.isFinite(sideCount)) {
        return 1 + Math.floor(Math.random()*sideCount);
      }
      
    }
    return new this.mods.reduce(
      (value, mod) => (mod.modify(value)), new rollResult(result, this));
  }
  
  toString() {
    if (typeof this.sides == "number") {
      return `d${this.sides}`;
    }
    return "" + this.result;
  }
  
}


/**
 * Simple die simulates a normal die with even number of equally probable sides.
 */
export class simpleDie extends die {
  
  
  /**
   * Create a simple die with numbers 1 to number of the sides.
   * @param {simpleDie|number} sides The number of sides the die has. 
   */
  constructor(sides=6) {
    super();
    if (typeof sides === "number") {
      this.sides = sides;
    } else if (sides instanceof simpleDie) {
      this.sides = sides.sides;
    } else {
      this.sides = 0 + sides;
    }
    if (this.sides < 2) {
      throw new RangeError("Dice must have at least 2 sides");
    }
  }
  
  /**
   * @inheritdoc
   */
  roll() {
    return new rollResult(1 + Math.floor(math.random()*this.sides), this);
  }
  
  toString() {
    return `d${this.sides}`;
  }
}

/**
 * Fixed die always produce same result.
 */
export class fixedDie extends die {
  
  constructor(value) {
    super();
    this._result = new dieResult(value, this);
    this._result.freeze();
  }
  
  get value() {
    return this._result.value;
  }
  
  roll() {
    return this._result();
  }
  
  toString() {
    return this.value;
  }
}

function createCombiner(combiner, defaultValue=undefined, initial = undefined) {
  return (a,b) => (
    (a == null)
    ? (b == null 
    ? defaultValue
    : a)
    : combiner(a,b)
    );
}

export const RollCombiners = {
  sum: (a,b) => createCombiner( (a,b) => {
    a.result = a.value + b.value;
    return a;
  }),
  best: (a,b) => createCombiner(
    (a,b) => {
      a.result = Math.max(a.value,b.value);
      return a;
    }),
  worst: (a, b) => createCombiner(
    (a, b) => {
      a.result = Math.min(a.value, b.value);
      return a;
    }),
}



export class rollResult {
  constructor(result, dice=undefined) {
    this._result = result;
  }
  
  get result() {
    return this._result;
  }
  
  set result(value) {
    this._result = value;
  }
  
  /**
   * The numeric value of the result.
   *@returns {number?} The numeric value of the result.
   */
  get value() {
    if (this.result instanceof dieResult) {
      return this.result.value;
    } else if (typeof this.result === "number") {
      return this.result;
    } else {
      return undefined;
    }
  }
  
  /**
   * @inheritdoc
   */
  valueOf() {
    return this.value;
  }
  /**
   * @inheritdoc
   */
  reroll() {
    if (this.dice instanceof die) {
      this.result  = this.dice.roll();
    } else {
      throw new UnsupportedError("Reroll not supported");
    }
  }
}

export class complexResult extends rollResult {
  
  constructor(aggregator, results=[]) {
    super();
    this.aggregator = aggregator;
    this.results = [...results];
  }
  
  get result() {
    if (this.results) {
      return this.results.reduce(
        this.aggregator);
    } else {
      return aggregator(undefined, undefined);
    }
  }
  
  reroll(index=null) {
    if (index == null) {
      // Rerolling all
    } else if (this.results[index]) {
      this.results[index].reroll();
    } else {
      throw UnsupportedError("Reroll not supported");
    }
  }
}

/**
 * A class representing a die roll.
 */
export class dieRoll {
  
  /**
   * Create a die roll.
   * @param {die[]} dice The dice rolled.
   * @param {rollModifier} modThe roll modifiers 
   */
  constructor(rollModifier=RollCombiners.sum, dice=[]) {
    this.rollModifier = rollModifier;
    this.dice = [...dice];
  }
  
  
  
  /**
   * Reroll the die.
   * @throws {UnsupportedError} the reroll is not supported.
   */
  roll() {
    return new complexResult(this.rollModifier, this.dice.map( (part) => (part.roll())));
  }
  
}