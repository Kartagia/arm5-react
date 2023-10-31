// Start-include module.events.js

/**
 * A function handling an event.
 *
 * @callback EventHandler
 * @param {(Event|CustomEvent)} event the listened event.
 * @param {TYPE} [payload=null] The payload of the event. This 
 */

/**
 * An object listening an event.
 * 
 * @template TYPE 
 * @interface EventListener
 * @method handleEvent
 * @type {EventHandler<TYPE>}
 */

/**
 * Function changing the event supporr.
 * 
 * @tempkate TYPE
 * @callback ChangeEventSupport
 * @param {string} eventType The affected event type.
 * @param {EventListener<TYPE>|EventHandler<TYPE>} listener The affected listener.
 * @param {EventSupport|EventSupplier} [target=undefined] The target of the change.
 */
 
/**
 * Function sending events.
 *
 * @callback EventDispatcher
 * @param {Event|CustomEvent} event The sent event.
 */

/**
 * Event supplier provides events
 * to its listeners.
 *
 * @interface EventSupplier
 * @property {ChaEventSupportChangeEventSupport
 } addEventListener Adds a new listener.
 * @property {ChangeEventSupportEventSupport} removeEventListener Removes an existing listener.
 * @property {EventDispatcher} fireEvent Method sending event to all appropriate listeners.
 */

/**
 * Add event listener.
 * @param {string} eventType The type of the event.
 * @param {EventListener} eventListener The event listener.
 */
export function addListener(eventType, eventListener, target=null) {
  if (eventType && eventListener instanceof Function) {
    (target || document).addEventListener(eventType, eventListener, false);
    return () => {
      (target || document).removeEventListener(eventType, eventListener);
    }
  }
}

/** Remove an event listener.
 * @type {ChangeEventSupport}
 * @param {string} eventType 
 * @param {EventListener} eventListener
 */
export function removeListener(eventType, eventListener, target=null) {
  if (eventType && eventListener instanceof Function) {
    document.removeEventListener(eventType, eventListener);
  }
}

/**
 * Fires an event. If the type is given, only event of the given type
 * is dispatched.
 * @param {Event|CustomEvent} event The dispatched event.
 * @param {string|null} [eventType=null] The optional type of the event.
 */
export async function fireEvent(target, event, eventType = null) {
  const doc = (target ? target : document);
  console.log(`Firing Event ${event} on ${doc}, if type ${eventType}`)
  if ((event instanceof Event || event instanceof CustomEvent) && (eventType == null || eventType === event.type)) {
    console.log(`Dispatching event for target ${doc.name}#${target.id}`)
    return doc.dispatchEvent(event);
  } else {
    return false;
  }
}

export function fireCustomEvent(target, eventType, data = undefined, bubbles = false, cancellable = false, composed = false) {
  console.group(`Firing Custom Event ${eventType}`);
  if (eventType) {
    console.info(`Event types:${composed?"DOM":""} ${bubbles?" bubbles":""}, ${cancellable?" cancels":""}`)
    const event = new CustomEvent(eventType, { detail: data, bubbles, cancellable, composed });
    console.log("Created event")
    console.table(event);
    console.groupEnd();
    return fireEvent(doc, event, eventType)
  } else {
    console.log("No event thrown")
    console.groupEnd();
    return false;
  }
}

/**
 * Fires custom DOM event bubbling through DOMNodes.
 * @template TYPE
 * @param {string} eventType The type of the event.
 * @param {TYPE} data The data attached to the custom event.
 * @returm {boolean} True, iff the event was disatched and not cancelled.
 */
export function fireCustomDOMEvent(target, eventType, data) {
  return fireCustomEvent(target, eventType, data, true, true, true);
}

/**
 * Fires custom DOM event bubbling through React nodes.
 * @template TYPE
 * @param {EventSupplier?} target The target of the event.
 * @param {string} eventType The type of the event.
 * @param {TYPE} data The data attached to the custom event.
 * @param {boolean} [cancellable=true] Is the event cancelable
 * @returm {boolean} True, iff the event was disatched and not cancelled.⁰
 */
export function fireCustomUIEvent(target, eventType, data, cancellable = true) {
  console.log(`Firing Custom UI ${eventType} Event for ${target} with id "${target.id}" `);
  console.table(data);

  return fireCustomEvent(target, eventType, data, true, cancellable, false);
}

// End-include eventLiatener.js