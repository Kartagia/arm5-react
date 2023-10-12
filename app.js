import React from 'react';
import ReactDOM from 'react-dom';
import Covenants from './CovenanListCompoment.jsx';
import Covenant from './Covenant.jsx';
import {personToString, Covenant as CovenantModel } from './modules.covenant.js';
import{CovenantDAO} from "./modules.covenants.js";




class Title extends React.Component {
  render() {
    return (<h1 className="">{this.props.label}</h1>)
  }
}

class Paragraph extends React.Component {
  render() {
    return (
      <p className="">
      {this.props.text}
      </p>
    )
  }
}

class MainTestDAO extends React.Component {
  constructor(props) {
    super(props);
    this.dao = new CovenantDAO();
    console.log("Covenant DAO: ", this.dao);
    if (props.covenants) {
      props.covenants.forEach(
        (c) => {
          const created = dao.create(c);
          console.info({ created });
        }
      );
    }
    
    
    this.state = {
      covenants: dao.all()
    };
  }
  
  render() {
    return (
      <div className="">
          <Title label={this.props.title} />
          <Covenants entries={this.state.covenants}  />
        </div>
    )
  }
}

class Main extends React.Component {
  constructor(props) {
    super(props);
    try {
    
    this.state = {
      title: props.title,
      covenants: [],
      covenant: new CovenantModel({
        name: "Fengheld",
        tribunal: "Rhine",
        people: [{id: 5, name: "Stentorius"}],
        magi: [5, {name: "Agrippa"},{name: "Gilabertus", id:6}]
      })
    };
    console.log(`People: ${this.state.covenant.people.map((v)=>(personToString(v))).join('\n')}`);
    } catch (err) {
      console.error("People property invalid: ", err.toString());
    }
    console.log("Created Main")
  }

  render() {
    return  (
      <div className={"main"}>
      <Covenant covenant={this.state.covenant} />
      </div>
    )
  }
}


ReactDOM.render(
  <Main title="React" text="Caution: do not look into laser with remaining eye."></Main>,
  document.getElementById('react-app')
);
