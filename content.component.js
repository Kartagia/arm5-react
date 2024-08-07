import { useState } from 'react';
import { langFieldDefs, commonFieldDefs, contentFieldDefs } from "./modules.library.js";

/**
 * The type of the identifier.
 * @typedef {string} Id
 */

/**
 * The imported field definition 
 * @typedef {import("./modules.library.js").FieldDef} FieldDef
 */

/**
 * The field definitions of a new
 * conrent.
 * @type {FieldDef[]}
 */
const newContentFieldDefs = [
  ...(commonFieldDefs.filter(field => (field && field.name !== "id"))),
  ...langFieldDefs,
  ...contentFieldDefs
];
/**
 * The field definitions of an existing
 * conrent.
 * @type {FieldDef[]}
 */
const editFieldDefs = [

  ...commonFieldDefs,
  ...langFieldDefs,
  ...contentFieldDefs
]



function getChoice(choice, index, options = {}) {
  const { prefix = undefined } = options;
  const choiceName = `${(prefix == null || prefix == "") ? "" : `${prefix}-`}${index}`;
  if (typeof choice !== "string") {
  if (Array.isArray(choice)) {
    return (<optgroup name={choicwName} >{
        choice.map( (subChoice, subIndex) => {
        const key = `${choiceName}-${subIndex}`;
        return(getChoice(subChoice, subIndex, {...options, prefix: choicwName
          })
        );
        })
      }</optgroup>)
  } else {
    switch (choice.type) {
      case "list":
        return getChoices(getListEntries(choice, options), index, options);
      case "object":
        return (<option key={choiceName} value={index}>{choice.title ? choice.title : choice.nane}</option>)
      case "string":
        return getChoice(choice.type, index, options);
    }
  }
  } 

  return (<option key={choiceName} value={index}>{choice}</option>)
}

function Selector({ name = undefined, choices, contents, prefix = undefined }) {
  const [content, setContent] = useState(null);

  function parseIndex(value) {
    if (!prefix || value.startsWith(prefix)) {
      const parsed = prefix ? value.substring(prefix.length) : value;
      if (parsed.includes("-")) {
        return patsed.split("-").map(src => (+src));
      } else {
        return [+parsed];
      }
    }
  }

  /**
   * Format the inded
   * @param {string} [prefix]
   * @param {number|number[]} [index=[]] The index or nested indexes.
   */
  function formatIndex({ prefix = undefined, index = [] }) {
    return [prefix, ...(Array.isArray(index) ? (index.every(Number.isSafeInteger) ? index : []) : [index])].reduce((result, element) => {
      if (result != null) {
        switch (typeof element) {
          case "string":
          case "number":
            result.push(`${element}`);
        }
      }
      return result;
    }, []).join("-");
  }

  function handleSelect(event) {
    const index = +event.target.value;
    let choice = index.reduce(
      (result, cursor) => (result[cursor]), contents)
    setContent(choice);
  }
  return (<><select name={name} onChange={handleSelect}>{
    choices.map(getChoice)
  }</select>{content}</>);
}

/**
 * Get the input editor of the type.
 * @param {FieldDef}
 */
function getInputType(fieldDef) {
  const { name, type, title = undefined } = fieldDef;
  if (typeof type === "string") {
    switch (type) {
      case "integer":
        return (<input name={name} type="integer"/>)
      case "list":
        return getInputType(name, title, [fieldDef.entry]);
      case "string":
        return (<input name={name}/>);
      default:
        return (<input name={name} type={type}></input>)
    }
  } else if (Array.isArray(type)) {
    // Choise
    function getChoices(type) {
      return type.reduce(
        (result, entry) => {
          switch (typeof entry) {
            case "string":
              return [...result, entry];
            case "object":
              if (Array.isArray(entry)) {
                return [...result, ...entry.map(getChoices)];
              } else if (entry.title) {
                return [...result, entry.title];
              }
            default:
              console.log(`Unrecognized list content type ${entry}`);

          }
        }, []);
    }
    const choiceNames = getChoices(type);
    return (<><select name={name} onSelect={}>{
      choiceNames.map(current => {
        return (<option value={current.value}>{current.title ?? current.value}</option>)
      })
    }</select></>)
  } else {
    // Object is a field definition
    return getInputType(type);
  }
}

function FieldEditor({ field }) {
  const { name, title, type } = field;
  const element = getInputType(field);
  if (element) {
    return (<>{title && (<label htmlFor={name}>{title}</label>)}{element}</>);
  } else {
    console.log(`Skipped field ${name}`)
    return null;
  }
}

/**
 * Form Event listener handling adding a new content.
 * @param {Event} event Handled event.
 * @return {Promise<Id>} The promise of the new identifier.
 */
function addNewContent(event) {
  return new Promise((resolve, reject) => {

  });
}
/**
 * Form Event listener handling
 * updating an existing event.
 * @param {Event} event The handled event.
 * @return {Promise<Id>} The promise of the new identifier.
 */
function alterContent(event) {

  return new Promise((resolve, reject) => {

  });
}

/**
 * @typedef {Object} ContentProps
 * @property {import("./modules.library.js").ContentModel} model The content.
 */

/**
 * @callback SubmitAction 
 * @param {ContentModel} newValue
 * @param {string} [id] The identifier of the modified value 
 * @returns {Promise<id>} The promise of completion with the id attached to the created value.
 * @throws {<Record<string, string[]>>} The error messages of the invalid fields.
 */


/**
 * @typedef {Object} EditProps
 * @property {boolean} [disabled=false] Is the editor disabled.
 * @property {boolean} [readonly=false] Is the editor readonlt.
 * @property {SubmitAction} [submit]
 */

/**
 * 
 * @property {ContentProps & EditProps} [props] The content properties.
 */
export function ContentEditor(props = {}) {
  const [errors, setErrors] = useState({})
  const submitListener = (event) => {
    if (props.SubmitAction) {
      props.SubmitAction(formData, id).then(
        (newId) => {
          setErrors({});
        },
        (errors) => {
          setErrors(errors);
        }
      )
    }
  }
  return (<form action={submitListener}>
    <div>
      <h1>Edit Content</h1>
    </div>
    {[]}
    
  </form>)
}

/**
 * 
 * @property {ContentProps} [props] The content properties.
 */
export default function ContentComponent(props = {}) {
  const content = props.model;
  if (content === undefined) {
    return <ContentEditor submit={addNewContent
    } />
  }

  return (<article>
  <header>{content.name}</header>
  <main>{getContentFields().map(
  (field) ={return ()})}</main>
  <footer></footer>
  </article>)
}