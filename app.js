import React from 'react';
import ReactDOM from 'react-dom';
import Covenant from './Covenant.jsx';
import {getCovenants} from './modules.covenants.js';
import Action from './Action.jsx';
import ActionUser from './ActionUser.jsx';



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
          {this.props.children}
      </div>
    )
  }
}


ReactDOM.render(
  <Main title="React" text="Caution: do not look into laser with remaining eye.">
    <Action name="alert" caption="Alert" onClick={() => {alert("ALERT! ALERT! ALERT!")}}></Action>
    <ActionUser items={[{ name: "Test1"}, { name: "Test2"}]} actions={["Remove", "Add"].map( name => (<Action key={name} horizontal={true} name={name} onClick={ (e) => {alert(`Action ${name} not implemented`)}} />))} />
  </Main>, 
  document.getElementById('react-app')
);
