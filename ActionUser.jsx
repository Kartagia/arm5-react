import React from 'react';

import Action from './Action.jsx';

/**
 * @typedef {Object} ActionUserProps
 * @property {TYPE[]} [items=[]] THe items of the action user.
 * @property {Action<TYPE>[]} [actions=[]] The list of actions for each item.
 */

/**
 * 
 * @template TYPE The value type of the action user items.
 * @param {ActionUserProps<TYPE>} props 
 * @returns 
 */
export default function ActionUser(props) {
    const [items, setItems] = React.useState(props.items ||[]);
    const [actions, setActions] = React.useState(props.actions || []);

    /**
     * 
     * @param {TYPE} item The item.
     * @return {Action<TYPE>[]}
     */
    const itemActions = (item) => {
        if (typeof item === "object" && "value" in item &&  typeof item.value === "boolean") {
            return [<Action name="toogle" caption="Toggle" value={item.value} action={ 
                (value) => {setItems( current => (current != item ? current : {...item, value } ))} 
            }  editAction={ (value) => (!value)}></Action>];
        } else {
            return [];
        }
    };

    return (<div>{items.map( item => (<div><span>{item.name}</span><span>{[...actions, ...ActionUser(itemActions(item))].map( action => (<React.Fragment key={action.name}>{action}</React.Fragment>))}</span></div>))}</div>)
}