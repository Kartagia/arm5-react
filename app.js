import React from 'react';
import { Fragment, useId} from 'react';
import ReactDOM from 'react-dom';

import { Covenant as CovenantModel } from './modules.covenant.js';

import { PersonList, Ability, chooseProps, getValueOfProp } from "./components.person.js";

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

export const Covenant = (props) => {
  console.group(`${props.mode} Covenant: ${(props.name || props.value && props.value.name)}`);
  const data = {
    name: props.name || props.value && props.value.name,
    magi: props.magi || props.value && props.value.magi || []
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
              title="Magi" value={covenant.magi} />
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
    mode: (props.mode || "Covenants"),
    modes: ["Skills", "Tribunals", "Covenants"],
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
  const tribunalUi = (<Title label="Tribunals" />);
  const entries = [
    {
      name: "Covenants",
      content: covenants
    },
    { name: "Skills", content: (<Paragraph>Abilities</Paragraph>) },
    { name: "Tribunals", content: tribunalUi }
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