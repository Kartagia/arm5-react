/* eslint-disable react/prop-types */
import React from "react";
import Covenants from "./modules.covenants.js";
import CovenantsComponent from "./CovenantListCompoment.jsx";

class Title extends React.Component {
  render() {
    return <h1 className="">{this.props.label}</h1>;
  }
}

class Paragraph extends React.Component {
  render() {
    return <p className="">{this.props.text}</p>;
  }
}

export default class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const covenants = new Covenants();
    covenants.create({ name: "Fengheld" });
    console.log("Covenants: " + covenants.all());
    return (
      <div className="">
        <Title label={this.props.title} />
        <Paragraph text={this.props.text} />
        <CovenantsComponent entries={[...covenants.all()]} />
        {covenants.all().map((e) => {
          return (
            <li key={e.id}>
              {e.name}(#{e.id})
            </li>
          );
        })}
      </div>
    );
  }
}
