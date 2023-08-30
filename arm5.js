
import {getArts, getForms, getTechniques, createArt, createTechnique,
  ArtType, createForm, FORM, TECHNIQUE} from './modules.art.js';
/* Covenants */
import covenants from './modules.covenant.js';
  
import {modifier, multiplier} from './modules.rules.js';

/* Vis */
import vis from './modules.vis.js';

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


