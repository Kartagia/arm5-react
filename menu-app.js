import React from 'react';
import {useState, useEffect} from 'react';
import ReactDOM from 'react-dom';

export function fireSelect(event, selected, handlers) {
  alert(`Select ${selected}`);
  if (handlers instanceof Array) {
    return handlers.map( (handler) => (
      fireSelect(event, selected, handler)));
  } else if (handlers instanceof Function) {
    return handlers(event, selected);
  } else {
    return false;
  }
}

/**
 * MenuItem component.
 * @param {import('./components.menu.js').MenuProps} props
 */
export function MenuItem(props) {
  const [content, setContent] = useState({
    title: (props.value.title || ""),
    entries: [...(props.value.entries || [])],
    open: (props.value.entries ? props.open == true : undefined),
    action: props.action
  });
  const [open, setOpen] = useState(props.value.entries ? props.open == true : undefined);
  
  const fireAction = (event, action) => {
    if (action) {
      alert('Engaging action: ${action}');
      if ((action) instanceof Function) {
        // Performing the action.
        const result = action(event.target);
        if (props.onAction) {
          // Firing the action
          return props.onAction(event, result);
        } else {
          return result;
        }
      } else if (props.onAction) {
        // Firing on action.
        return props.onAction(event, action);
      }
    }
  }

  /**
   * Handle selection of the menu item.
   * @param event The event.
   */
  const handleSelect = (event) => {
    alert(`Open: ${content.open}`);
    if (open != null) {
      // Toggle visibility.
      setOpen(!open);
    }
    fireSelect(event, content.title, props.onSelect);
  }
  
  const handleSubSelect = (event, action) => {
    if (open && props.closeOnSelect) {
      fireSelect(event, null);
    }
    fireAction(event, action);
  };
  
  console.group(`MenuItem ${content.title}`);
  console.table(content);
  console.groupEnd();

  return (<li className={content.style || 'horizontal'} >
    <a onClick={handleSelect}>{(content.title || (<p />))
    }</a>
    {
      props.open && <SubMenu
      onAction={fireAction}
      onSelect={handleSubSelect} entries={(content.entries || [])} open={(open || undefined)} />
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
  console.log(`Selected: ${props.selected ? `"${props.selected}"` : "None"}`);
  console.table(props);
  console.groupEnd();
  return (
    <ul hidden={(props.open && props.open == false)} className={props.style || 'horizontal'}>
      {props.entries.map( (entry) => {
      console.log(`Entry ${entry.title}`)
    return <MenuItem key={entry.title}
    open={(props.selected == entry.title)}
    onSelect={props.onSelect}
    style={props.style} value={entry} onAction={props.onAction} />;
  })}
    </ul>
  );
}

/**
 */
export function Menu(props) {
  const [current, setCurrent] = useState(props.current);
  useEffect((val) => {console.group(`Menu item changed to "${current}"`)},[current])
  
  
  const selectHandler = (event, selected) => {
    alert(`Select new menu: ${selected}`)
    setCurrent(selected);
  }
  
  const actionHandler = (event, action, payload) => {
    alert(`Action ${action}(${payload || ""}) on ${event ? event.target : "nothing"}`)
  }
  
  return (<nav><SubMenu 
  selected={current}
  onSelect={selectHandler}
  onAction={actionHandler}
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