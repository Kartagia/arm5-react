import { useState } from 'react';

export const style = {
  color: {
    foreground: "silver",
    background: "navy"
  }
}

export const classes = Object.fromEntries(
  ["horizontal", "vertical", "icon"].map(className => [className, className])
);

/**
 * @typedef {Object} MenuStruct
 * @property {string} title The vaption of the menu item.
 * @property {MenuStruct[]} [entries] The sub menu entries.
 * @property {boolean} [open] Is the submenu open.
 * @property {string|Function} [action] The action state name, or the function handling the menu item selection.
 * @property {boolean} [hidden] Is the entry hidden.
 * @property {boolean} [disabled] Is the menu item disabled.
 * @property {style} [style] The style of the menu.
 */

/**
 * @typedef {Object} MenuProps
 * @property {string} title The title of thf menu or menu item.
 * @property {MenuStruct[]} [entries] The menu entries.
 * @property {string} [style="horizontal"] The menu style.
 * @property {Function} [onSelect] The listener listening the selevtion of a menu item with action name.
 * @property {boolean} [hidden] Is the entry hidden.
 * @property {boolean} [disabled] Is the menu item disablwd
 */

/**
 * Define menu content structure from properties.
 * @param {MenuProps} props
 * @returns {MenuStruct} The menu struct derived from properties.
 * 1
 */
export function defineContent(props) {
  if (props.value) {
    return {
      title: props.value.title,
      action: props.value.action,
      entries: props.value.entries,
      open: (props.value.entries instanceof Array ? props.value.open == true : null),
      hidden: props.value.hidden,
      style: props.value.style
    }
  } else {
    return {
      title: props.title,
      action: props.action,
      entries: props.entries,
      open: (props.entries instanceof Array ? props.open == true : null),
      hidden: props.hidden,
      style: props.style || 'vertical'
    }
  }
}

/**
 * MenuItem component.
 * @param {MenuProps} props
 */
export function MenuItem(props) {
  const [content, setContent] = useState(() => defineContent(props));

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

  return (<li className={content.style} >
    <a onClick={handleSelect}>{content.title}</a>
    {
      content.entries && <SubMenu value={content.entries} open={content.open} />
    }
  </li>);
}

export function SimpleMenuItem(props) {
  console.table(props.value);
  return <li><a>${props.value && props.value.title}</a></li>;
}

export function SubMenu(props) {
  return (
    <ul className={props.style || 'horizontal'}>
      {props.entries.map(entry => {
    return <SimpleMenuItem style={props.style} value={entry} onSelect={props.onSelect} />;
  })}
    </ul>
  );
}

/**
 * Menu Component. 
 * 
 * @param {MenuProps} props
 */
export function Menu(props) {
  console.table(props);
  return (<nav><SubMenu 
  entries={props.entries || []} title={props.title || null} style={props.style || 'horizontal'} /></nav>);
}