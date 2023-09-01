
import Covenant from "./modules.covenant";
// eslint-disable-next-line no-unused-vars
import { HermeticArts, Art } from "./modules.art";
// eslint-disable-next-line no-unused-vars
import { VisContainer, VisAmount } from "./modules.vis";
// eslint-disable-next-line no-unused-vars
import { dieRoll, complexResult } from "./modules.rules";

/**
 * Create a new tribunal.
 * @param {string} name The name of the tribunal
 * @param {Array<Covenent|string>} [covenants=[]] The covenants of the tribunal.
 * @param {Array<Person>} [magi=[]] The magi of the tribunal. 
 */
export function Tribunal(name, covenants = [], magi = []) {
  return {
    name: name,
    covenants: [...covenants],
    magi: [...magi]
  };
}


// eslint-disable-next-line no-unused-vars
function visContainerMapper(container, _index, _list) {
  switch (typeof container) {
    case "string":
    // Parse

    // eslint-disable-next-line no-fallthrough
    case "object":
    // One of object types
    // eslint-disable-next-line no-fallthrough
    default:
      // Unknown type
      return null;
  }
}

/**
 * A vis source implies a single
 * source of vis.
 * @param {string} name The name of the vis source.
 * @param {VisAmount|number} [amount=1] The amount of harveted vis.
 * @param {Art} [art] The art of the vis. This is required, if the amount
 * is a number.
 */
export class visSource {
  constructor(name, amount = 1, art = undefined) {
    this.amount = amount;
    this.name = name;
    this.art = art;
    if (typeof amount === "number" && (!(art instanceof Art))) {
      throw new TypeError("Art must be defined, if amount is a nubmer!")
    }
  }

  /**
   * Harvest the source.
   * @param {VisContainer} [item] The item into which the vis is stored.
   * @returns {Array<VisContainer|VisAmount>} If the item was provided, or the source 
   *   does not provide vis container, the amount of vis harvested. Otherwise the 
   *   vis container containing the vis.
   */
  harvest(item = undefined) {
    const result = [];
    let amount = 0, art = this.art;
    if (typeof this.amount === "number") {
      amount = this.amount;
    } else if (this.amount instanceof dieRoll) {
      var roll = this.amount.roll();
      amount = roll.value;
    }

    if (item) {
      result.push(item);
    }
    if (item) {
      let storedAmount = Math.min(item.availableCapacity(), amount);
      if (storedAmount > 0) {
        item.storeVis(new VisAmount(storedAmount, art));
        amount -= storedAmount;
      }
    }
    if (amount > 0) {
      // Storing the vis to the containers of the source.
      let visAmount = new VisAmount(amount, art);
      if (this.container) {
        visAmount = (this.container instanceof Array ? this.container : [this.container]).reduce(
          (remainder, storage) => {
            if (+remainder > 0) {
              let amount = storage.storeVis(remainder, true);
              if (amount == null || +amount < +remainder) {
                // Adding the storage storing some vis.
                result.push(storage);
              }
            } else {
              return remainder;
            }
          }, visAmount);
        if (visAmount) {
          result.push(visAmount);
        }
      } else {
        result.push(visAmount);
      }
    }
    return result;
  }
}

export function createVisSource(
  // eslint-disable-next-line no-unused-vars
  _name, _arts, _amount, _value = undefined) {
  return
}


/**
 * Get the tribunals. 
 * @returns {Array<Tribunal>} The tribunals.
 */
export function getTribunals() {
  return [
    new Tribunal('Rhine'),
    new Tribunal('Rome'),
    new Tribunal('Greater Alps'),
    new Tribunal('Iberia', [
      new Covenant('Jaferia'),
      new Covenant('Barcelona')
    ])
  ];
}


