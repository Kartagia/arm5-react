import React from 'react';
import { Fragment, useState, useId} from 'react';
import ReactDOM from 'react-dom';

import { Covenant as CovenantModel } from './modules.covenant.js';

import { chooseProps, getValueOfProp } from "./components.person.js";

export function Test(props) {
  return (<h1>This is test</h1>);
}

export const Ability = (props) => {
  return <span>{`${props.name} ${props.score || 0} (${props.xp||0})`}</span>;
}

export const Person = (props) => {

  // Standard mode
  return (<article>
  <h2>{props.value.name}</h2>
  <div>{
    (props.value.abilities|| []).map(
    (ability) => (<Ability key={ability.name} value={ability} />)
    )
  }</div>
  </article>);

  // Brief mode
  return (<div>{props.value}</div>);
};

function getPersonModel(prop) {
  if (typeof prop === "string") {
    console.log(`JSON "${prop}"`)
    return JSON.parse(prop);
  } else if (prop instanceof Object) {
    console.log(`Object ${prop.id}`)
    console.table(prop);
    return {...prop};
  } else {
    console.log("Unknown person");
    return undefined;
  }
}

/**
 * PersonList component
 * @param {Array<PersonModel>} [props.value] The listed people.
 * @param {string|Fragment} [props.title] The title of the list.
 * @param {string} [props.mode=""] The list mode.
 */
export const PersonList = (props) => {
  const [mode, setMode] = useState(props.mode || "");
  const [entries, setEntries] = useState((props.value || []));

  const handleMenuSelect = (event) => {
    if (event && event.target && event.target.value) {
      setMode(event.target.value);
    }
  };

  const handleChange = (change) => {
    if (change) {
      const setState = setMagi;
      switch (change.type) {
        case "delete":
          // Delete entry
          if (change.index) {
            setState((old) => ([...(old.slice(0, change.index)), ...(old.slice(change.index+1))]));
          } else {
            setState( (old) => (
              old.filter( (entry) => (entry == null || entry.id !== change.id))
            ));
          }
        case "update":
          //;Update state
        case "revert":
          // Revert member
          const original = (props.value || []).find((v) => (v && v.id === change.id));
          if (original) {
            if (change.index) {
              setEntries((old) => {
                return old.map((entry, index) => (index === change.index ? original : entry))
              })
            } else {
              setEntries((old) => {
                return old.reduce(
                  (acc, entry) => {
                    if (entry || (entry.id !== change.id)) {
                      acc.value.push(entry);
                    } else {
                      acc.value.push(original);
                    }
                    return acc;
                  }, { value: [] }
                ).value
              })
            }
          } else {
            // Deleting added entry
            if (change.index) {
              setEntries((old) => ([...(old.slice(0, change.index)),
            ...(old.slice(change.index + 1))]));
            } else {
              setEntries((old) => {
                return old.reduce(
                  (acc, entry) => {
                    if (entry || (entry.id !== change.id)) {
                      acc.value.push(entry);
                    }
                    return acc;
                  }, { value: [] }
                ).value
              })
            }
          }
        case "submit":
          return fireChange({
            type: "update",
            target: change.index,
            payload: members[change.index]
          });
      }
    }
  }

  const fireChange = (change) => {
    if (props.onChange instanceof Function) {
      props.onChange(change);
    }
  }
  
  
  console.group(`Person List ${mode}`);
  console.table(entries);
  console.groupEnd();
  const entryComponent = entries.map((entry) => {
    const comp = (<article>{entry.id || null}: {entry.name || "Unknown"} ex {entry.house || "Orbus"}</article>)
    return comp;
  });

  return (
    <section>
    <main>Person List</main>
    </section>
  );
}


export const Covenant = (props) => {
  console.group(`${props.mode} Covenant: ${(props.name || props.value && props.value.name)}`);
  const data = {
    name: (props.name || props.value && props.value.name),
    magi: (props.magi || props.value && props.value.magi || [])
  };
  
  console.table(data);
  const createContent =
    (source, covenant) => {
      switch (source.mode || "") {
        case "brief":
          return (<span>{covenant.name}</span>);
        default:
          return (
            <Fragment>
              <div>{covenant.name}</div>
              <PersonList 
              title="Magi" value={covenant.magi || []} />
              </Fragment>);
  
      }
    };
  const content = createContent(props, data);
  console.groupEnd();
  
  if (props.parent != null) {
    return (<article onClick={props.onClick}>{content || null}</article>);
  } else {
    return (<div onClick={props.onClick} >{content || null}</div>);
  }
};

function CovenantUI(props) {
  const footer = useId();
  const [selected, setSelected] = React.useState();
  const selectCovenant = (covenant) => {
    alert(`Selected covenant "${covenant}"`);
    setSelected(() => (<Covenant value={covenant} />));
  };

  return (
    <section>
    <header><Title label={(props.title || "Covenants")} /></header>
    <main>{
      (props.covenants || []).map(
      (covenant) => {
        return (<Covenant 
          mode="brief"
          parent={this}
          key={covenant.name} name={covenant.name} onClick={(e) => {selectCovenant(covenant)}} />);
      }
      )
    }</main>
    <footer className={{"padding-top": "1em"}}>{selected}</footer>
    </section>
  );
}

function Title(props) {
  return (<h1 className="title">{props.label}</h1>)
}

function Paragraph(props) {
  return (
    <p className="paragraph">
      {props.children}
      </p>
  )
}

function Main(props) {
  const [current, setCurrent] =
  React.useState({
    mode: (props.mode || "Personae"),
    modes: ["Skills", "Tribunals", "Covenants", "Personae"],
    title: props.title,
    covenants: []
  });
  const handleMenuSelect = (e) => {
    const newMode = e.target.textContent;
    alert(`New:"${newMode}"`);
    setCurrent((old) => ({ ...old, mode: newMode }));
  };
  const hidden = (state) => (state.mode !== current.mode);
  const getAttributes = (state) => (hidden(state) ? ["hidden"] : []);
  const covenants = (<CovenantUI label="Covenants" covenants={[new CovenantModel({name: "Fengheld", magi: [{name: "Stentorius", house: "Tremere"}, {name: "Tabanus", house: "Quernicus"}]})]}/>)
  const people = ([["A", "B"],["Ab", "B"],["Cab", "C"]].map( ([name, house]) => ({name, house, id: `${house}.${name}`})));
  const tribunalUi = (<Title label="Tribunals" />);
  const personae=(<Test value={people.map(JSON.stringify)} />);
  const entries = [
    {
      name: "Covenants",
      content: covenants
    },
    { name: "Skills", content: (<Paragraph>Abilities</Paragraph>) },
    { name: "Tribunals", content: tribunalUi },
    { name: "Personae", content: personae}
      ];
  console.log(`Current ${current.mode}`)


  return (
    <div className="main">
      <nav><ul className="nav">
      {
        current.modes.map( (mode) => {
          return (
          <li key={mode} className={(hidden({mode: mode})?"menu-item":"menu-item-active")}
          onClick={handleMenuSelect}>{mode}</li>
          );
        })
      }</ul></nav>
      {current.title && <h1>{current.title}</h1>}
      {
        entries.map( 
          (entry) => {
            if (hidden({mode: entry.name})) {
              return (
                  <div hidden key={entry.name}>
                              {entry.content}
                  </div>);
            } else {
              return (
                <div key={entry.name}>
                {entry.content}
                </div>
              );
            }
          }
        )
      }
      </div>
  )
}


const domNode = document.getElementById('react-app');
const root = ReactDOM.createRoot(domNode);
root.render(<Main />);

