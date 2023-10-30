import React from "react";
import { useState, useId } from "react";

import {
  Entry,
  parseEntry,
  createEntry,
  parseEntries,
} from "./module.history.js";

/**
 * @typedef {React.ComponentProps & Object} HistoryProps The properties of history.
 * @property {Array<EntryType>} [entries=[]] The list of history entries.
 */

/**
 * Create a history component.
 * @param {React.ComponentProps & {EntryProps}} props
 *
 */
export default function HistoryComponent(props) {
  const [entries, setEntries] = React.useState([...(props.entries || [])]);
  const ids = { name: useId(), date: useId(), desc: useId() };

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
            <article key={entry.id || index} className={entry}>
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
            <p key={index} className={"entry"} hidden={true}>
              Undefined entry {index}
            </p>
          );
        }
      })}
      <form method="post">
        <input id={ids.name} name="name" type="text" />
        <input id={ids.date} name="date" />
        <input id={ids.desc} name="desc" />
        <input type="submit" onClick={handleAdd} value="Add" />
      </form>
    </section>
  );
}
