
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
 * @property {(name : string, value?: TYPE) => TYPE} [editAction] The edit action triggered on action. The edit
 * is performed before action, and the resulting value is sent as the action.
 * @property {boolean} [disabled=false] Is the action disabled.
 * @property {boolean} [readonly=false] Is the component read-only. Read-only disables all modification
 * actions.
 */

/**
 * An action component represenst an aciton.
 * @template [TYPE=undefined] The type of the action value.
 * @param {ActionProps} props The action properties.
 */
export default function Action(props) {

    const handleClick = (e) => {
        if (!props.disabled) {
            if (props.onClick) {
                props.onClick(e);
            }
            if (props.editAction && !props.readonly) {
                const newValue = props.editAction(props.name, props.value);
                if (props.action) {
                    props.action(props.name, newValue);
                }
            } else {
                if (props.action) {
                    props.action(props.name, props.value);
                }

            }
        }
    }

    if (props.horizontal) {
        return props.imgSrc ? <img src={props.imgSrc} alt={props.caption || props.name} onClick={handleClick} /> : <span onClick={handleClick}>[{props.caption || props.name}]</span>
    } else {
        return <div>{props.imgSrc ? <img src={props.imgSrc} alt={props.caption || props.name} onClick={handleClick} /> : <span onClick={handleClick}>[{props.caption || props.name}]</span>}</div>
    }
}