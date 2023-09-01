
/**
 * Create a new tribunal.
 */
export function Tribunal(name, covenants = [], magi = []) {
  return {
    name: name,
    covenants: [...covenants],
    magi: [...magi]
  };
}


function visContainerMapper(container, index, list) {
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
  constructor(name, amount = 1, containers = []) {
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
        result, push(VisContainer.create(roll.value, arts.vim))
      }
      result.push();
    }
    return result;
  }
}

export function createVisSource(
  name, arts, amount, value = undef) {
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


