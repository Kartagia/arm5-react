import React from "react";
import { useState, useId } from "react";
import PropTypes from "prop-types";

import CovenantDAO from "./modules.covenants.js";
import Covenant from "./modules.covenant.js";
// eslint-disable-next-line no-unused-vars
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
  const ids = {
    type: useId(),
    name: useId(),
    submit: useId(),
  };
  const names = {
    type: "newType",
    name: "Name",
    submit: "Create",
  };
  const dao = new CovenantDAO(covenants);

  /**
   * Hnadle the select of a covenant event.
   * @param {Event} event The event causing selecting of the covenant.
   * @param {number} id The identifier of the selected covenant.
   */
  const handleSelectCovenant = (event, id) => {
    alert(`Covenant #${id} selected: ${dao.retrieve(id)}`);

    // TODO: Open the dialogue for covenant information.
  };

  // eslint-disable-next-line no-unused-vars
  const handleUpdateCovenant = (id, changes) => {
    // Update the covenant info
    // Commit the update
    if (props.onUpdate) {
      props.onUpdate(id, changes);
    }
    const newId = dao.update(id, changes);
    setCovenants((old) =>
      old.map((c) => (c.id == id ? dao.retrieve(newId) : c))
    );
  };

  /**
   * Handle the removeal of the covenant.
   * @param {Event} event The event causing the deletion of the covenant.
   * @param {number} id The identifier of the removed covenant.
   */
  const handleRemoveCovenant = (event, id) => {
    // Commit removal
    if (props.onDelete) {
      props.onDelete(id);
    }
    dao.remove(id);

    // Commit state change
    setCovenants((old) => old.filter((c) => id !== c.id));
  };

  const handleRemoveTribunal = (event, id) => {
    alert(
      `<h1>Delete Tribunal</h1><Trying><p>Trying to delete tribunal ${id}</p>`
    );
  };

  const handleSelectTribunal = (event, id) => {
    alert(`<h1>Select Triubnal</h1><p>Selected Tribunal ${id}</p>`);
  };

  // eslint-disable-next-line no-unused-vars
  const handleUpdateTribunal = (event, id, changes) => {
    alert(
      `<h1>Update Tribunal</h1></h1><p>Trying to update tribual ${id} with changes ${changes}</p>`
    );
  };

  /**
   *Handle adding new entry.
   * @param {import("react").FormEvent} event
   */
  const handleAddEntry = (event) => {
    alert(`Hadle add event ${event.target}`);
    event.preventDefault();

    const type = event.target[names.type].value;
    const name = event.target[names.name].value;
    alert(`Handle add ${type} of ${name}`);
    if (type === "Tribunal") {
      alert(`<h1>Create Tribunal ${name}</h1>`);
    } else {
      alert(`<h1>Create Covenant ${name}</h1>`);
      const newId = dao.create({ name: name });
      alert(`Created covenant: ${newId}: ${dao.retrieve(newId)}`);
      if (newId) {
        setCovenants((old) => [...old, dao.retrieve(newId)]);
      }
    }
  };

  return (
    <React.Fragment>
      <ul>
        {covenants.map((e, index) => {
          if (e instanceof Covenant) {
            return (
              <li key={e.id}>
                <span
                  onClick={(event) => {
                    handleSelectCovenant(event, e.id);
                  }}
                >
                  {e.name}({e.magi.length})
                </span>
                <em
                  onClick={(evt) => {
                    handleRemoveCovenant(evt, e.id);
                  }}
                >
                  X
                </em>
              </li>
            );
          } else if (e instanceof Tribunal) {
            return (
              <li key={e.id}>
                <span
                  onClick={(event) => {
                    handleSelectTribunal(event, e.id);
                  }}
                >
                  Tribuanl of {e.name}
                </span>
                <em
                  onClick={(event) => {
                    handleRemoveTribunal(event, e.id);
                  }}
                >
                  X
                </em>
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
        <li className={"addNew"}>
          <form method="POST" onSubmit={(event) => handleAddEntry(event)}>
            <div>
              <label>Covenant</label>
              <input
                name={names.type}
                value={"Covenant"}
                type={"radio"}
                checked
              />
              <label>Tribunal</label>
              <input name={names.type} value={"Tribunal"} type={"radio"} />
            </div>
            <div>
              <label htmlFor={ids.name}>Name</label>
              <input
                id={ids.name}
                name={names.name}
                type={"text"}
                placeholder="Enter the name of the created"
              ></input>
            </div>
            <div>
              <input type={"submit"} name={names.submit} value={"Create"} />
            </div>
          </form>
        </li>
      </ul>
    </React.Fragment>
  );
}

CovenantListComponent.defaultProps = {
  editable: false,
};
CovenantListComponent.propTypes = {
  entries: PropTypes.arrayOf(Covenant),
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
  editable: PropTypes.bool,
};
