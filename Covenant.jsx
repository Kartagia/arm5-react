import React from 'react';
import ReactDOM from 'react-dom';

import { getTribunals } from './arm5.js';
import { getArts } from './modules.art.js';
import History from "./History.jsx";


export default function Covenant(props) {
  const covenant = props.covenant;
  
  // Create result
  return (
    <React.Fragment><h1>Covenant of {covenant.name}</h1>
    {props.children}
    <History>
    <p>Test child paragraph</p>
    </History>
    </React.Fragment>
    );
}