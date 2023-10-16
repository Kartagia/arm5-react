import React from 'react';
import ReactDOM from 'react-dom';

import { ucFirst } from "././module.utils.js";

import PersonList from "./PersonList.jsx";

import History from "./History.jsx";




export default function Covenant(props) {
  const covenant = props.covenant;

  // Create result
  return (
    <React.Fragment><h1>Covenant of {covenant.name}</h1>
    <h2>Members</h2>
    {["magi", "companions", "grogs"].map( (type) => {
      if (covenant[type]) {
        return (<PersonList 
        key={type} title={ucFirst(type)} 
        members={covenant[type]} registry={(covenant.people || [])} />);
      } else {
        return null;
      }
    })}
    <History>
    <p>Test child paragraph</p>
    </History>
    </React.Fragment>
  );
}