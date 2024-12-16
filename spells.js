import React from 'react';
import ReactDOM from 'react-dom';

import Spells from './Spells.jsx';
import SpellView from './SpellView.jsx';
const rootNode = document.getElementById("react-app");
fetch("./guidelines.json").then(
    (response) => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(`Response status: ${response.status}`);
        }
    }
).then(
    (guidelines) => {
        console.log("Guidelines read");
        const guidelineList = Object.getOwnPropertyNames(guidelines).reduce( (result, form) => (Object.getOwnPropertyNames(guidelines[form]).reduce(
            (list, tech) => {
                return Object.getOwnPropertyNames(guidelines[form][tech]).reduce( (values, level) => {
                    return [...values, ...(guidelines[form][tech][level])]
                }, list)
            }, result)), []);
        

        if ("createRoot" in ReactDOM) {
            console.log("React 18 rendering")
            const root = createRoot(rootNode);
            root.render(<Spells guidelines={guidelineList}/>);
        } else {
            console.log("React 17 rendering")
            ReactDOM.render(<Spells guidelines={guidelineList}/>, rootNode)
        }        
    },
    (error) =>{
        console.error("Could not load guidelines", error);
    }
);

