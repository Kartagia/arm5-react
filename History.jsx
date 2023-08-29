import React from "react";
import { useState, useId} from "react";

import { Entry } from "./module.history.js";

let entryId = 1;
/**
 * Create a new entry. 
 * The creation adds the entry to the Rest service.
 */
function createEntry(title, date, description="") {
  
  
  return {
    id: `entry${entryId++}`,
    name: title,
    date: date,
    description: description
  };
}

function parseEntry( entry) {
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

function parseEntries( entries ) {
  if (entries instanceof Array) {
    
  } else if (entries instanceof Entry) {
    return [entries];
  } else {
    return [createEntry(entry.title, entry.date, entry.description)];
  }
}

/**
 * Create a history component.
 * @param {React.Props} props
 * 
 */
export default function HistoryComponent(props) {
  const [entries, setEntries] = React.useState([ ...(props.entries||[])]);
  const ids = {
    name: "newEntry.name",
    date: "newEntry.date",
    desc: "newEntry.desc"
  }
  
  
  const handleAdd = (event) => {
    event.preventDefault();
    console.log("Handling add entry event: ", event);
    setEntries( (old) => {
      
      const newName = document.getElementById(ids.name).value;
      const newDate= document.getElementById(ids.date).value;
      const newDesc= document.getElementById(ids.desc).value;
      
      
      const entry = createEntry(newName, newDate, newDesc);
      alert(`Adding entry[${entry.id}] ${newName}:${newDate}:${newDesc}`);
      return [...old, entry];
    });
  };
  
  const handleRemove = (event, index) => {
    alert(`Removing entry ${index}`);
    setEntries( (old) => {
      return old.filter( (e) => (e.id != index) );
    })
  };
  
  return (
    <section className={"history"}>
    {
      
      entries.map(
        (entry) => {
          console.log(`Entry ${entry.id || "NoIndex"}: `, entry);
          if (entry instanceof Object) {
            return (
            <article key={entry.id || index}><b>On {entry.date}: {entry.name}</b>{entry.description?`: ${entry.description}`:""}
            <button name={`remove-${entry.id}`} value="Remove" onClick={(e) => handleRemove(e,entry.id)}/>
            </article>
            );
          } else {
            return (
            <p key={index} sx={{display: none}}>Undefined entry {index}</p>
            )
          }
        }
        
      )
    }
    <form method="post">
      <input id={ids.name} name="name" type="text"/>
      <input id={ids.date} name="date"/>
      <input id={ids.desc} name="desc"/>
      <input type="submit" onClick={
        handleAdd
      } value="Add" />
    </form>
    </section>
    );
}