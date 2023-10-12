import React from 'react';
import {useState} from 'react';

import {CovenantDAO, applyChanges} from './modules.covenants.js';
import Covenant from './modules.covenant.js';


/**
 * Creates a covenant list component.
 */
export default function CovenantsComponent(props) {
  const [covenants, setCovenants] = useState((props.entries ?[...(props.entries)] : []));
  
  console.log(`Covenant list:`, covenants.join(", "));
  
  const handleUpdateCovenant = 
  (id, changes) => {
    
    // Commit the update
    if (props.onUpdate) {
      props.onUpdate(id, changes);
    }
    const target = covenants.find( (v) => (v && v.id === id));
    target && applyChanges(target, changes);
    setCovenants( (old) => (old.map( (c) => (c.id !== id ? c : target))));
  }
  
  const handleDeleteCovenant = (event, id) => {
    // Commit removal
    if (props.onDelete) {
      props.onDelete(id);
    }
    // Commit state change
    setCovenants(
      (old) => (old.filter( (c) => (id !== c.id)))
      );
  }
  
  return (
    <React.Fragment>
    {
      covenants.map( (e) => {
      if (e instanceof Covenant) {
      console.log(`Rendering covenant ${e.name}`)
        return (<li key={e.id||e.name}>
          {e.toString()}
                </li>);
      } else {
        return (<React.Fragment><p>Unknown</p></React.Fragment>)
      }})}
    </React.Fragment>
    );
}