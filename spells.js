import React from 'react';
import ReactDOM from 'react-dom';

import Spells from './Spells.jsx';
import SpellView from './SpellView.jsx';
import { fetchJsonGuidelines } from './modules.spellguidelines.js';

/**
 * Render the root node.
 * 
 * @param {Node} rootNode The root node of the rednering.
 * @param {import('./modules.spellguidelines.js').SpellGuideline[]} guidelines The spell guidelines.
 */
function renderRoot(rootNode, guidelines) {
    if ("createRoot" in ReactDOM) {
        console.log("React 18 rendering")
        const root = createRoot(rootNode);
        root.render(<Spells guidelines={guidelines}/>);
    } else {
        console.log("React 17 rendering")
        ReactDOM.render(<Spells guidelines={guidelines}/>, rootNode)
    }        
}

const rootNode = document.getElementById("react-app");
const guidelines = fetchJsonGuidelines("./guidelines.json").then(
    (guidelines) => {
        renderRoot(rootNode, guidelines);
    }
);
