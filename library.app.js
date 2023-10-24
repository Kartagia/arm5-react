import React from 'react';
import { useState, useEffect, useId, Fragment } from 'react';
import ReactDOM from 'react-dom';

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

export function Book(props) {
  const [status, setStatus] = useState([(props.status || "Available"), (props.location || "Public collection")]);
  const [contents, setContents] = useState(parseContents((props.contents || []), props));

  // Create result
  return (<article className="book">
   <header><em className="title">{props.title || "(unknown)"}</em> by <em className="title">{props.author || "(unknown)"}</em></header>
   <main>
    {(contents.map(
    (content, contentIndex) => {
      const contentId = content.id || `content-${contentIndex}`;
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

export function Books({title,books, onChange=null}) {
  const nameRef = useId();
  const authorRef = useId();
  
  return (
    <section className={"books"}>
    {title && <header>{title}</header>}
    <main>{
      (books || []).map(
      (book, bookIndex) => {
        const bookId = book.id || `book-${bookIndex}`;
        return (<article key={bookId}>
        <header>{book.title || "(unknown)"} by {book.author || "(unknown)"}
        <span className="actions"><em onClick={(e)=>{
          if (onChange instanceof Function) {
            onChange(e, "delete", {
              id: book.id, index: bookIndex
            })
          }
        }}>[X]</em></span>
        </header>
        </article>)
      }
      )
    }</main>
    <footer><form onSubmit={
      (event) => {
        event.preventDefault();
        alert(
        `Adding "${event.target.title}" by "${event.target.author}"`
        );
      }
    }>
    <label for={nameRef}>Title</label>
    <input id={nameRef} type="text" name="title"/>
    <label for={authorRef}>Author</label>
    <input id={authorRef} type="text" />
    <input name="addBook" type="submit" value="Add"/>
    </form></footer>
    </section>
    );
}

export function Collections({title=null, collections=[], onChange=null}) {
  
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
  
  const handleCollectionChange = (event, change, payload=null) => {
    alert(`Collection change ${change} with ${payload ? payload : "no payload"}`);
  }
  const handleBookChange = (event, change, payload=null) => {
    alert(`Booklist change ${change} with ${payload ? payload : "no payload"}`);
  };
  
  return (<section className={"library"}>
  {(props.mode === "Collections" ?
  <Collections collections={collections} 
  onChange={handleCollectionChange}/>: <Books books={books} onChange={handleBookChange} />)}
  </section>);
}

export function Main(props) {
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

  if (typeof props.mode === "string") {
    console.group(`Library(${props.mode})`);
    switch (props.mode) {
      case "Collections":
        return(
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


/* Rendering the library */
const domNode = document.getElementById('library-app');
const root = ReactDOM.createRoot(domNode);
root.render(<Fragment>
<Main />
<div className={{border: "2mm solid black"}}><Main mode="Books"/></div>

<div className={{padding:"2mm", ['background-color']: "navy",
color: "silver", border: "2mm solid black"}}><Main mode="Librarian"/></div>
<ul>
<li>Test <QualityAndLevel level="5" quality="6" /></li>
<li>Test <QualityAndLevel level="5" quality="15" /></li>
<li>Test <QualityAndLevel quality="6" /></li>
<li>Test <QualityAndLevel level="5" /></li>
<li>Test <QualityAndLevel /></li>
</ul></Fragment>);