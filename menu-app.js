import React from 'react';
import {useState} from 'react';
import ReactDOM from 'react-dom';


/**
 * MenuItem component.
 * @param {import('./components.menu.js').MenuProps} props
 */
export function MenuItem(props) {
  const [content, setContent] = useState({
    title: (props.value.title || ""),
    entries: [...(props.value.entries || [])],
    open: (props.value.entries ? props.open : undefined),
    action: props.action
  });

  /**
   * Handle selection of the menu item.
   * @param event The event.
   */
  const handleSelect = (event) => {
    if (content.open != null) {
      // Toggle visibility.
      setContent((old) => ({ ...old, open: !(old.open) }))
    }
    if (content.action) {
      if ((content.action) instanceof Function) {
        // 
        return content.action(event.target);
      } else if (props.onSelect) {
        // 
        props.onSelect(content.action);
      }
    }
  }
  
  console.group(`MenuItem ${content.title}`);
  console.table(content);
  console.groupEnd();

  return (<li className={content.style || 'horizontal'} >
    <a onClick={handleSelect}>{(content.title || (<p />))
    }</a>
    {
      content.entries && <SubMenu entries={(content.entries || [])} open={(content.open || undefined)} />
    }
  </li>);
}

export function SimpleMenuItem(props) {
  console.table(props.value);
  return <li><a>{props.value && props.value.title}</a></li>;
}

/**
 * @param {import(./components.menu.module.js).MenuProps} props The menu properties.
 * @returns {React.JSx} The submenu component.
 */
export function SubMenu(props) {
  console.group(`Submenu ${props.title}`)
  console.table(props);
  console.groupEnd();
  return (
    <ul className={props.style || 'horizontal'}>
      {props.entries.map( (entry) => {
      console.log(`Entry ${entry.title}`)
    return <MenuItem key={entry.title} style={props.style} value={entry} onSelect={props.onSelect} />;
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

export function Main(props) {
  
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