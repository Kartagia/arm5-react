/* eslint-disable react/prop-types */
import React from "react";
import { useState } from "react";
import classes from "./Modal.module.css";

/**
 * @typedef {Object} Action An action definition.
 * @template T
 * @property {T} [defaultPayload] The default payload.
 * @property {Function} action The action performed when the action is triggered.
 * @property {string} name The action name.
 */

/**
 * @typedef {Object} ActionEvent The event triggered by an action.
 * @template T
 * @property {string} action The name of the action.
 * @property {Object} [target] The target of the action.
 * @property {T} [payload] The payload of the action.
 */

/**
 * @template T
 * @callback ActionListener A function reacting to an action event.
 * @param {ActionEvent<T>} event The event triggering the action.
 */

/**
 * The properties of the action bar.
 * @typedef {Object} ActionBarProperties
 * @property {Action<any>[]} [actions] The list of the actions on the action bar.
 * @property {Function} [onAction] The action selection triggers this function.
 */

/**
 * The action bar is a button bar with action reporting.
 * @param {ActionBarProperties} props
 */
// eslint-disable-next-function react/no-unknown-property
export function ActionBar(props) {
  /* eslint-disable react/no-unknown-property */
  return (
    <div className={classes.actionBar}>
      {(props.actions || []).map((action) => {
        return (
          <input
            key={action.name}
            type="button"
            alt={action.name}
            aria-control={props.parent}
            onClick={(e) => {
              action.action && action.action(e);
              props.onAction &&
                props.onAction({
                  action: action.name,
                  target: props.parent,
                  payload: props.payload || action.defaultPayload,
                });
            }}
          ></input>
        );
      })}
    </div>
  );
}

/* eslint-enable react/no-unknown-property */

/**
 * The properties of the modal dialogue.
 * @typedef {Object} ModalProperites
 * @property {boolean} [open=false] Is the modal dialogue open.
 * @property {Function} [onClose] The function called when the modal is closed.
 */

/**
 * Properties of the
 * @param {ModalProperites} props
 */
export function Modal(props) {
  // eslint-disable-next-line no-unused-vars
  const [actions, setActions] = React.useState(
    props.actions
      ? props.actions.map((action) => {
          switch (typeof action) {
            case "string":
              if (action === "close") {
                return closeAction;
              } else {
                return null;
              }
            case "object":
              return action;
            default:
              return null;
          }
        })
      : [closeAction]
  );
  const [open, setOpen] = useState(props.open);
  const contentId = React.useId();
  const parentId = React.useId();

  const closeAction = {
    defaultPayload: parentId,
    name: "close",
    action: (payload) => {
      if (payload === parentId) {
        setOpen(false);
      }
    },
  };

  return (
    <div
      id={parentId}
      aria-hidden="true"
      hidden={!open}
      className={classes.modal}
      onClick={(e) => {
        setOpen(false);
        props.onClose && props.onClose(e);
      }}
    >
      <div
        id={contentId}
        aria-modal="true"
        aria-label={props.title}
        aria-details={`A modal dialogue ${
          props.title ? `with the title ${props.title}` : `without title`
        }`}
        className={classes.content}
        onClick={(e) => {
          // Block on click on the content to prevent removal of the modal contents.
          e.preventDefault();
        }}
      >
        <header>
          {props.title && <span className={classes.title}>{props.title}</span>}
          {props.actions && <ActionBar parent={contentId} actions={actions} />}
        </header>
        <main>{props.children}</main>
        <footer></footer>
      </div>
    </div>
  );
}
