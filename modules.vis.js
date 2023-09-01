import { getArts, Art, ArtType } from './modules.art.js';
import { Item, ItemSizes } from './modules.items.js';
import { modifier } from './modules.rules.js';

/**
 * A spell guideline is used to determine the effects of the spells and effects.
 */
export class SpellGuideline {

  /**
   * Create a new spell guideline.
   * @param {string|DocumentFragment|Node} description The descripion of the spell.
   * @param {number|undefined} [baseLevel] The base level of the guideline. 
   * If this value is undefined, the  spell is a generic spell. 
   * @param {boolean} [ritual=false] Does the guidelien require ritual.
   * @param {Range} [range] The base range of the effect.
   * @param {Duration} [duration] The base duration of the effect.
   * @param {Target} [target] The base target of the effect.
   * 
   */
  constructor(description, baseLevel, {
    ritual = false, range = undefined, duration = undefined, target = undefined }) {
    this.description = description;
    this._baseLevel = baseLevel;
    this._isRitual = ritual;
    this._range = range;
    this._duration = duration;
    this._target = target;
  }

  /**
   * The base level of the guideline.
   * @return {number} The base level of the guideline. 0 indicates the spell is 
   * a generic spell.
   */
  get level() {
    return (this._baseLevel == null ? 0 : this._baseLevel);
  }

  /**
   * Is the spell generic spell.
   * @type {boolean}
   */
  get isGeneric() {
    return this._baseLevel == null;
  }

  get isRitual() {
    return this._isRitual;
  }

  get baseRange() {
    return this._range || Ranges.personal;
  }

  get baseDuration() {
    return this._duration || Durations.momentary;
  }

  get baseTarget() {
    return this._target || Targets.individual;
  }
}

/**
 * Modifier of the effect magnitude.
 */
export class MagnitudeModifier extends modifier {
  constructor(name, amount) {
    super(name, amount, "magnitude");
  }
}

/**
 * RDTs are special kind of magnitude modifiers.
 */
export class RDT extends MagnitudeModifier {

  constructor(name, magnitudeModifier) {
    super(name, magnitudeModifier);
  }
}

export class Range extends RDT {
  constructor(name, magnitudeModifier) {
    super(name, magnitudeModifier);
  }
}

let magnitudeModifier = 0;
/**
 * @enum {Range}
 */
const Ranges = {
  personal: new Range("Personal", magnitudeModifier++),
  eye: new Range("Eye", magnitudeModifier),
  touch: new Range("Touch", magnitudeModifier++),
  voice: new Range("Voice", magnitudeModifier),
  reach: new Range("Reach", magnitudeModifier++),
  sight: new Range("Sight", magnitudeModifier++),
  arcane: new Range("Arcane Connection", magnitudeModifier)
}

export class Duration extends RDT {

  constructor(name, magnitudeModifier) {
    super(name, magnitudeModifier);
  }
}

magnitudeModifier = 0;
/**
 * Durations.
 * @enum {Duration} 
 */
const Durations = {
  momentary: new Range("Momentary", magnitudeModifier++)
}

export class Target extends RDT {
  constructor(name, magnitudeModifier) {
    super(name, magnitudeModifier);
  }
}

magnitudeModifier = 0;
/**
 * Targets of the spell.
 * @enum {Target}
 */
const Targets = {
  individual: new Target("Individual", magnitudeModifier++),
  part: new Target("Part", magnitudeModifier++)
}

export class Size extends RDT {
  constructor(amount) {
    super("Size", amount);
  }
}

export const RequisiteType = {
  Mandatory: MagnitudeModifier("Mandatory", 0),
  Optional: MagnitudeModifier("Optional", 1),
  Cosmetic: MagnitudeModifier("Cosmetic", 0),
  Casting: MagnitudeModifier("Casting", 0)
}

export class ArtRequisite {

  /**
   * A requiste of an art.
   * @param {Art} art The target art.
   */
  constructor(art, type = RequisiteType.Mandatory) {
    this.art = art;
    this.type = type;
  }

  toString() {
    return `${this.type.amount} ${this.art.name} ${this.type.name} Requisite`;
  }

  modify(magnitude) {
    return this.type.modify(magnitude);
  }

  /**
   * Modify the art total by the requisite.
   * @param {number} total The art total. 
   * @param {object} arts The art values.
   * @returns {number} The given total modified by the requisite.
   */
  modifyArts(total, arts) {
    if (this.type === RequisiteType.Cosmetic) {
      return total;
    } else if (this.art.name in arts) {
      return Math.min(total, arts[this.art.name]);
    } else if (this.art.abbrev in arts) {
      return Math.min(total, arts[this.art.abbrev]);
    } else {
      return total;
    }
  }
}

/**
 * Effect represents a singel effect.
 */
export class Effect {

  /**
   * Create new effect
   * @param {string} name The name of the effect.
   * @param {string|Array<string>|Node|DocumentFragment} description The description of the effect.
   * @param {Form} form The primary form.
   * @param {Technique} technique The primary technique.
   * @param {Array<ArtRequisite>} [requisites=[]] The requisites of the effect.
   * @param {Array<RDT>} [rdts=[Ranges.touch, Durations.momentary, Targets.individual]] The RDTs of the spell. 
   * @param {SpellGuideline|Array<Guideline>} baseEffect The guideline of the effect.
   * @param {number} [totalLevel] The total level. 
   */
  constructor(name, description, technique, form, requisites = [], rdts = [], baseEffect = undefined, totalLevel = undefined, modifiers = []) {
    this.name = name;
    this.description = description;
    this.technique = technique;
    this.form = form;
    this.requisites = [...(requisites)];
    this.baseEffect = baseEffect;
    this.totalLevel = totalLevel;
    this.rdts = [...rdts];
    if (this.rdts.find((range) => (range instanceof Range)) == null) {
      this.rdts.unshift(this.baseEffect == null ? Ranges.personal : this.baseEffect.baseRange);
    }
    if (this.rdts.find((duration) => (duration instanceof Duration)) == null) {
      this.rdts.unshift(this.baseEffect == null ? Durations.momentary : this.baseEffect.baseDuration);
    }
    if (this.rdts.find((target) => (target instanceof Target)) == null) {
      this.rdts.unshift(this.baseEffect == null ? Targets.individual : this.baseEffect.baseTarget);
    }
    this.otherModifiers = [...(modifiers)];
  }

  /**
   * The level total of the effect.
   * @return {number} The total level of the effect.
   */
  getLevelTotal() {
    if (this.totalLevel) {
      return this.totalLevel;
    }
    return this.getCalculatedTotal();
  }

  /**
   * Get the calculated total. 
   * @returns {number} The spell level calculated from the guideline and modifiers.
   */
  getCalculatedTotal() {
    // Calculating the level from guideline and modifiers.
    let baseMagnitude = this.constructor.calculateMagnitude(this.baseEffect ? this.baseEffect.level : 1);
    if (this.baseEffect) {
      baseMagnitude = [this.baseEffect.baseRange, this.baseEffect.baseDuration, this.baseEffect.baseTarget].reduce(
        (result, mod) => (result - mod.amount), baseMagnitude
      );
    }
    return this.constructor.calculateLevel([...this.rdts, ...this.otherModifiers].reduce(
      (result, modifier) => (modifier.modify(result)), baseMagnitude
    ));

  }

  get isRitual() {
    return this.baseEffect.isRitual;
  }

  /**
   * Is the effect valid.
   * @type {boolean}
   */
  get isValid() {
    return this.getLevelTotal() === this.getCalculatedTotal();
  }

  /**
   * Get the magnitude of the item.
   */
  getMagnitude() {
    return this.constructor.calculateMagnitude(this.getLevelTotal());
  }

  static calculateLevel(magnitude) {
    if (magnitude < 1) {
      return 4 - magnitude;
    } else {
      return 5 * magnitude;
    }
  }

  static calculateMagnitude(level) {
    return (level < 5 ? level - 4 : Math.ceil(level / 5));
  }


  getRDTString() {
    return `R: ${this.getRanges().map((rdt) => (rdt.name)).join("/")}, D: ${this.getDurations().map((rdt) => (rdt.name)).join("/")}, T: ${this.getRanges().map((rdt, index) => (index == 0 ? rdt.name + (this.size > 0 ? "(+" + this.size + ")" : "") : rdt.name)).join("/")
      }`;
  }

  getArtsString() {
    return `${this.technique.abbrev}${this.form.abbrev}`;
  }

  getTechiqueRequisites() {
    return this.requisites.filter((req) => (req.art.type === ArtType.TECHNIQUE));
  }

  getFormRequisites() {
    return this.requisites.filter((req) => (req.art.type === ArtType.FORM));
  }

  getRequisiteString(requisites) {
    return requisites.reduce(
      (result, req) => {
        const art = (req instanceof ArtRequisite ? req.art.abbrev : req);
        if (art == this.form.abbrev || art in result) {
          return result;
        } else {
          result.splice(result.findIndex((value) => (value > art)), 0, art);
        }
        return result;
      }, []).join("");
  }

  getRequisteString() {
    return `${this.getRequisiteString(this.getTechiqueRequisites())}${this.getRequisiteString(this.getFormRequisites())}`;
  }

  getEffectHeaderString() {
    const requisiteString = this.getRequisiteString();
    const otherMods = (this.isRitual ? "R" : "");
    return `${this.getArtsString()}${this.getLevelTotal()}${requisiteString ? "-" + requisiteString : ""}${otherMods ? "-" + otherMods : ""}, ${this.getRDTString()}`;
  }

}

/**
 * A power is an effect instilled to an item.
 */
export class Power {
  /**
   * Create a new power.
   * @param {string} name The name of the power
   * @param {Effect} effect The efect of the power.
   * @param {string} activation The description of the activation.
   * @param {Array<modifier>} modifiers The item modifiers.
   */
  constructor(name, effect, activation, modifiers = []) {
    this.name = name;
    this.effect = effect;
    this.activation = activation;
    this.levelModifiers = [...(modifiers)].filter((modifier) => (modifier.target == "level"));
    this.magnitudeMOdifiers = [...(modifiers)].filter((modifier) => (modifier.target == "magnitude"));
  }

  getRanges() {
    return this.rdts.filter((rdt) => (rdt instanceof Range));
  }

  getDurations() {
    return this.rdts.filter((rdt) => (rdt instanceof Duration));
  }

  getTargets() {
    return this.rdts.fitler((rdt) => (rdt instanceof Target));
  }

  /**
   * Get the total size modifier of the effect.
   */
  get size() {
    return this.rdts.reduce((result, rdt) => (rdt instanceof Size ? rdt.modify(result) : result), 0);
  }

  getLevelTotal() {
    return Effect.calculateLevel(this.effect.getLevel()) + this.levelModifiers.reduce((result, modifier) => (modifier.modify(result)), 0);
  }
  toString() {
    return `${this.name}(${this.effect.getEffectHeaderString()}):${this.description} (
      ${this.effect.isGeneric ? "Generic" : this.effect.baseEffect.level + "(base effect)"}${[...(this.rdts), ...(this.otherModifiers)].map((rdt) => (`+ ${rdt.amount} ${rdt.name}`)).join("")
      })`;
  }
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
export class VisAmount {
  /**
   * Create a vis amount.
   * @param {number} amount The qmount of Vis.
   * @param {Art|string} art The art of the vis.
   */
  constructor(amount = 1, art = "Vi") {
    this.amount = amount;
    if (art instanceof Art) {
      this.art = art;
    } else {
      this.art = getArts().filter(name => (art.name === name || art.abbrev === name))[0];
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
   * @return {VisAmount} The parsed vis amount.
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
   * @return {VisAmount|undefined} If the matcher matched a vis amount, the vis amount is returned. Otherwise, an undefined value is returned.
   */
  static getFromExec(matcher) {
    if (matcher instanceof Array) {
      if (matcher.groups != null && ["amount", "art"].every(name => name in matcher.groups)) {
        return new VisAmount(
          (matcher.groups.amount == null || matcher.groups.amount === "" ? 1 : Number.parseInt(matcher.groups.amount)),
          matcher.groups.art)
          ;

      } else if (matcher.length > 2) {
        return new VisAmount(
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
export class VisAmounts {
  constructor(contents = []) {
    if (contents) {
      this.contents = contents.map(
        amount => {
          if (amount instanceof VisAmount) return amount;
          else return VisAmount.parse(amount);
        }
      );
    } else {
      this.contents = [];
    }
  }


  /**
   * Get value of members matching the filter.
   * @param {Predicate<VisAmount>} filter The function counted members must pass.
   * Defaults to a filter passing all members.
   * @return {number} The integer number of the total pawns matching the filter.
   */
  totalValue(filter = () => true) {
    return this.contents.filter(filter).reduce(
      (result, member) => {
        return result += member.amount;
      },
      0
    );
  }
}


/**
 * @typedef {object} VisContainerProperties
 * @property {Item} [item] The item defining both shame and the material of the container.
 * @property {Shape} [shape] The shape of the container. 
 * @property {Material|Array<Material>} [maetrial] Either a single material or list of materials.
 * @property {number|ItemSizes} [size=tiny] The size of the container. 
 * @property {number} [capacity] The vis capacity of the item. The value defaults to the maetrial base
 * capacity muplitplied by size multiplier.
 * @property {Array<VisAmount>} [amounts=[]] The vis amounts stored into the container.
 */

/**
 * A vis container is a physical item storing vis.
 * @param {VicContainerProperties} prop0
 * @property {Item} [prop0.item] The item determining the shape and the materials.
 * @property {Shape} [props0.shape] The shape of the container.
 * @property {Material|Array<Maetrial>} [props0.material] The material or the list of materials of the container.
 * @property 
 */
export class VisContainer extends VisAmounts {
  constructor({ name, item, shape, material = { name: 'wood', baseCapacity: 1 }, size = ItemSizes.tiny, capacity = undefined, amounts = [] }) {
    super(amounts);
    this.item = item;
    this.name = name || (item != null ? item.name : undefined);
    this.shape = shape || (item != null ? item.shape : undefined);
    this.material = (material != null ? material : (item != null ? item.material : []));
    this.capacity = (capacity != null ? Number.trunc(capacity) : material.baseCapacity * size);
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
   * @param {List<VisAmounts>} the vis amounts stored in the container.
   */
  static create(item, capacity = undefined, ...visAmounts) {
    return new VisContainer({ item: item, capacity: capacity, amounts: [...visAmounts] });
  }

  /**
   * Tries to store the amount of vis.
   * @param {VisAmount} amount Stores the vis.
   * @param {boolean} [partial=false] Does the storing allow partial storing.
   * @return {VisAmount|undefined} The amount of vis not stored. An undefined
   * value indicates all vis was stored.
   */
  storeVis(amount, partial = false) {
    if (amount && +amount > 0) {
      if (+amount <= this.availableCapacity()) {
        // Storing the amount.
        super.contents.push(amount);
        return undefined;
      } else if (partial) {
        // Performing partial storing.
        const storedAmount = new VisAmount(Math.min(this.availableCapacity, +amount), amount.art);
        super.contents.push(storedAmount);
        return new VisAmount(+amount - +storedAmount, amount.art);
      } else {
        return amount;
      }
    }
  }
}

export class ItemContainer extends Item {

  constructor(item) {
    super(item.name, item.desc, item.shape, item.material, item.size, item.components, item.load);

  }


}

export class PreparedItem extends ItemContainer {

  constructor(item, mode = Math.max) {
    super(item);
    this.mode = mode;
    this.effects = [];
  }

  getVisCapacity() {
    return super.getVisCapacity(this.mode);
  }

  getAvailableCapacity() {
    return this.getVisCapacity() - this.getPowers().reduce((result, effect) => (result + Math.ceil(effect.getLevelTotal() / 10)), 0);
  }

  getPowers() {
    return this.effects.filter(() => true);
  }


  /**
   * Add power to the tiem.
   * @param {Power} power the power added to the item. 
   * @returns {number} The number of pawns spent.
   */
  addPower(power) {
    const result = Math.ceil(power.getLevelTotal() / 10);
    if (result <= this.getAvailableCapacity()) {
      this.effects.push(power);
      return result;
    } else {
      return 0;
    }
  }

  removePower(power) {
    const index = this.effects.findIndex((effect) => (effect !== power));
    if (index != null) {
      const result = this.effects.splice(index, 1);
      return (result ? Math.ceil(result.getLevelTotal() / 10) : 0);
    } else {
      return 0;
    }
  }
}

export default { VisAmount, VisContainer };
