import React from 'react';
import ReactDOM from 'react-dom';

import Spells from './Spells.jsx';
import SpellView from './SpellView.jsx';
import { fetchGuidelines } from './modules.spellguidelines.js';
const rootNode = document.getElementById("react-app");
fetchGuidelines("./guidelines.txt").then(
    (guidelines) => {
        console.log("Guidelines read");
        if ("createRoot" in ReactDOM) {
            console.log("React 18 rendering")
            const root = createRoot(rootNode);
            root.render(<Spells guidelines={guidelines}/>);
        } else {
            console.log("React 17 rendering")
            ReactDOM.render(<Spells guidelines={guidelines}/>, rootNode)
        }        
    },
    (error) =>{
        console.error("Could not load guidelines", error);
    }
);

