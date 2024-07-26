import {useState} from 'react';
import {langFieldDefs, commonFieldDefs, contentFieldDefs} from "./modules.library.js";

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

function Selector({name=undefined, choices, contents}) {
  const [content, setContent] = useState(null);
  function parseIndex(value) {
    if (value.includes("-")) {
      return value.split("-").map(value=>(+balue));
    } else {
      return [+value];
    }
  }
  function handleSelect(event) {
    const index = +event.target.value;
    let choice = index.reduce(
      (result, cursor) => (result[cursor]), contents)
    setContent(choice);
  }
  return (<><select name={name} onChange={handleSelect}>{
    choices.map( (choice, index) => {
    if (Array.isArray(choice)) {
      return (<optgroup key={`group-${index}`}>{
        choice.map( (subChoice, subIndex) => {
        const key = `${index}-${subIndex}`;
        return(
          <option key={key} value={key}>{subChoice}</option>
        );
        })
      }</optgroup>)
    }
    
     return (<option key={choice} value={index}>{choice}</option>)
    })
  }</select>{content}</>);
}

/**
 * Get the input editor of the type.
 * @param {FieldDef}
 */
function getInputType(fieldDef) {
  const {name, type, title=undefined} = fieldDef;
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
              return entry.map(getChoices);
            } else if (entry.title) {
              return [...result, entry.title];
            }
          default:
            console.log(`Unrecognized list content type ${entry}`);
            
        }
      }, []);
    }
    const choiceNames = getChoices(type);
    return (<><select name={name} onSelect={} /></>)
  } else {
    // Object is a field definition
    return getInputType(type);
  }
}

function FieldEditor({field}) {
  const {name, title, type} = field;
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
  
  return new Promise( (resolve, reject) => {
    
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
export function ContentEditor(props={}) {
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
export default function ContentComponent(props={}) {
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