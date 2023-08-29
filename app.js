import React from 'react';
import ReactDOM from 'react-dom';
import Covenant from './Covenant.jsx';
import History from './History.jsx';
import {getCovenants} from './modules.covenants.js';



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
    this.state = {
      covenants: getCovenants()
    };
  }

  render() {
    return  (
      <div className="">
        <Title label={this.props.title} />
          <Paragraph text={this.props.text} />
          {
            this.state.covenants.map(
              covenant => {
                
                return (
                  <Covenant key={covenant.id || covenant.name} covenant={covenant}  ><section className={"history"}> <article className={"entry"} ><h6>Founding</h6></article></section>
                  </Covenant>
                );
              }
            )
          }
      </div>
    )
  }
}


ReactDOM.render(
  <Main title="React" text="Caution: do not look into laser with remaining eye."></Main>,
  document.getElementById('react-app')
);
