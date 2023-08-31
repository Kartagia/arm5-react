import Covenant  from './modules.covenant.js';

/**
 * Create a new covenant.
 */
export function createCovenant(name, {...options}) {
  const {magi = [], companions = [], grogs = [], library = [], vis = [], id = undefined} = options;
  if (id != null && fetchCovenant(id) != null) {
    throw new Error("Identifier already reserved");
  }
  let result = new Covenant({name, magi, companions, grogs, library, vis, id: (id || createId())});
  return result;
}


/**
 * The in memory cache of covenants.
 */
const covenants = [];
createCovenant('Fengheld', {id: createId()});
createCovenant('Jaferia');
console.log(`Covenants: ${covenants}`);


function getCovenantId(covenant) {
  return covenant ? (covenant.id || createId()) : undefined;
}

/**
 * The next identifier.
 */
var nextId = 1;

/**
 * Produce an unique id.
 * @return An unique id for a covenant.
 */
function createId() {
  
  let result = `covenant${nextId++}`;
  do {
    if (nextId >= Number.MAX_SAFE_INTEGER) {
      throw new Error("Id supply exhausted");
    }
    result = nextId++;
  } while (fetchCovenant(result) != null); 
  return nextId++;
}

/**
 * Get all covenants.
 * @param {Preficate<Covenant>} [filter] The filter selecting covenants. Defaults to all covenants.
 */
export function getCovenants(filter = null) {
  return covenants.filter((filter ? filter : (value) => (true)));
}

/**
 * Fetch covenant with id.
 * @param {string} id the covenant identifier.
 */
export function fetchCovenant(id) {
  return covenants.find((c) => (c.id === id));
}

export function getCovenant(index) {
  switch (typeof index) {
    case "string":
      index = Number.parseInt(index);
    case "number":
      return (Number.isInteger(index) ? covenants[index] : null);
    default:
      return null;
  }
}

export function updateCovenant(id, covenant) {
  console.log(`Updating covenant ${id}`);
  const target = fetchCovenant(id);
  if (target) {
    for (key in covenant) {
      console.log(`Covenant ${id}: Update ${key} from [${target[key]}] to [${covenant[key]}]`)
      target[key] = covenant[key];
    }
    console.log("Update completed")
  } else {
    console.log(`Missing covenant $(id}`);
    throw Error("Missing covenant");
  }
}

export function deleteCovenant(id) {
  const index = covenants.findIndex( (c) => (c.id === id));
  if (index >= 0) {
    covenants.splice(index, 1);
    console.log(`Removed covenant ${id} at index ${index}`);
  }
}

export default {getCovenants, fetchCovenant, createCovenant, updateCovenant, deleteCovenant };