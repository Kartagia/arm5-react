

/**
 * The name of an action.
 * @typedef {string} ActionName
 */
 
 /**
  * Action handling function.
  * @template TYPE
  * @callback ActionHandler
  * @param {Event} event The event.
  * @param {string} action The name of the action.
  * @param {TYPE} [payload] The action payload.
  */

/**
 * An action definition.
 * 
 * @template TYPE
 * @typedef {Object} ActionDef
 * @property {ActionName} name The name of the action.
 * @property {Function} onClick The action performed. 7f the function returns truthly value, it is used as payload.
 * @property {Function|TYPE} [defaultPayload] The default payload for ActionEvent. If function, it should return the payload when called with event.
 * @property {string} [icon] The button icon image
 * @property {string} [caption] The action button text.
 */

/**
 * @typedef {ActionDef|ActionName} Action The action declaration.
 */
 
 /**
  * @template TYPE
  * Create a new action.
  * @param {Partial<ActionDef<TYPE>>} def The action definition.
  * @returns {ActionDef<TYPE>} The constructed action definition.
  */
 export function createAction(
   {name, onClick, defaultPayload=undefined, icon=undefined, caption=undefined}) {
    const result = {
    }
   if (typeof name === "string") {
     result.name = name;
   } else {
     throw TypeError("Invalid action name");
   }
   if (typeof onClick instanceof Function) {
     result.onClick 
   } else {
     throw TypeError("Invalid action function");
   }
 }


/**
 * Create an asychronous action
 * handler.
 * @template TYPE
 * @param {ActionHandler<TYPE>} onAction The action performed.
 * @param {boolean} [withPromise=false] Does handling happen with Promise.
 * @return {ActionHandler<TYPE>|Promise<ActionHandler<TYPE>>} An async function handling the action or promise handling the action.
 */
export function createActionHandler (onAction, withPromise=false) {
  
  const result = (
    onAction ? async (event, actionName, payload = undefined) => (onAction(event, actionName, payload) ) : () => (undefined));
  if (withPromise) {
    return (event, actionName, payload=undefined) => {
      return new Promise(
        result,
        null
        );
    }
  } else {
    return result;
  }
}