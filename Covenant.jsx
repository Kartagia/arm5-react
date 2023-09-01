import React from "react";
import PropertyTypes from "prop-types";
import History from "./History.jsx";
import Covenant from "./modules.covenant.js";

/**
 * The covenant component properties.
 * @typedef {React.Props} CovenantProps
 * @property {Covenant} covenant The coveannt the
 */

/**
 *
 * @param {CovenantProp} props The covenant properties.
 * @returns
 */
export default function CovenantComponent(props) {
  const covenant = props.entry;
  if (covenant instanceof Covenant) {
    // The compoent is created with a covenant ifnormation.
    // Create result
    return (
      <React.Fragment>
        <h1>Covenant of {covenant.name}</h1>
        {props.children}
        <History entries={covenant.history ? covenant.history : []} />
      </React.Fragment>
    );
  } else {
    // Create a new covenant
    return (
      <React.Fragment>
        <form></form>
      </React.Fragment>
    );
  }
}

CovenantComponent.defaultProps = {};

CovenantComponent.propTypes = {
  entry: PropertyTypes.object,
  children: PropertyTypes.any,
};
