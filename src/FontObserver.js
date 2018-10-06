import React from "react";
import PropTypes from "prop-types";
import Context from "./FontObserverContext";
import FontObserverProvider from "./FontObserverProvider";

/**
 * A component for observing the fonts specified in the `FontObserver.Provider`
 * component.
 */
export default function FontObserver(props) {
  return <Context.Consumer {...props} />;
}

FontObserver.Provider = FontObserverProvider;

FontObserver.propTypes = {
  /**
   * A function that will receive the current status of the observed fonts.
   * The argument will be an object with these properties:
   *
   * - `fonts`: An array of the fonts passed to `FontObserver.Provider`, each
   *   with a `loaded` and `error` property.
   * - `loaded`: Whether all observed fonts are done loading.
   * - `error`: If any fonts failed to load, this will be populated with the
   *   first error.
   */
  children: PropTypes.func
};
