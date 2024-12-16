import { useState } from "react";
import { Icon } from '@material-ui/core';
import Spells from "./Spells.jsx";

/**
 * Menu item data type.
 * 
 * @typedef {Objec} MenuItem
 * @property {ReactElement} [title] The title of the menu entry shown in menu.
 * @property {string} name The name of the menu entry. This is used as key.
 * @property {IconProps} [icon] The menu icon.
 * @property {(event: Event)->Void} [onClick] The event handler of the menu click.
 */

/**
 * @typedef {MenuItemProps & {children: ReactElement[] = []}} MenuItemProps
 */

export function MenuItem(props) {
    return (<li className="menu" onClick={onClick}>{props.icon && <img src={props.icon.src} alt={props.icon.alt} onClick={props.onClick}></img>}{props.children}</li>)   
}

/**
 * @typedef {Object} SpellViewProps
 * @property {MenuItem[]} menu The menu item.
 * @property {import("./modules.spellguidelines").SpellGuideline[]} [guidelines] The spell guidelines.
 * @property {()}
 */

/**
 * 
 * @param {SpellViewProps} props 
 * @returns {import("react").ReactElement}
 */
export function SpellView(props) {
    const [guidelines, setGuidelines] = useState(props.guidelines ? props.guidelines : [])

    return (<div className={props.className}>
        <header><h1>{props.title && props.title}</h1></header>
        <nav><ul className="menu">{
            (props.menu ? props.menu : []).map(
                item => (<MenuItem icon={item.icon} key={item.name}>{item.title}</MenuItem>)
            )
        }</ul></nav>
        <main>
            <Spells guidelines={guidelines} onChange={
                event => {

                }
            }/>
        </main>
        <footer></footer>
    </div>);
}