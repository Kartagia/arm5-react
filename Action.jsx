
import React from 'react';


/**
 * An action defining properites.
 * @template [TYPE=undefined] The action value type.
 * @typedef {Object} ActionProps
 * @property {boolean} [horizontal=false] Does the action generate horizontal layout actions.
 * @property {string} name The action name.
 * @property {TYPE} [value] The action value. 
 * @property {string} [caption] The caption of the cation. Defaults to the name.
 * @property {URL} [iconSrc] The icon source URL, if the action has icon.
 * @property {EventListener} [onClick] The event listener triggering on the action.
 * @property {(name : string, value?: TYPE) => Void} [action] The action triggered on action.
 */

/**
 * An action component represenst an aciton.
 * @template [TYPE=undefined] The type of the action value.
 * @param {ActionProps} props The action properties.
 */
export default function Action(props) {

    const handleClick = (e) => {
        if (props.onClick) {
            props.onClick(e);
        }
        if (props.action) {
            props.action(props.name, props.value);
        }
    }

    if (props.horizontal) {
        return props.imgSrc ? <img src={props.imgSrc} alt={props.caption || props.name} onClick={handleClick} /> : <span onClick={handleClick}>[{props.caption || props.name}]</span>
    } else {
        return <div>{props.imgSrc ? <img src={props.imgSrc} alt={props.caption || props.name} onClick={handleClick} /> : <span onClick={handleClick}>[{props.caption || props.name}]</span>}</div>
    }
}