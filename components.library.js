import {useState} from 'react';
/**
 * Library for library components.
 * 
 * @module components.librsry
 */
 
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
 
 export function Summary(props) {
    return (<div className="summary" >{(props.lang || "Latin")}/{(props.script || "Latin")}. {props.targetType} {props.target} {props.type}<QualityAndLevel level={props.level} quality={props.quality} /></div>);
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
   return (<article className="book">
   <header>{props.title}</header>
   <main>
    <Summary {...props} />
    {(contents.map(
    (content) => {
      return (<Content key={content.id} title={content.title}
      author={content.author}
      type={content.type}
      targetType={content.targetType}
      target={content.target}
      quality={content.quality}
      level={content.level} />);
    }
    ))}
   </main>
   <footer>{status[0]}/{status[1]}</footer>
   </article>);
 }
 
 export default {QualityAndLevel, Content, Book, parseContents};