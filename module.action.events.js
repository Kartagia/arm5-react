/**
 * The module implementing actions
 * using events instead of direct calls 
 * @module
 */
import { createAction } from "././module.action.js";
import { fireCustomUIEvent } from "./module.events.js";

/**
 * @template PAYLOAD
 * @typedef {Object} ActionEventData The action even data.
 * @property {ActionName} action The action name.
 * @property {PAYLOAD}¡[payload] The action payload.
 */

/**
 * Action Event contains action name and possible payload as its detail.
 * @template {PAYLOAD}
 * @typedef {CustomEvent} ActionEvent
 * @property {ActionEventData<PAYLOAD>} detail The event data.
 */



/**
 * Log action event.
 * @param {ActionEvent} e The logged event.
 */
export const logActionEvent = (e) => {
  const { action, payload } = (e.detail || {});
  console.group(`ActionBar Event ${e.target && e.target.id ? `on component ${e.target.id}` : " without id"}`);
  if (action) {
    console.log("Action", action, ...(payload ? ["With payload", payload] : ["Without payload"]))
  } else {
    console.error(`Invalid action event: Missing Action Name `)
  }
  console.table(e);
  console.groupEnd();
};

/**
 * Create an action handler firing an ActionEvent.
 * @template TYPE
 * @param {Action<TYPE>} action The performed action.
 * @param {string} [id] The DOM component identifier of the dispatching DOM component. If not spefified, the document dispatches the event.
 * @return {ActionHandler<TYPE>}
 */
export const createDispatchActionEventHandler = (action, id = null) => {
  return async (e) => {
    console.group(`ActionButton ${action.name} handling ${e.type}Event`);

    const defaultPayload = (action.defaultPayload instanceof Function ? action.defaultPayload(e) : action.defaultPayload) || null;
    console.table({ defaultPayload });
    const payload = (action.onClick && action.onClick(e)) || defaultPayload;
    console.table({ payload })
    console.groupEnd();
    fireActionEvent(
      (id ? document.getElementById(id) : document), action.name, payload)
  };
}; // End


/**
 * Fires an action event.
 * @param {ActionName) action The name of the action.
 * @param {PAYLOAD} [oayload=null] The payload of the action.
 * @returm {boolean} True, iff the event was disatched and not cancelled.
 */
export function fireActionEvent(target, action, payload = null) {
  console.debug(`Firing UI action ${action} event`);
  return action && fireCustomUIEvent(target, "action", {
    target,
    action,
    payload
  });

}