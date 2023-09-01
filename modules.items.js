import { multiplier } from './modules.rules.js';

/**
 * Shape and Material represents a modidier to mqgic.
 * 
 */
export class ShapeAndMaterial {


  constructor(name, ...modifiers) {
    this.name = name;
    this.smModifiers = [...modifiers];
  }

  getVisBaseCapacity() {
    return 0;
  }

  /**
   * Get the magic modifiers.
   * @return {Array<Modifier>} The shape and material modifiers.
   */
  getMagicModifiers() {
    return this.smModifiers;
  }
}

/**
 * Shape lacks vis storing capqcity.
 */
export class Shape extends ShapeAndMaterial {
  constructor(name, ...modifiers) {
    super(name, ...modifiers);
  }
}

/**
 * Material has vis storing capacity.
 * 
 */
export class Material extends ShapeAndMaterial {
  constructor(name, baseCapacity = 1, ...modifiers) {
    super(name, ...modifiers);
    this.baseCapacity = baseCapacity;
  }

  getVisBaseCapacity() {
    return this.baseCapacity;
  }
}

let sizeMultiplier = 1;
/**
 * Create an item vis capacity multiplier.
 * @param {string} name The name of the modifier.ä
 * @return {multiplier} the modifier multiplying the base capacity.
 */
function createModifier(name) {
  return new multiplier(name, sizeMultiplier++, "visCapacity");
}

/**
 * An enumeration of a named modifiers.
 * @readonly
 * @enum {Modifier} 
 */
export const ItemSizes = {
  tiny: createModifier("tiny"),
  small: createModifier("small"),
  medium: createModifier("medium"),
  large: createModifier("large"),
  huge: createModifier("huge")
}
/**
 * Component is a part of an item.
 */
export class Component {
  constructor(name, material, shape = undefined, size = ItemSizes.tiny) {
    this.name = name;
    this.shape = (shape instanceof Array ? shape : shape ? [shape] : []);
    this.materials = (material instanceof Array ? material : material ? [material] : []);
    this.size = size;
  }

  /**
   * 
   * @returns {Array<Material>} The materials of the component.
   */
  getMaterials() {
    return this.materials;
  }

  /**
   * Get the shapes of the component.
   * @returns {Array<Shape>} The shapes of the component. The most prominent shape is the first one.
   */
  getShapes() {
    return this.shapes;
  }

  /**
   * Get the primary shape of the component.
   * @returns {Shape|undefined} The primary shape of the item.
   */
  getShape() {
    return this.hasShape() ? this.getShapes()[0] : undefined;
  }

  /**
   * Get the number of shapes the component has.
   * @returns {number} The number of shpaes the item has.
   */
  get shapeCount() {
    return this.getShapes().length;
  }

  /**
   * Does the component have a shape.
   * @returns {boolean} Does the component has shape.
   */
  hasShape() {
    return this.shapeCount > 0;
  }

  getVisBaseCapacity(mode = Math.max) {
    return this.getMaterials().reduce(
      (result, material) => (
        mode(result, material)
      ), 0);
  }

  /**
   * Get the vis capacity of the item.
   * @param {Function} mode The method how to calculate the vis capacity of a compoud item. 
   * @returns {number} The number of pawns the item may store. This is also teh number of pawns
   * the opening of the item costs.
   */
  getVisCapacity(mode = Math.max) {
    return this.size.modify(this.getVisBaseCapacity(mode))
  }


  /**
   * Get the magical modifiers of the item.
   * @returns {Array<Modifier>} The magical modifiers of the item.
   */
  getMagicModifiers() {
    let result = super.getMagicModifiers();
    // TODO: counting shape and material bonuses
    [
      ...(this.getShapes().map((shape) => (shape.getMagicModifiers()))),
      ...(this.getMaterials().map((material) => (material.getMagicModifiers())))
    ].forEach(
      (modifier) => {
        if ((result[modifier.name] == null) || result[modifier.name].amount < modifier.amount) {
          result[modifier.name] = modifier;
        }
      });
    return result;
  }
}

/**
 * An item.
 */
export class Item extends Component {
  constructor(name, description,
    shape, material, size = ItemSizes.tiny, components = [], load = 0) {
    super(name, material, shape, size);
    this.components = components;
    this.load = load;
  }

  getVisCapacity(mode = Math.max) {
    return this.components.reduce(
      (result, component) => (mode(result, component.getVisCapacity(mode))),
      super.getVisCapacity());
  }

  getMagicModifiers() {
    let result = super.getMagicModifiers();
    [
      ...(this.components.map(
        (comp => (comp.getMagicModifiers()))
      ))
    ].forEach(
      (modifier) => {
        if ((result[modifier.name] == null) || result[modifier.name].amount < modifier.amount) {
          result[modifier.name] = modifier;
        }
      });
    return result;
  }
}