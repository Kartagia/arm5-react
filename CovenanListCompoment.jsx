import React from 'react';
import {useState} from 'react';

import {CovenantDAO} from './modules.covenants.js';
import Covenant from './modules.covenant.js';


/**
 * Creates a covenant list component.
 */
export default function CovenantsComponent(props) {
  const [covenants, setCovenants] = useState((props.entries ? new props.entries : []));
  const covenantDao = new CovenantDAO(covenants);
  
  console.log(`Covenant list:`, covenants);
  
  const handleUpdateCovenant = 
  (id, changes) => {
    
    // Commit the update
    if (props.onUpdate) {
      props.onUpdate(id, changes);
    }
    const result =covenantDao.update(id, changes);
    setCovenants( (old) => (old.map( (c) => (c.id !== id ? c : result))));
  }
  
  const handleDeleteCovenant = (event, id) => {
    // Commit removal
    if (props.onDelete) {
      props.onDelete(id);
    }
    covenantDao.remove(id);
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
      console.log(`Rendering covenant ${e}`)
        return (<li key={e.id}>
          {""+e}
                </li>);
      } else {
        return (<React.Fragment><p>Unknown</p></React.Fragment>)
      }})}
    </React.Fragment>
    );
}