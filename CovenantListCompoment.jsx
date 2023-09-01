import React from "react";
import { useState } from "react";
import PropTypes from "prop-types";

import CovenantDAO from "./modules.covenants.js";
import Covenant from "./modules.covenant.js";
import CovenantComponent from "./Covenant.jsx";
import { Tribunal } from "./arm5.js";

function TribunalComponent({ entry, ...props }) {
  const handleUpdate = (id, changes) => {
    if (props.onUpdate) {
      props.onUpdate(
        entry.id,
        (tribunal) => tribunal && tribunal.updateCovenant(id, changes)
      );
    }
    entry.updateCovenant(id, changes);
  };

  const handleDelete = (id) => {
    if (props.onDelete) {
      props.onDelete(id);
    }
    if (entry.removeCovenant(id)) {
      if (props.onUpdate) {
        // The Tribuanl was updated.
        props.onUpdate(
          entry.id,
          (tribunal) => tribunal && tribunal.removeCovenant(id)
        );
      }
    }
  };

  return (
    <section className={"tribunal"}>
      <header>Tribunal of {entry.name}</header>
      <CovenantListComponent
        entries={entry.members}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </section>
  );
}
TribunalComponent.propTypes = {
  name: PropTypes.string,
  props: PropTypes.map,
  onDelete: PropTypes.func,
  onUpdate: PropTypes.func,
  entry: PropTypes.objectOf(Tribunal),
};

/**
 * Creates a covenant list component.
 */
export default function CovenantListComponent(props) {
  const [covenants, setCovenants] = useState(props.entries || []);
  const dao = new CovenantDAO(covenants);

  const handleUpdateCovenant = (id, changes) => {
    // Update the covenant info
    // Commit the update
    if (props.onUpdate) {
      props.onUpdate(id, changes);
    }
    const newId = dao.updateCovenant(id, changes);
    setCovenants((old) =>
      old.map((c) => (c.id == id ? dao.retrieve(newId) : c))
    );
  };

  const handleDeleteCovenant = (id) => {
    // Commit removal
    if (props.onDelete) {
      props.onDelete(id);
    }
    dao.removeCovenant(id);

    // Commit state change
    setCovenants((old) => old.filter((c) => id !== c.id));
  };

  const handleDeleteTribunal = (id) => {
    alert(
      `<h1>Delete Tribunal</h1><Trying><p>Trying to delete tribunal ${id}</p>`
    );
  };

  const handleUpdateTribunal = (id, changes) => {
    alert(
      `<h1>Update Tribunal</h1></h1><p>Trying to update tribual ${id} with changes ${changes}</p>`
    );
  };

  return (
    <React.Fragment>
      {covenants.map((e, index) => {
        if (e instanceof Covenant) {
          return (
            <li key={e.id}>
              <CovenantComponent
                entry={e}
                onUpdate={(id, changes) => {
                  handleUpdateCovenant(id, changes);
                }}
                onDelete={(id) => {
                  handleDeleteCovenant(id);
                }}
              />
            </li>
          );
        } else if (e instanceof Tribunal) {
          return (
            <li key={e.id}>
              <TribunalComponent
                entry={e}
                onUpdate={(id, changes) => {
                  handleUpdateTribunal(id, changes);
                }}
                onDelete={(id) => {
                  handleDeleteTribunal(id);
                }}
              />
            </li>
          );
        } else {
          return (
            <React.Fragment key={index}>
              <p className={{ display: "hidden" }}>
                Invalid entry at index {index}
              </p>
            </React.Fragment>
          );
        }
      })}
    </React.Fragment>
  );
}

CovenantListComponent.defaultProps = {};
CovenantListComponent.propTypes = {
  entries: PropTypes.arrayOf(Covenant),
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
};
