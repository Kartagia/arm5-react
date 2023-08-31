import React from 'react';
import ReactDOM from 'react-dom';
import Covenants from './CovenanListCompoment.jsx';
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

class Main extends React.Component {
  constructor (props) {
    super(props);
    this.dao = new CovenantDAO();
    console.log("Covenant DAO: ", this.dao);
    dao.create(
      "Fengheld",
      "Rhine"
    );
    dao.create({
      name: "Jaferia",
      tribunal: "Iberia"
    });
    
    
    this.state = {
      covenants: dao.all()
    };
    console.log("Created Main")
  }

  render() {
    return  (
      <div className="">
        <Title label={this.props.title} />
        <Covenants entries={this.state.covenants}  />
      </div>
    )
  }
}


ReactDOM.render(
  <Main title="React" text="Caution: do not look into laser with remaining eye."></Main>,
  document.getElementById('react-app')
);
