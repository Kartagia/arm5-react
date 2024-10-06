import React from 'react';
import { useState, useEffect, useId, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { isPojo, ucFirst } from './module.utils.js'
import {createActionHandler} from "./module.action.js";
import {getLibrary} from "./library-data.js";

/**
 * @param {Library} target
 * @param {Collection} payload
 */
export function addToCollections(target, payload) {
  if (payload.id) {
    // The payload has id
  } else if (payload.index != null) {
    // 
  }
}

export function deleteFromCollections(target, payload) {
  const predicate = (payload.id ? ((old) => (old.id !== payload.id)) : ((old, index) => (index !== payload.index)));
  return target.filter(predicate);
}

// Start-include Modal.jsx
// Replaced import {addListener, removeListener, fireCustomUIEvent} from 'eventListeners.js'

/**
 * A function supplying new values.
 * @template TYPE
 * @callback Supplier
 * @returns {TYPE} The supplied value.
 */

/**
 * Custom hook adding event listener.
 * @param {EventSource|Supplier<EventSource>} [dispatcher=document]
 */
export function useEventListener(eventType, handler, dispatcher=document) {
  if (handler) {
    const target = (dispatcher instanceof Function ? dispatcher() : dispatcher);
    target.addEventListener(eventType, handler);
    console.debug(`Added ${eventType} listener to component ${dispatcher}`)
    return () => {
      dispatcher.removeEventListener(eventType, handler);
      console.debug(`Removed ${eventType} listener from ${dispatcher}`)
    }
  }
}

/**
 * The action alias array
 * @template TYPE
 * @interface ActionAlias
 * @property {string} 0 Action name.
 * @property {Action<TYPE>|string} 1 The actual action or used alias
 * @property {TYPE} [2] The payload.
 */
 
 /**
  * Get the actual action.
  *
  * @param {Action} action The source action.
  * @param {Array<ActionAlias>|Map<string, Action>} knownActions The known action aliases.
  * @param {Object} [param2] Options.
  * @param {boolean} [param2.noDefault=false] Are unknown action names ignored instead of generating default action.
  * @returns {ActionDef|undefined} The actual action for the given action.
  */
 function getAction(action, knownActions, {noDefault=false}={}) {
   if (typeof action === "string") {
    const actionMap = (knownActions instanceof Array ? new Map(knownActions.map( (entry, index) => ([entry[0], entry[1]])))
     : (knownActions instanceof Map ? knownActions : new Map()));
    const payloadMap = new Map(knownActions instanceof Array ? knownActions.map((entry) => ([entry[0], (entry.length >=2 ?entry[2]:undefined)])) : [])
    let current = action;
    let payload = payloadMap.get(action);
    while (typeof current === "string" && actionMap.has(action)) {
        current = actionMap.get(current);
        if (payload === undefined) {
          payload = payloadMap.get(current);
        }
    } 
    // Returning the actual action with the action name as string.
    if (typeof current === "string") {
      return (noDefault?undefined:{name: current, caption: action, defaultPayload: (payload === undefined ? undefined : payload)});
    } else if (current instanceof Object) {
      return {...current, 
      defaultPayload: (payload === undefined ? current.defaultPayload : payload),
      caption: ucFirst(action)};
    }
    return current;
   } else {
     return action;
   }
 }

/**
 * Component for an action.
 * @param {Object} props 
 * @param {Action} props.action The action of the component.
 * @param {Function} [props.onAction] The action event listener
 * @param {Array<[string, Action?]>|Map<string, Action|undefined>} [props.knownActions] The known actions.
 */
export const ActionComponent = (props) => {
  const id = useId();
  const { action:actionCandidate, onAction=undefined, knownActions=[] } = props;
  
  const action = getAction(actionCandidate, knownActions);
  
  console.log(`Action Component: Action: ${(action ? action.name : "(unknown)")} "${action && action.caption ? action.caption : ucFirst(action ? action.name : "")}"`);
  if (action instanceof Object) {
    const actionHandler = createActionHandler(onAction);
    const buttonHandler = 
      (event) => {
        onAction(event, action.name, action.defaultPayload);
      }
    
    return (<button 
    id={id} type="button" onClick={buttonHandler}
             value={action.name
            }>{action.icon && <img aria-hidden="true" src={action.icon}  />}{action.caption || ucFirst(action.name)}</button>);
  } else {
    return <Fragment />
  }
}

export const ActionBar = (props) => {
  const { actions = [], knownActions = null, onAction = null } = props;
  console.group(`ActionBar`);
  const actionMap = new Map();
  const registerAction = (alias, action) => {
    // TODO: Check alias and action
    // TODO: Support for transitive definitions.
    actionMap.set(alias, action)
    console.log(`Registered action ${alias}`)
  }
  if (knownActions) {

    if (knownActions instanceof Array) {
      console.log("Parsing known actions from Array")
      knownActions.map(
        (entry) => {
          if (entry instanceof Array) {
            // TODO: Check array is valid
            registerAction(entry[0], entry[1]);
          } else {
            // TODO: Check entry 7s string
            registerAction(entry, { name: entry, caption: ucFirst(entry) })
          }
        }
      )
    } else if (knownActions instanceof Map) {
      console.log("Parsing known actions from Map")
      for ([key, value] of knownActions.entries()) {
        registerAction(key, value);
      }
    } else if (knownActions instanceof Object) {
      console.log("Parsing known actions from POJO")
      // TODO: Getting action map from pojo
      console.log(`Parsing not implemented`)
    } else {
      throw TypeError("Invalid ActionBar property knownActions")
    }
  }
  console.groupEnd();
  return (<span className={"actionBar"}>{
     actions instanceof Array && actions.map( (action, index) => {
       if (typeof action === "string") {
         // The action is ref
         return (<ActionComponent
         key={action}
         action={
           (actionMap.get("action") || {name: action, caption: ucFirst(action)})
         }
         onAction={onAction}/>)
       } else if (action instanceof Object) {
         return (<ActionComponent
         key={action.name} action={action}
         onAction={onAction} />);
       } else {
         console.error(`Invalid action ${action}`)
         return null;
       }
     })
   }</span>)
}

/**
 * @typedef {React.props} ModalProperties The modal properties.
 * @property {string} [title] The modal title.
 * @property {Array<Action>} [actions=["close"]] The action buttons of the modal header.
 * @property {boolean} [opened=false] Is the modal open.
 * @property {Function} [onClose] The closing of the modal event handler.
 * @property {Function} [onClick] The modal content on click event handler. 
 * @property {Array<React.Fragment>} children The children of the nodal.
 * @property {any[]} ...rest The properties sent to the child component.
 */

export function TitleBar(props) {
  const { title, onAction, actions, knownActions = [] } = props;
  
  const actionHandler = (event, action=undefined, payload=undefined) => {
    if (onAction) {
    console.debug(`Title Bar: Firing Action ${action}`);
    onAction(event, action, payload);
    } else {
      console.debug(`Title Bar: Ignoring Action ${action}`);
    }
    
  }
  
  if (title && actions) {
    return (<header><em className={"title"}>{title}</em><ActionBar actions={actions} onAction={actionHandler} knownActions={knownActions} /></header>);
  } else if (title) {
    return <header>{title && <em className={"title"}>{title}</em>}</header>
  } else if (actions instanceof Array) {
    <header><ActionBar actions={actions} onAction={actionHandler} knownActions={knownActions} /></header>
  } else {
    return <Fragment />;
  }
}

/**
 * Modal component.
 * 
 * @param {ModalProperties} props Properties.
 */
export function Modal(props) {
  const [isOpen, setOpen] = useState(props.opened == true);
  const { title=undefined, actions=["close"], opened=false, onClose=undefined, onAction=undefined, children=[], onClick=undefined, ...rest } = props;
  const mode = (opened ? "modalOpen" : "modalClosed");
  console.group(`Modal ${title || ""}`)
  if (opened) {

    const closeModal = (e) => {
      console.log(`Modal: Closing modal ${title || ""}`)
      if (onClose) {
        onClose(e);
      }
      setOpen(false);
    }

    /**
     * Handle action.
     * @param {Event?} e The event triggering the action.
     * @param {string} action The name of the action.
     * @param {any} [payload]
     */
    const actionHandler = (e, action, payload=undefined) => {
      const {defaultAction, defaultPayload} = e.detail;
      if (action || defaultAction) {
      switch ((action ? action: defaultAction)) {
        case "close modal":
        case "close":
          // Closimg the modal
          console.debug(`Modal: Handling action ${action}: Closing modal`);
          closeModal(e);
          break;
        default:
        console.debug(`Modal: Firing action ${action}`);
          onAction && onAction(e, action || defaultAction, payload || defaultPayload);
      }
      } else {
        console.debug(`Modal: Handling non-Action Event`);
      }
    }

    console.log(`Modal: Opening modal ${title || ""}`)
    try {
      const markup =
        (() => {
          return (<div className={mode}
  onClick={closeModal}
  >
  <div className={"modalContent"}
  onClick={(e) => {
    // Stop propagation
    e.stopPropagation();
    onClick && onClick(e);
  }}
  {...rest}>
  <TitleBar title={title} actions={actions} onAction={actionHandler} />
  {children}
  </div>
  </div>);
        })();
      console.groupEnd();
      return markup;
    } catch (err) {
      console.error('Failed to open: ', err);
      console.groupEnd();
      throw err;
    }
  } else {
    console.groupEnd();
    return <div />
  }
  console.groupEnd();
}

// End-incluce Modal.jsx



export function QualityAndLevel({ quality = null, level = null }) {
  if (quality != null && level != null) {
    return <span><span className={level}>{level}</span>/<span className="quality">{quality}</span></span>;

  } else if (quality != null) {
    return <span className="quality">{quality}</span>;
  } else {
    return <span />;
  }
}



export function Content(props) {

  return (<article className="content" ><span className="title"><em>{props.title || "(unknown)"}</em> by <em>{props.author || "(unknown)"}</em></span><span>{props.target}</span><span>{props.type}</span>
  <QualityAndLevel level={props.level} quality={props.quality} /></article>);
}

export function parseContents(contents = [], defaultValues = {}) {
  const result = contents.map(
    (contentDef, index) => {
      return {
        id: (contentDef.id || `content-${index}`),
        title: (contentDef.title || defaultValues.title || "(unknown)"),
        author: (contentDef.author || defaultValues.author || "(unknown)"),
        level: contentDef.level,
        quality: contentDef.quality,
        lang: (contentDef.lang || defaultValues.lang || "Latin"),
        script: (contentDef.script || defaultValues || "Latin"),
        targetType: (contentDef.targetType || defaultValues.targetType || "Anility"),
        target: contentDef.target || defaultValues.target,
        type: (contentDef.type || defaultValues.type || "Tractatus")
      }
    });

  console.groupEnd();
  return result;
}

export function defaultContentId(index) {
  return `content-${index}`;
}

export function defaultBookId(index) {
  return `book-${index}`;
}

export function Book(props) {
  const [status, setStatus] = useState([(props.status || "Available"), (props.location || "Public collection")]);
  const [contents, setContents] = useState(parseContents((props.contents || []), props));

  // Create result
  return (<article className="book">
   <header><em className="title">{props.title || "(unknown)"}</em> by <em className="title">{props.author || "(unknown)"}</em></header>
   <main>
    {(contents.map(
    (content, contentIndex) => {
      const contentId = content.id || defaultContentId(contentIndex);
      return (<Content key={contentId}
      id={contentId}
      title={content.title}
      author={content.author}
      lang={content.lang}
      script={content.script}
      type={content.type}
      targetType={content.targetType }
      target={content.target}
      quality={content.quality}
      level={content.level} />);
    }
    ))}
   </main>
   <footer></footer>
   </article>);
}

/**
 * BookEditor component.
 * @param {} props
 */
export function BookEditor(props) {
  const [book, setBook] = useState({ ...(props.book || {}) });
  const [opened, setOpen] = useState((!(props.hidden === true)))
  const [errors, setErrors] = useState({ ...(props.errors || {}) })
  useEffect(() => {
    if (props.onClose && !opened) {
      props.onClose();
    }
    if (props.onOpen && opened) {
      props.onOpen();
    }
    if (props.onChange) {
      props.onChange({
        propertyName: "open",
        value: opened
      })
    }
  }, [opened]);
  const reset = () => {
    setBook({ ...(props.book || {}) });
  }

  const fields = {};
  ["title", "author", "target", "targetType"].forEach(
    (field) => {
      fields[field] = {
        title: ucFirst(field),
        required: false,
        parser: (s) => (s)
      }
    });
    ["type"].forEach(
    (field) => {
      fields[field] = {
        title: ucFirst(field),
        required: false,
        values: ["Art", "Ability"],
        defaultValue: "Ability",
        parser: (s) => {
          const parts = s.split(/\s+/g);
          switch (parts[parts.length - 1]) {
            case "Art":
              if (!(parts.length == 1 || parts[parts.length - 2] in ["Technique", "Form"])) {
                throw RangeError("Invalid art type");
              }
              break;
            case "Ability":
              if (!(parts.length == 1 || parts[parts.length - 2] in ["General", "Academic", "Martial", "Hermetic", "Supernatural", "Other"])) {
                throw RangeError("Invalid ability group");
              }
              break;
            default:
              throw RangeError("Invalid base type")
          }
          return parts.join(" ");
        }
      }
    });
    ["quality", "level"].forEach(
    (field) => {
      fields[field] = {
        title: ucFirst(field),
        required: false,
        type: "number",
        parser: (s) => {
          const val = Number.parseInt(s);
          if (Number.isInteger(val)) {
            return val;
          } else {
            throw new RangeError("Invalid value");
          }
        },
        input: <input type="number"/>
      }
    }
  );
  const parseResult = (event, formData) => {
    event.preventDefault();
  }
  
  const isBookFields = (type, fieldName) => {
    const baseFields = ["title", "author", "language", "script"];
    switch (type) {
      case "Commentary":
      case "Summa":
      case "Tractatus":
        return isContentFields(type, fieldName);
      case "Labtext":
       [...baseFields, "translated" ].includes(fieldName);
    }
  }
  
  const isContentFields = (type, fieldName) => {
    const baseFields = ["title", "author", "language", "script", "original"];
    switch (type) {
      case "Summa":
        return [...baseFields, "level", "quality", "targetType", "target"].includes(fieldName);
      case "Commentary":
        if (["summa"].includes(fieldName)) return true;
      case "Tractatus":
        return [...baseFields, "quality", "targetType", "target"].includes(fieldName);
      case "Casting Tablet":
      case "Labtext":
        return [...baseFields, "level", "technique", "form"].includes(fieldName);
      default: 
        return baseFields.includes(fieldName);
    }
  }
  
  console.table(fields);
  return (<form className={"editBook"} onSubmit={parseResult}>{
    Object.getOwnPropertyNames(fields).filter(isContentFields.bind(undefined, book.type)).map(
    field => (<article key={field} ><label>{fields[field].title}</label>{fields[field].input}</article>))
  }</form>);

  function fireCancel() {
    if (props.onCancel) {
      props.onCancel();
    }
  }

  function fireOk() {
    if (props.onOk) {
      props.onCommit(JSON.stringify(book));
    }
  }

  const ok = () => {
    fireOk();
    setOpen(false);
    reset();
  }

  const cancel = () => {
    setOpen(false);
    fireCancel();
    reset();
  }

  const updateBook = (form) => {
    const result = {};
    const parsed = { ...book };
    Object.getOwnPropertyNames(fields).forEach(
      (field) => {
        const fieldDef = fields[field];
        if (form[field]) {
          try {
            parsed[field] = fieldDef.parser(form[field].value)
          } catch (err) {
            result[field] = err;
          }
        } else if (fieldDef.required) {
          result[field] = TypeError("Value required");
        } else {
          parsed[field] = fieldDef.defaultValue;
        }
      }
    )
    setBook(parsed);
    setErrors(result);
    return result;
  }
  const handler = (event) => {
    event.preventDefault();
    const mode = event.submitter.value;


    const add = (form) => {
      if (updateBook(form)) {
        ok();
      }
    }

    const edit = (form) => {
      if (updateBook(form)) {
        ok();
      }
    }

    switch (mode) {
      case "Add":
        return add(event.target);
      case "Edit":
        return edit(event.target);
      case "Reset":
        return reset();
      case "Cancel":
        return cancel();
      default:

    }
  }

  return (
    <form className={["book", "editor"]} onSubmit={handler}>
    {Object.getOwnPropertyNames(fields).map(
    (field) => {
    const fieldDef = fields[field];
      return (<div className={"field"}>
      <label>{ucFirst(field)}</label>
      <input type={fieldDef.type} name={field} defaultValue={books[field]} />
      </div>)
    }
    )
      
    }
    <div hidden={!open} className="actions">
    <input type="Submit" value={props.type || "Add"} />
     <input type="Submit" value="Reaet" />
      <input type="Submit" value="Cancel" />
    </div>
    </form>
  );
}

export function Books({ title, books, onChange = null }) {
  const [edited, setEdited] = useState({});
  const [mode, setMode] = useState("View")
  const nameRef = useId();
  const authorRef = useId();
  
  function fireChange(change) {
    if (onChange) {
      onChange(change);
    }
  }
  
  const commitEdit = (newBook) => {
    if (books.find( (cursor) => (cursor.bookId === newBook.bookId))) {
      fireChange({
        propertyName: "books",
        change: "replace",
        value: newBook
      });
    } else {
      fireChange({
        propertyName: "books",
        change: "create",
        value: newBook
      });
    }
  };

  return (
    <section className={"books"}>
    {title && <header>{title}</header>}
    <main>{
      (books || []).map(
      (book, bookIndex) => {
        const bookId = book.id || defaultBookId(bookIndex);
        return (<article key={bookId}>
        <header>{book.title || "(unknown)"} by {book.author || "(unknown)"}
        <span className="actions">
        <em onClick={(e)=>{
          setEdited(book);
          setMode("Edit");
        }}>[Edit]</em>
        <em onClick={(e)=>{
          if (onChange instanceof Function) {
            onChange(e, "delete", {
              id: book.id, index: bookIndex
            })
          }
        }}>[X]</em></span>
        </header>
        </article>)
      })}
    </main>
    <footer>
    <header><BookEditor book={edited} onCommit={(target) => commitEdit(target)} onCancel={()=>{setEdited(null)}} /></header>
    
    <form onSubmit={
      (event) => {
        event.preventDefault();
        const [title, author] = [
        event.target.title &&event.target.title.value,
        event.target.author && event.target.author.value
        ];
        alert(
        `Adding "${title || "(unkown)"}" by "${author || "(unknown)"}"`
        );
        let added = {title, author};
        setEdited(added);
        setMode("Add");
      }
    }>
    <label htmlFor={nameRef}>Title</label>
    <input id={nameRef} type="text" name="title"/>
    <label htmlFor={authorRef}>Author</label>
    <input id={authorRef} name="author" type="text" />
    <input name="addBook" type="submit" value="Add"/>
    </form></footer>
    </section>
  );
}

export function Collections({ title = null, collections = [], onChange = null }) {

  if (collections instanceof Array) {
    // List of collections
    return (<section>
    <header>{title}</header>
    <main>{
      collections.map(
      (entry, index) => {
        if (entry instanceof Array) {
          return <Books books={entry} />
        } else if (entry instanceof Object) {
          if ("collections" in entry) {
            return <Collections title={entry.title} collections={entry.collections} />
          } else if ("books" in entry) {
            return <Books title={entry.title} books={entry.books} />
          } else {
            return null;
          }
        } else {
          return null;
        }
      }
      ).filter( (v)=>(v != null))
    }</main>
    </section>)
  } else if (collections instanceof Object) {
    return (<section>
    <header>{title}</header>
    {Object.keys(collections).filter(
      (entry) => (typeof entry === "string" && collections[entry] instanceof Array || collections[entry] instanceof Object)
      ).map(
      (title, index) => (
      collections[entry] instanceof Array ? <Books title={title} books={collections[title]}/>
      : <Collections title={title} collections={[collections[title]]} />
      )
        
        )}</section>)
  } else {
    throw TypeError(`Invalid collections`);
  }
}

export function Library(props) {
  const [collections, setCollections] = useState(
    props.collections || []);
  const [books, setBooks] = useState(props.books || []);

  /**
   * Fire change event.
   *
   * @param {string} propName The changed property.
   * @param {string} change The change type.
   * @param {Object} [payload] The payload of the change.
   */
  const fireChange = (propName, change, payload = null) => {
    if (props.onChange instanceof Function) {
      props.onChange(propName, chsnge, payload);
      console.log(`Fired change (${propName},${change},${payload})`)
    }
  }

  const validBook = (book) => {
    return typeof book === "object" && isPojo(book);
  }

  const hasBook = (fields = {}) => {
    const filter = (book) => {
      return validBook(book) && Object.getOwnPropertyNames(fields).every((field) => (fields[field] === book[field]))
    }
    return books.find(filter) != null;
  }

  const addBook = (book, id = null) => {

    if (validBook(book)) {
      if (id && hasBook({ id })) {
        throw RangeError("Book id reserved")
      } else {
        const index = books.length;
        setBooks((old) => ([...old, (id ? { ...book, id } : book)]))
        console.log(`Added book`)
        fireChange("books", "add", { index, id: (id ? id : book.id) })
      }
    } else {
      throw TypeError(`Invalid book`)
    }
  }

  const handleCollectionChange = (event, change, payload = null) => {
    alert(`Collection change ${change} with ${payload ? payload : "no payload"}`);
    if (change) {
      switch (change) {
        case "add":
          setCollections((old)=>(appendToCollection(old, payload)));
          break;
        case "insert":
          setCollections((old)=>(insertToCollection(old, payload)));
          break;
        case "update":
          setCollections((old)=>(replaceInCollection(old, payload)));
            break;
        case "delete":
          setCollections((old)=>(deleteFromCollection(old, payload)));
      }
    }
  }



  const handleBookChange = (event, change, payload = null) => {
    alert(`Booklist change ${change} with ${payload ? payload : "no payload"}`);

    if (change) {
      switch (change) {
        case "delete":
          if ((payload.index) != null) {
            if (Number.isInteger(payload.index)) {
              setBooks((old) => ([
                ...(old.slice(0, payload.index)),
                ...(old.slice(payload.index + 1))]));
              console.log(`Deleted book at index ${payload.index}`)
              fireChange("books", change, payload)
            } else {
              throw TypeError("Invalid index");
            }
          } else {
            setBooks((old) => (old.filter((value, index) => (value && (value.id === payload.id || (value.id == null && payload.id == defaultBookId(index)))))))
            console.log(`Deleted book with id: ${payload.id}`)
            fireChange("books", change, payload)
          }
         
          break;
        case "insert":
          if (payload) {
            if (payload.index) {
              insertBook(payload.index, payload.value);
            } else {
              addBook(payload.value, payload.id)
            }
          } else {
            console.log(`Missing added book`);
          }
          break;
        case "update":
          if (payload) {
            if (payload.index) {
              setBooks( books => books.map( (book, index) => (index === payload.index ? payload.value : book)));
            } else {
              const predicate = payload.id ? ((old)=>(old.id === payload.id)) : ((old) => (old == payload.value));
              setBooks( (books) => (books.map( (book) => (predicate(book)?payload.value:book))
                )
              );
            }
          }
      }
    }
  };

  return (<section className={"library"}>
  {(props.mode === "Collections" ?
  <Collections collections={collections} 
  onChange={handleCollectionChange}/>: <Books books={books} onChange={handleBookChange} />)}
  </section>);
}

export function Main(props) {
  const [opened, setOpen] = useState(false);
  const [library, setLibrary] = useState(getLibrary());
  console.log(`Modal open status: ${opened}`)


  if (typeof props.mode === "string") {
    console.group(`Library(${props.mode})`);
    const getResult = (mode) => {
      switch (mode) {
        case "Collections":
          return (
            <Library mode="Collections" collections={library.collections}
          books={library.books}
          />);
        case "Librarian":
          return (
            <Library collections={library.collections}
                  books={library.books}
                  />);
        case "Books":
          return (
            <section className="library">
          <main>
        {
          library.books.map(
            (book, bookIndex) => {
            const bookId = book.id || `book-${bookIndex}`;
            console.group(`Book id ${bookId}`);
            try {
            const result = (
                <Book
        title={book.title}
        key={bookId}
        id={bookId}
        lang={book.lang}
        script={book.script}
        type={book.type}
        targetType={book.targetType}
        target={book.target}
        author={book.author}
        contents={book.contents}
        />)
        console.groupEnd();
        return result;
            } catch (err) {
              console.error(`Error: `, err)
              console.groupEnd()
              throw err;
            }
            }
          )
        }
        </main>
        </section>
          )
        default:
          console.table(library.books);
          console.groupEnd();
          return (<section className="library">
        <header>Books Mode</header>
        <main>
      {library.books.map(
        (book, bookIndex) => {
        const bookId = book.id || `book-${bookIndex}`;
        const contentsModel = parseContents(book.contents, book);
        console.table(contentsModel);
        return (<article key={bookId}>
        <span className={"title"}>{book.title || "(unknown)"} by {book.author || "(unknown)"}</span>
        <ul>
        {contentsModel.map(
        (content, contentIndex) => {
        const contentId = content.id || `content-${contentIndex}`;
          return (
          <Content 
          key={contentId}
          id={contentId}
          title={content.title || book.title } author={content.author || book.author}
          type={content.type || book.type}
          target={content.target || book.target}
          targetType={content.targetType}
          quality={content.quality}
          level={content.level}
          />
          );
        }
        )}
        </ul>
        </article>);
        
        }
      )}
      </main>
      </section>);
      }

    }
    try {
      const markup = getResult(props.mode);
      console.groupEnd();
      return markup;
    } catch (err) {
      console.err(`Library: Error:`, err);
      console.groupEnd();
      throw err;
    }
  } else {
    // Dealing with books
    return (<section className="library">
      <header>Books</header>
      <main>{
        library.books.map(
        (book, bookIndex) => {return (<div key={`book-${bookIndex}`}>
        <div className={'title'}>{(book.title || '(unknown)')} by {book.author || '(unknown)'}
        </div>
        {(book.contents || []).map(
        (content, index) => (<article key={`content-${index}`}>
        <QualityAndLevel level={content.level} quality={content.quality} />
        </article>))}
        </div>)
        })
      }</main>
    </section>);
  }
}


export function QualityList(props) {
  const [opened, setOpen] = useState(props.open == true);
  const openModal = () => {
    alert("Opening Quality List")
    setOpen(true);
  }
  const closeModal = () => {
    alert("Closing Quality List")
    setOpen(false);
  }
  return (<Fragment>
    <Modal title={"Quality List"} actions={["close", "close modal"]} opened={opened} onClose={() =>{closeModal()}} >
<ul>
<li>Test <QualityAndLevel level="5" quality="6" /></li>
<li>Test <QualityAndLevel level="5" quality="15" /></li>
<li>Test <QualityAndLevel quality="6" /></li>
<li>Test <QualityAndLevel level="5" /></li>
<li>Test <QualityAndLevel /></li>
</ul>
</Modal>
<input type="button" value="Show" onClick={openModal}
 /></Fragment>);
}

/* Rendering the library */
const domNode = document.getElementById('library-app');
const root = ReactDOM.createRoot(domNode);
root.render(<Fragment>
<Main />
<div className={{border: "2mm solid black"}}><Main mode="Books"/></div>

<div className={{padding:"2mm", ['background-color']: "navy",
color: "silver", border: "2mm solid black"}}><Main mode="Librarian"/></div>
<QualityList />
</Fragment>);