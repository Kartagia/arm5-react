import {langFieldDefs, commonFieldDefs, contentFieldDefs} from "./modules.library.js";




const newContentFieldDefs = [
  ...(commonFieldDefs.filter(field => (field && field.name !== "id"))),
  ...langFieldDefs,
  ...contentFieldDefs
];
const editFieldDefs = [
  
  ...commonFieldDefs,
  ...langFieldDefs,
  ...contentFieldDefs
]

function getInputType(name, title , type) {
  if (typeof type === "string") {
    switch (type) {
      case "integer":
        return (<input name={name} type="integer"/>)
      case "list":
        return getInputType(name, title, [entry]);
      case "string":
        return (<input name={name}/>);
    }
  } else if (Array.isArray(type)) {
    // Choise
    return (<select name={name} />)
  } else {
    // Object
  }
}

function FieldEditor({field}) {
  const {name, title, type} = field;
  const element = getInputType(type);
  if (element) {
    return (<>{title && (<label htmlFor={name}>{title}</label>)}{element}</>);
  } else {
    console.log(`Skipped field ${name}`)
    return null;
  }
}

function addNewContent(event) {
  return new Promise((resolve, reject) => {

});
}

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