
import { log } from 'console';
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
 * @property {string[]|string} [className] The classnames of the component. 
 * @property {Record<string, string|string[]>} [styles] The record from style propoerty entry to the classname or classnames
 * of that style class names.
 */

/**
 * An action component represenst an aciton.
 * @template [TYPE=undefined] The type of the action value.
 * @param {ActionProps<TYPE>} props The action properties.
 */
export default function Action(props) {

    const handleClick = (e) => {
        if (!props.disabled) {
            log("Handling click");
            if (props.onClick) {
                props.onClick(e);
                log("Done onClick");
            }
            if (props.editAction && !props.readonly) {
                const newValue = props.editAction(props.name, props.value);
                log("Done editAction with value: " + props.value);
                if (props.action) {
                    props.action(props.name, newValue);
                    log("Done action with value: " + newValue);
                }
            } else {
                if (props.action) {
                    props.action(props.name, props.value);
                    log("Done action with value: " + props.value);
                }

            }
        } else {
            log("Action disabled");
        }
    }
    const classNames = (typeof props.className === "string" ? props.className.split(/\s+/) : props.className || []);
    if (props.styles) {
        ["diabled", "readonly", "horizontal"].forEach( propName => {
            if (propName in props) {
                log("Adding class for " + propName);
            }
            if (propName in props && typeof props[propName] === "boolean" && propName in props.styles) {
                const addedClasses = typeof props.styles[propName] === "string" ? props.styles[propName].split(/\s+/) : props.styles[propName];
                log(`Class candidates classes: [${addedClasses.join(",")}]`);
                addedClasses.forEach( addedClass => {
                    if (!addedClass in classNames) {
                        log(`Adding class ${addedClass}`);
                        classNames.push(addedClass);
                    }
                });
            }
     
        })
    }

    if (props.horizontal) {
        return props.imgSrc ? <img className={(classNames.join(" "))} src={props.imgSrc} alt={props.caption || props.name} onClick={handleClick} /> : 
        <span className={(classNames.join(" "))} onClick={handleClick}>[{props.caption || props.name}]</span>
    } else {
        return <div className={(classNames.join(" "))}v>{props.imgSrc ?
        <img className={(classNames.join(" "))} src={props.imgSrc} alt={props.caption || props.name} onClick={handleClick} /> :
        <span className={(classNames.join(" "))} onClick={handleClick}>[{props.caption || props.name}]</span>}</div>
    }
}