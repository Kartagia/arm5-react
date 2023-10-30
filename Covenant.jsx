import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

import History from "./History.jsx";

export function Covenant(props) {}

export default function CovenantComponent(props) {
  const covenant = props.covenant;

  if (props.editable == true) {
    // Create editor component.
  } else {
    // View compoennt.
    return (
      <React.Fragment>
        <section className={"covenant"}>
          <h1>Covenant of {covenant.name}</h1>
          <History>
            <p>Test child paragraph</p>
          </History>
        </section>
      </React.Fragment>
    );
  }
}

CovenantComponent.defaltProps = {
  editable: false,
};

CovenantComponent.propTypes = {
  editable: PropTypes.bool.default,
  covenant: PropTypes.objectOf(Covenant),
};
