/* eslint-disable react/prop-types */
import React from 'react';
import { createRoot } from 'react-dom/client.js';
import { getCovenants } from './modules.covenants.js';
import CovenantsComponent from './CovenanListCompoment.js';



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
  constructor(props) {
    super(props);
    this.state = {
      covenants: getCovenants()
    };
  }

  render() {
    return (
      <div className="">
        <Title label={this.props.title} />
        <Paragraph text={this.props.text} />
        <CovenantsComponent entries={this.state.covenants} />
      </div>
    )
  }
}

// Fixing the depricated rendering.
const root = createRoot();
root.render(
  <Main title="React" text="Caution: do not look into laser with remaining eye."></Main>,
  document.getElementById('react-app')
);
