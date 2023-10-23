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
      type: (contentDef.type || defaultValues.type  || "Tractatus")
    }});
    
    console.groupEnd();
    return result;
}

export function Book(props) {
  const [status, setStatus] = useState([(props.status || "Available"), (props.location || "Public collection")]);
  const [contents, setContents] = useState((props.content || []));
  useEffect(() => {
    if (props.onChange instanceof Funtion) {
      props.onChange(
      {
        target: this,
        change: "contents",
        payload: [...contents]
      })
    }
  }, [contents]);
  
  // Create result
  return (<article className="book">
   <header>{props.title} by {props.author}</header>
   <main>
    {(contents.map(
    (content, contentIndex) => {
      return (<Content key={content.id || `content-${contentIndex}`}
      title={content.title}
      author={content.author}
      lang={content.lang || props.lang}
      script={content.script || props.script}
      type={content.type || props.type}
      targetType={content.targetType || props.targetType}
      target={content.target || props.target}
      quality={content.quality}
      level={content.level} />);
    }
    ))}
   </main>
   <footer>{status[0]}/{status[1]}</footer>
   </article>);
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
            {target: "Vim",
            level: 4, quality: 10},
            {target: "Corpus", level: 4, quality: 9},
            {target: "Creo", level: 4, quality: 9}
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
      case "collections":
      case "librarian":
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
        
        return (
        <Book
        title={book.title}
        key={book.id || `book-${bookIndex}`}
        id={book.id || `book-${bookIndex}`}
        lang={book.lang}
        script={book.script}
        type={book.type}
        targetType={book.targetType}
        target={book.target}
        author={book.author}
        contents={book.contents}
        />)}
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
<Main className={{border: "2mm solid black"}} mode="Books"/>
<ul>
<li>Test <QualityAndLevel level="5" quality="6" /></li>
<li>Test <QualityAndLevel level="5" quality="15" /></li>
<li>Test <QualityAndLevel quality="6" /></li>
<li>Test <QualityAndLevel level="5" /></li>
<li>Test <QualityAndLevel /></li>
</ul></Fragment>);