import React from 'react';


export default function ActionUser(props) {
    const [items, setItems] = React.useState(props.items ||[]);
    const [actions, setActions] = React.useState(props.actions || []);

    return (<div>{items.map( item => (<div><span>{item.name}</span><span>{props.actions.map( action => (<React.Fragment key={action.name}>{action}</React.Fragment>))}</span></div>))}</div>)
}