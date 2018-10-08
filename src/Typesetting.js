import React from "react";
import PropTypes from "prop-types";
import Context from "./TypesettingContext";
import TypesettingProvider from "./TypesettingProvider";

/**
 * ```js
 * import { Typesetting } from 'react-typesetting';
 * ```
 */
export default function Typesetting(props) {
  return <Context.Consumer {...props} />;
}

function withPreset(Component) {
  const name = Component.displayName || Component.name || "Component";

  function WithPreset(props) {
    if (props.preset) {
      return (
        <Typesetting>
          {({ presets }) => {
            const preset = presets[props.preset];
            return <Component {...preset} {...props} />;
          }}
        </Typesetting>
      );
    }
    return <Component {...props} />;
  }

  WithPreset.displayName = `withPreset(${name})`;

  return WithPreset;
}

Typesetting.Provider = TypesettingProvider;

Typesetting.withPreset = withPreset;

Typesetting.propTypes = {
  children: PropTypes.func
};
