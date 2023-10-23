import {useState} from 'react';
/**
 * Library for library components.
 * 
 * @module components.librsry
 */
 
 export function QualityAndLevel({quality=null, level=null}) {
   if (quality != null && level != null) {
     return <span><span className={level}>{level}</span>/<span className="quality">{quality}</span></span>;
     
   } else if (quality != null) {
     return <span className="quality">{quality}</span>;
   } else {
     return <span />;
   }
 }
 
 
 export function Summary(props) {
    return (<div className="summary" >{(props.lang || "Latin")}/{(props.script || "Latin")}. {props.targetType} {props.target} {props.type}<QualityAndLevel level={props.level} quality={props.quality} /></div>);
 }
 
 
 
 export function Content(props) {
   
   return (<article className="content" ><span className="title"><em>{props.title}</em> by <em>{props.author || "unknown"}</em></span><span>{props.targetType}</span><span>{props.type}</span><span>{props.target}</span></article>);
 }
 
 export function parseContents(contents=[]) {
   return contents.map(
     (contentDef, index) => ({
       id: (contentDef.id || `content-${index}`),
       title: (contentDef.title ? `"${contentDef.title}"` : "unknown"),
       level: contentDef.level,
       quality: contentDef.quality,
       lang: (props.lang || "Latin"),
       script: (props.script || "Latin"),
       targetType: (props.targetType || "Anility"),
       target: contentDef.target,
       type: (contentDef.type || "Tractatus")
     }));
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