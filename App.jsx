import React from 'react';
import {ucFirst} from '././module.utils.js';

export function App(props) {
  const [hasHeader, setHeader] = React.useState(props.header == true);
  
  const [hasFooter, setFooter] = React.useState(props.footer == true);
  
  const headerStyles = ["header"];
  if (!hasHeader) {
    headerStyles.push("hidden");
  }
  return (
    <>
      <header className={headerStyles.join(" ")}>
        <nav><ul>{
        props.menu && props.menu.map(
        (entry) => (<li key={`${entry.name}`}>{entry.caption || ucFirst(entry.name)}</li>))
        }</ul></nav>
        <div>Header</div>
      </header>
      <footer {...(hasFooter ? [] : ["hidden"])} >
      </footer>
    </>
  );
}

export default App;