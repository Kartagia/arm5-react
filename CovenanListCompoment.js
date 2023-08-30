import React from 'react';
import {useEvent} from 'react';

import covenants from './module.covenants.js';
import {Covenant} from './module.covenant.js';
import CovenantComponent from './Covenant.jsx';
import {Tribunal} from './arm5.js';

function TribunalComponent({entry, ...props}) {
  return (<section className={"tribunal"}><header>Tribunal of {entry.name}</header><CovenantsComponent entries={entry.members}/></section>);
}

/**
 * Creates a covenant list component.
 */
export default function CovenantsComponent(props) {
  const [covenants, setCovenants] = useState(props.enrries || covenants.getCovenants());
  
  const handleUpdateCovenant = 
  (id, changes) => {
    // Update the covenant info
    const changes = {
      
    };
    
    // Commit the update
    if (props.onUpdate) {
      props.onUpdate(id, changes);
    } 
    covenants.updateCovenant(covenant.id, changes);
    
  }
  
  const handleDeleteCovenant = (event, id) => {
    // Commit removal
    if (props.onDelete) {
      props.onDelete(id);
    }
    covenants.removeCovenant(id);
    // Commit state change
    setCovenants(
      (old) => (old.filter( (c) => (id !== c.id)))
      );
  }
  
  return (
    <React.Fragment>
    {
      entries.map( (e) => {
      if (e instanceof Covenant) {
        return (<li key={e.id}>
                <CovenantComponent entry={e} onUpdate={(id, changes) => {
                handleUpdateCovenant(id, changes);
                  
                }}
                onDelete={
                (evt) => {handleDeleteCovenant(evr, e.id)
                  
                }}/>
                </li>);
      } else if (e instanceof Tribunal) 
        return (<li key={e.id}>
        <TribunalComponent entry={e} />
        </li>);
      else {
        return (<React.Fragment></React.Fragment>)
      })}}
    </React.Fragment>
    );
}