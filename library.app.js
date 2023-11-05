import React from 'react';
import { useState, useEffect, useId, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { isPojo, ucFirst } from './module.utils.js'
import {createActionHandler} from "./module.action.js";
import PojoMap from "./module.JsonMap.js";
import {useRef} from "react";

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

/**
 * ActionBar component.
 * @param {ActionBarProps} props
 * @returns {ReactDOM.JSX} The ActionBar JSX component.
 */
export const ActionBar = (props) => {
  const { actions = [], knownActions = null, onAction = null } = props;
  console.group(`ActionBar`);
  const actionMap = new Map();
  const registerAction = (alias, action) => {
    // TODO: Check alias and action
    // TODO: Support for transitive definitions.
    actionMap.set(alias, action)
    console.debug(`Registered action ${alias}`)
  }
  if (knownActions) {

    if (knownActions instanceof Array) {
      console.debug("Parsing known actions from Array")
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
      console.debug("Parsing known actions from Map")
      for ([key, value] of knownActions.entries()) {
        registerAction(key, value);
      }
    } else if (knownActions instanceof Object) {
      console.debug("Parsing known actions from POJO")
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
 * @param {ModalProperties} props Properties.
 */
export function Modal(props) {
  const [isOpen, setOpen] = useState(props.opened == true);
  const { title=undefined, actions=["close"], opened=false,
  onOpen=undefined, onClose=undefined, onAction=undefined, children=[], onClick=undefined, ...rest } = props;
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
    if (onOpen) {
      onOpen(title);
    }
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


/**
 * Content component show the book content.
 */
export function Content(props) {

  return (<article className="content" ><span className="title"><em>{props.title || "(unknown)"}</em> by <em>{props.author || "(unknown)"}</em></span><span>{props.target}</span><span>{props.type}</span>
  <QualityAndLevel level={props.level} quality={props.quality} /></article>);
}

export function parseContents(contents = [], defaultValues = {}) {
  console.group(`Parse contents`);
  console.table([contents, defaultValues])
  console.groupEnd();
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
   <main className="bookContents">
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
 * The Book Editing component.
 */
export function EditBook(props) {
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
        required: false,
        parser: (s) => (s)
      }
    })["type"].forEach(
    (field) => {
      fields[field] = {
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
    })["quality", "level"].forEach(
    (field) => {
      fields[field] = {
        required: false,
        type: "number",
        parser: (s) => {
          const val = Number.parseInt(s);
          if (Number.isInteger(val)) {
            return val;
          } else {
            throw new RangeError("Invalid value");
          }
        }
      }
    }
  )

  function fireCancel() {
    if (props.onCancel) {
      props.onCancel();
    }
  }

  function fireOk() {
    if (props.onOk) {
      props.onOk(JSON.stringify(book));
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

/**
 * The book list component.
 * @param {string?} title The title of the book list.
 * @param {Array<Book>} books The list of the books.
 * @param {EventListener} [onChange] The change listener.
 */
export function Books({ title, books, onChange = null }) {
  const [edited, setEdited] = useState({});
  const [mode, setMode] = useState("View")
  const nameRef = useId();
  const authorRef = useId();

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
    <footer><form onSubmit={
      (event) => {
        event.preventDefault();
        const [title, author] = [
        event.target.title &&event.target.title.value,
        event.target.author && event.target.author
        ];
        alert(
        `Adding "${title || "(unkown)"}" by "${author || "(unknown)"}"`
        );
        let added = {title, author};
        setEdited(added);
        setMode("Add")
      }
    }>
    <label htmlFor={nameRef}>Title</label>
    <input id={nameRef} type="text" name="title"/>
    <label htmlFor={authorRef}>Author</label>
    <input id={authorRef} type="text" />
    <input name="addBook" type="submit" value="Add"/>
    </form></footer>
    </section>
  );
}

/**
 * The collection list component.
 * @param {string?} title The title of the collection list.
 * @param {Array<Collection>} collections The list of the books.
 * @param {EventListener} [onChange] The change listener.
 */
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

/**
 * The Library Component.
 */
export function Library(props) {
  const [collections, setCollections] = useState(
    props.collections || []);
  const [books, setBooks] = useState(props.books || []);

  /**
   * @template TYPE
   * @typedef {CustomEvent} ChangeEcent
   * @property {ChangePayload<TYPE>} detail The details of the change.
   */

  /**
   * @template TYPE The payload type.
   * @callback ChangeEventListener
   * @param {Event|CustomEvent} event The UI event.
   * @param {string} [change] The change.
   * @param {TYPE} [payload] The payload.
   * 
   */

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
      console.debug(`Fired change (${propName},${change},${payload})`)
    }
  }

  /**
   * Check validity of a book.
   */
  const validBook = (book) => {
    return typeof book === "object" && isPojo(book);
  }

/**
 * Test if a book belongs to the collection.
 * @param {Partial<Book>} [fieldd] The field values of the wanted book.
 * @returns {boolean} True, iff there is at least one book with the given field values.
 */
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
        console.debug(`Added book with ${id}`)
        fireChange("books", "add", { index, id: (id ? id : book.id) })
      }
    } else {
      throw TypeError(`Invalid book`)
    }
  }

  /**
   * Change event listener.
   * 
   * @type {ChangeEventListener} 
   */
  const handleCollectionChange = (event, change, payload = null) => {
    const {change:defaultChange, payload:defaultPayload} = event.detail || {};
    alert(`Collection ${change ? `change ${change}` : `event change ${defaultChange}`} with ${payload ? payload : defaultPayload ? `event payload ${defaultPayload}` :"no payload"}`);
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

        case "insert":
          if (payload) {
            if (payload.index) {
              insertBook(payload.index, patload.value);
            } else {
              addBook(payload.value, payload.id)
            }
          } else {
            console.log(`Missing added book`);
          }
      }
    }
  };

  return (<section className={"library"}>
  <TitleBar title={props.title} />
  {(props.mode === "Collections" ?
  <Collections collections={collections} 
  onChange={handleCollectionChange}/>: <Books books={books} onChange={handleBookChange} />)}
  </section>);
}

/**
 * The default library.
 * @type {ILibrary}
 */
const defaultLibrary = {
    collections: [],
    books: [
      {
        id: "ability.hermetic.summa.Principia_Magica",
        title: "Principia Magica",
        author: "Bonisagus",
        contents: [
          {
            id: "principia_magica.magic_theory",
            type: "Summa",
            targetType: "Hermetic Ability",
            target: "Magic Theory",
            level: 5,
            quality: 15
        }
        ]
        },
      {
        title: "Summae Vitae",
        type: "Summa",
        targetType: "Art",
        contents: [
          {
            target: "Vim",
            level: 4,
            quality: 10
          },
          { target: "Corpus", level: 4, quality: 9 },
          { target: "Creo", level: 4, quality: 9 }
            ]
        },

      {
        title: "Flaws of the Founders",
        author: "Flavicus ex Tytalus",
        contents: [
          {
            target: "Order of Hermes Lore",
            quality: 7
            },
          {
            targetType: "Art",
            target: "Vim",
            quality: 7
            },
          {
            targetType: "Art",
            target: "Ignem",
            quality: 8
            }
            ]
        }],
    pending: [],
    history: []
  };

/**
 * The main program.
 */
export function Main(props) {
  const [opened, setOpen] = useState(false);
  const [library, setLibrary] = useState(defaultLibrary);

  if (typeof props.mode === "string") {
    console.group(`Library(${props.mode})`);
    const getResult = (mode) => {
      switch (mode) {
        case "Collections":
          return (
            <Library 
            title={props.title} mode="Collections" collections={library.collections}
          books={library.books}
          />);
        case "Librarian":
          return (
            <Library 
            title={props.title} collections={library.collections}
                  books={library.books}
                  />);
        case "Books":
          return (
            <section className="library">
            <TitleBar title={props.title} />
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
        <header>{props.title}(Books)</header>
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
      <TitleBar title={props.title} />
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
    console.debug("Opening Quality List")
    if (opened == false) {
      setOpen(true);
    }
  }
  const closeModal = () => {
    console.debug("Closing Quality List")
    if (opened) {
      setOpen(false);
    }
  }
  return (<Fragment>
    <Modal title={"Quality List"} actions={["close", "close modal"]} opened={opened}
    onOpen={()=>{openModal()}} 
    onClose={() =>{closeModal()}} >
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

const JsonMapComponent = (props) => {
    const protoName = (proto) => (proto == null ? "POJO" : proto.name)
    return (<article>{typeof props.map}({props.map instanceof Object ? protoName(Object.getPrototypeOf(props.map)):""})</article>);
  }


export const TestCase = ({title, children}) => {
  return (<Fragment>
          <article className="testCase">
          <TitleBar title={title} />
          <main>{...children}</main>
          </article>
          </Fragment>);
}

/**
 * 
 */
export const JsonMapTester = (props) => {
  const testCases = useRef();
  const [members, setMembers] = ([]);
  
  try {
  const addTest = (testCase) => {
    if (testCase) {
    setMembers( (old) => ([...old, testCase]))
    }
  }
  
  const map2List = (map) => {
    return (<dl>{
    [...(map.entries())].map(
    ([key, value], index) => {
      return (<Fragment key={key}>
      <dt><pre>{key}</pre></dt>
      <dd>{value}</dd>
      </Fragment>);
    }
    )
    }</dl>);
  }
  
  const tryFromJson = async (json) => {
    const testCaseName = `Create map from json ${typeof json}  "${json}"`;
    const action = new Promise(
      () => {
        return new JsonMap(""+json);0
      },
      (error) => {
        throw error;
      }
      );
    action.then((map) => {
      addTest(<TestCase title={`${testCaseName}: [Passed]`}>{map2List(map)} </TestCase>)
    }).catch( (error) => {
      addTest(<TestCase title={`${testCaseName}: [Failed]`}>
        <dl>
        <dt>Source</dt><dd><pre>{"" + json}</pre></dd>
        <dt>Error Type</dt><dd>{(error instanceof Error? error.name : "<i>None</i>")}</dd>
        <dt>Error</dt><dd><pre>{""+error}</pre></dd>
        </dl></TestCase>)
    })
  }
  } catch(error) {
    console.error("Test Failed", error);
    console.groupEnd();
    throw error;
  }
  console.groupEnd();
  tryFromJson("{}");
  
  return (
    <section ref={testCases} className={{"overflow-y": "scroll"}} >
      <h2>Json Map Test</h2>
      {...members}
    </section>
    )
}

/* Rendering the library */
const domNode = document.getElementById('library-app');
const root = ReactDOM.createRoot(domNode);
root.render(<Fragment>
<Main title="Default View" />
<div className={{border: "2mm solid black"}}><Main title="Books View" mode="Books"/></div>

<div className={{margin: "10mm",padding:20, ['background-color']: "cyan",
color: "silver", border: "2px solid black"}}><Main title="Library View" mode="Librarian"/></div>
<QualityList />
<JsonMapTester/>
</Fragment>);