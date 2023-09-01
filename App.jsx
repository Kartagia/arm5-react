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
    this.state = {
      covenants: Covenants,
    };
  }

  render() {
    return (
      <div className="">
        <Title label={this.props.title} />
        <Paragraph text={this.props.text} />
        <CovenantsComponent entries={this.state.covenants} />
      </div>
    );
  }
}
