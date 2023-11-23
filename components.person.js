import { useState, Fragment, DocumentFragment } from 'react';
import { Covenant as CovenantModel } from './modules.covenant.js';
import { getList } from "./module.utils.js";

export const Covenant = (props) => {
  const [magi, setMagi] = useState(getList(props, "magi", ["value", "magi"], []))
  if (props.parent != null) {
    return (<article>{props.name}</article>);
  } else {
    const updateList = (change) => {
      if (change instanceof Function) {
        setMagi(change);
      }
    };
    return (<div>{props.name || props.value.name}
      <section>
        <header>Magi</header>
        <main>{
          (props.magi || (props.value && props.value.magi) || []).map(
            (person) => (<Person value={person} onChange={updatePerson} />)
          )
        }</main>
      </section></div>);
  }
};

export function chooseProp(source, choices, options = {}) {
  if (source instanceof Object) {
    if (choices instanceof Array) {
      const result = choices.reduce(
        (acc, key, index) => {
          if (acc.done) { return acc; }
          if (acc.value instanceof Object) {
            // Checking key
            try {
              const val = getValueOfProp(acc.value, key, options);
              if (val) {
                return { value: val, done: true };
              } else {
                return acc;
              }
            } catch (error) {
              if (options.lenient) {
                return acc;
              } else {
                return { error, done: true };
              }
            }
          } else if (options.lenient) {
            return acc;
          } else {
            return {
              error: TypeError(`Invalid key[${index}]`),
              done: true
            }
          }
        }, { value: source });
      // Handle result
      if (result.error) {
        if (options.lenient) {
          return undefined;
        } else {
          throw result.error;
        }
      } else {
        return result.value;
      }
    } else if (choices in source) {
      return source[choices];
    }
  } else if (options.lenient) {
    return undefined;
  } else {
    throw new TypeError(`Invalid ${options.sourceName || "source"}`);
  }
}

/**
 * Get value of props using key chain.
 * @param {Object|Array} source The property source.
 * @param {string|Array<string>} keys The key chain.
 * @param [options={}] Options.
 */
export function getValueOfProp(source, keys, options = {}) {
  if (source instanceof Object) {
    const result = (
      keys instanceof Array ? keys : []).reduce(
        (result, key, index) => {
          if (result.done) {
            return result;
          }


          if (result.value instanceof Object) {
            if (key in result.value) {
              return { value: result.value[key] };
            } else {
              return { value: undefined, done: true };
            }

          } else {
            return {
              error: TypeError(`Invalid value at keys[${index}]`),
              done: true
            };
          }
        }, { value: source, error: TypeError("Empty key") }
      )
    if (result.error && !options.lenient) {
      throw result.error;
    }
    return (result.error ? undefined : result.value);
  } else {
    throw TypeError("Invalid source");
  }
}



/**
 * Ability component.
 */
export const Ability = (props) => {
  const name = chooseProp(props, "name", ["value", "name"]);
  const score = chooseProp(props, "score", ["value", "score"]);
  const xp = chooseProp(props, "xp", ["value", "xp"]);
  return (
    <div className={"Ability"}>
      <div className="name">{name}</div>
      <div className="score">{score}</div>
      <div className="xp">{xp}</div>
    </div>
  );
}

export const Art = (props) => {
  const [art, setArt] = useState(() => ({
    name: (props.name || props.value.name),
    level: (props.level || props.value.level),
    xp: (props.xp || props.value.xp)
  }));

  return (
    <div className={"Art"}>
      {
        (props.mode === "form" ?
          (
            <DocumentFragment>
              <input name={"name"} type={"text"} value={art.name} readonly />
              <input name={"score"} type={"number"} min={0} value={art.score} />
              <input name={"xp"} type={"number"} min={0}
                value={art.xp} />
            </DocumentFragment>)
          : (<DocumentFragment>
            <div className={"Art"}>
              <div className="name">{art.name}</div>
              <div className="score">{art.score}</div>
              <div className="xp">{art.xp}</div>
            </div>
          </DocumentFragment>))
      }
    </div>
  );
}


export default {
  Ability,
  Art
};