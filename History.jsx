// eslint-disable-next-line no-unused-vars
import React from "react";
import { useState, useId } from "react";
import PropTypes from "prop-types";

import { Entry } from "./module.history.js";
import { IdGenerator } from "./modules.idGenerator.js";

/**
 * The id generator used to generate identfiers for the history entries.
 */
const entryId = IdGenerator.from(1);
/**
 * Create a new entry.
 * The creation adds the entry to the Rest service.
 */
function createEntry(title, date, description = "") {
  return {
    id: entryId.next(),
    name: title,
    date: date,
    description: description,
  };
}

/**
 * Parses the entry.
 * @param {Entry|string|object} entry
 * @returns {Entry} The parsed entry.
 */
function parseEntry(entry) {
  if (entry instanceof Entry) {
    return entry;
  } else if (typeof entry === "string") {
    let data = entry.split(":");
    if (data && data[0].startsWith("On ")) {
      return createEntry(data[1].substring("On ".length), data[0], data[2]);
    } else {
      throw new SyntaxError("Invalid entry");
    }
  } else if (typeof entry === "object") {
    return createEntry(entry.name, entry.date, entry.desc);
  }
}

/**
 * The type representing possible ways ot express history entries.
 * @typedef {Entry|string} EntryRep
 */

/**
 *
 * @param {Array<EntryRep>} entries The parsed entries.
 * @returns {Array<Entry>} The parsed entries.
 * @throws {TypeError|SyntaxError|RangeError} Any entry was invalid.
 */
function parseEntries(entries) {
  if (entries instanceof Array) {
    return entries.map((entry) => parseEntry(entry));
  } else if (entries instanceof Entry) {
    return [entries];
  } else {
    return [parseEntry(entries)];
  }
}

/**
 * Create a history component.
 * @param {React.Props} props
 * @param {Array<Entry>} [props.entries=[]] The list of entries.
 */
export default function HistoryComponent(props) {
  const [entries, setEntries] = useState([parseEntries(props.entries || [])]);
  const ids = {
    name: useId(),
    date: useId(),
    desc: useId(),
  };

  const handleAdd = (event) => {
    event.preventDefault();
    console.log("Handling add entry event: ", event);
    setEntries((old) => {
      const newName = document.getElementById(ids.name).value;
      const newDate = document.getElementById(ids.date).value;
      const newDesc = document.getElementById(ids.desc).value;

      const entry = createEntry(newName, newDate, newDesc);
      alert(`Adding entry[${entry.id}] ${newName}:${newDate}:${newDesc}`);
      return [...old, entry];
    });
  };

  const handleRemove = (event, index) => {
    alert(`Removing entry ${index}`);
    if (props.onRemove instanceof Function) {
      props.onRemove(index);
    }
    setEntries((old) => {
      return old.filter((e) => e.id != index);
    });
  };

  return (
    <section className={"history"}>
      {entries.map((entry, index) => {
        console.log(`Entry ${entry.id || "NoIndex"}: `, entry);
        if (entry instanceof Object) {
          return (
            <article key={entry.id || index}>
              <b>
                On {entry.date}: {entry.name}
              </b>
              {entry.description ? `: ${entry.description}` : ""}
              <button
                name={`remove-${entry.id}`}
                value="Remove"
                onClick={(e) => handleRemove(e, entry.id)}
              />
            </article>
          );
        } else {
          return (
            <p key={index} className={{ display: "none" }}>
              Undefined entry {index}
            </p>
          );
        }
      })}
      <section name="addEvent">
        <form method="post">
          <caption>Create Event</caption>
          <article>
            <label htmlFor={ids.name}>Name</label>
            <input id={ids.name} name="name" type="text" />
          </article>
          <article>
            <label htmlFor={ids.date}>Date</label>
            <input id={ids.date} name="date" />
          </article>
          <article>
            <label htmlFor={ids.desc}>Description</label>
            <input id={ids.desc} name="desc" />
            <input type="submit" onClick={handleAdd} value="Add" />
          </article>
        </form>
      </section>
    </section>
  );
}

HistoryComponent.defaultProps = {
  entries: [],
};

HistoryComponent.propTypes = {
  entries: PropTypes.arrayOf(Entry),
  onRemove: PropTypes.func,
  onUpdate: PropTypes.func,
};
