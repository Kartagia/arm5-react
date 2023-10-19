import React from 'react';
import ReactDOM from 'react-dom';

export function SimpleMenuItem(props) {
  console.table(props.value);
  return <li><a>{props.value && props.value.title}</a></li>;
}

export function SubMenu(props) {
  console.group(`Submenu ${props.title}`)
  console.table(props);
  console.groupEnd();
  return (
    <ul className={props.style || 'horizontal'}>
      {props.entries.map(entry => {
    return <SimpleMenuItem style={props.style} value={entry} onSelect={props.onSelect} />;
  })}
    </ul>
  );
}

/**
 */
export function Menu(props) {
  console.table(props);
  return (<nav><SubMenu 
  entries={props.entries || []} title={props.title || null} style={props.style || 'horizontal'} /></nav>);
}

function Main(props) {
  
  const menu = [
    {title: "Logo", icon: "logo.svg"},
    {title: "File", entries:[
      {title: "Open", action: "open"},
      {title: "Save", action: "save"}
      ]},
    {title: "Edit", entries:[
      {title: "Copy"},
      {title: "Cut"},
      {title: "Paste"}
      ]},
    {title: "About", entries: []},
    ];
  
  
  return (<Menu style="horizontal" entries={menu} /> )
}

const domNode = document.getElementById('react-app');
const root = ReactDOM.createRoot(domNode);
root.render(<Main />);