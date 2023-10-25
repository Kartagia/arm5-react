import React from 'react';
import { useState, useEffect, useId, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { isPojo, ucFirst } from '././module.utils.js'

export function QualityAndLevel({ quality = null, level = null }) {
  if (quality != null && level != null) {
    return <span><span className={level}>{level}</span>/<span className="quality">{quality}</span></span>;

  } else if (quality != null) {
    return <span className="quality">{quality}</span>;
  } else {
    return <span />;
  }
}

export function Modal(props) {
  const {opened, onClose, children, ...rest} = props;
  const mode = (opened ? "modalOpen": "modalClosed")
  console.log(`Redraw modal ${mode} ${opened}`)
  if (opened) {
  return (<div className={mode} hidden
  onClick={ () => {
    alert(`Closing modal ${opened}`)
    console.log("Closing modal");
    if (onClose) {
      onClose();
    }
    setOpen(false);
  }
  }
  >
  <section className={"modalContent"}>
  <main onClick={(e) => {
    // Stop propagation
  }}
  {...rest}>
  {children}
  </main>
  </section>
  </div>);
  } else {
    return <div />
  }
}

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

export function EditBook(props) {
  const [book, setBook] = useState({ ...(props.book || {}) });
  const [opened, setOpen] = useState((!(props.hidden === true)))
  const [errors, setErrors] = useState({ ...(props.errors || {}) })
  useEffect( () => {
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
  }, [opened]
  );
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
  {(props.mode === "Collections" ?
  <Collections collections={collections} 
  onChange={handleCollectionChange}/>: <Books books={books} onChange={handleBookChange} />)}
  </section>);
}

export function Main(props) {
  const [opened, setOpen] = useState(false);
  const [library, setLibrary] = useState({
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
  });
  console.log(`Modal open status: ${opened}`)


  if (typeof props.mode === "string") {
    console.group(`Library(${props.mode})`);
    switch (props.mode) {
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
    alert("opening modal")
    setOpen(true);
  }
  const closeModal = () => {
    alert("Closing modal")
    setOpen(false);
  }
  return (<Fragment>
    <Modal opened={opened} onClose={closeModal} >
<ul>
<li>Test <QualityAndLevel level="5" quality="6" /></li>
<li>Test <QualityAndLevel level="5" quality="15" /></li>
<li>Test <QualityAndLevel quality="6" /></li>
<li>Test <QualityAndLevel level="5" /></li>
<li>Test <QualityAndLevel /></li>
</ul>
</Modal>
<input type="button" value="Show" onClick={openModal}
 /></Fragment>
    );
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