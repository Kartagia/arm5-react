import React from 'react';
import {useState, useEffect, useId, Fragment} from 'react';
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
    action: props.action,
    menuStyle: props.menuStyle || 'horizontal'
  });
  const [open, setOpen] = useState(props.value.entries ? props.open == true : undefined);
  
  const fireAction = (event, action) => {
    if (action) {
      alert(`Engaging action: ${action}`);
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

  return (<li className={content.menuStyle} >
    <a onClick={handleSelect}>{(content.title || (<p />))
    }</a>
    {
      props.open && <SubMenu
      menuStyle="vertical"
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
  console.log(`Style: ${props.menuStyle}`);
  console.table(props);
  console.groupEnd();
  return (
    <ul hidden={(props.open && props.open == false)} className={(props.menuStyle ? props.menuStyle : 'horizontal')} >
      {props.entries.map( (entry) => {
      console.log(`Entry ${entry.title}`)
    return <MenuItem key={entry.title}
    open={(props.selected == entry.title)}
    onSelect={props.onSelect}
    menuStyle={props.sälenuStyle} value={entry} onAction={props.onAction} />;
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
    if (props.onAction) {
      props.onAction(event, action, payload);
    }
  }
  
  return (<nav><SubMenu 
  selected={current}
  onSelect={selectHandler}
  onAction={actionHandler}
  entries={props.entries || []} title={props.title || null} menuStyle={props.menuStyle || 'horizontal'} /></nav>);
}

export function ErrorView({title=undefined, code=404, message="Not found"}) {
  return (<div>
  <h1>{(title || `Error ${code}: ${message}`)}</h1>
  <dl>
  <dt>Code</dt><dd>{code}</dd>
  <dt>Message</dt><dd>{message}</dd>
  </dl></div>)
}

export function MyView(props) {
  
  return (<main>{(props.children || [])}</main>);
}

export function Main(props) {
  const [view, setView] = useState([]);
  const ref=useId();
  
  const contents = {
    "Open": () => (<div><h1>Open</h1></div>),
    "Save": () => (<div><h1>Save</h1></div>)
  };
  
  const selectContent = (event, state, payload) => {
    alert(`Selecting path ${state} of ${contents[state]}`)
    if (state in contents) {
      setView(contents[state]());
    } else {
      setView((()=>(<ErrorView code="404" message={`Not Found: ${state}`} />))());
    }
  };
  
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
  
  
  return (<Fragment><header className={{height: "25%"}}><Menu
  onAction={selectContent}
  menuStyle="horizontal" entries={menu} /></header>
  <MyView className={{height: "75%"}}>{view}</MyView></Fragment>)
}

const domNode = document.getElementById('react-app');
const root = ReactDOM.createRoot(domNode);
root.render(<Main />);