import React from "react";
import PropTypes from "prop-types";
import Context from "./TypesettingContext";

/**
 * ```js
 * import { Typesetting } from 'react-typesetting';
 * ```
 *
 * A context provider for defining presets for all other `react-typesetting`
 * components to use.
 */
export default class TypesettingProvider extends React.Component {
  static displayName = "Typesetting.Provider";

  static propTypes = {
    /**
     * An object mapping preset names to default props. For example, given the
     * value:
     *
     * ```js
     * { myPreset: { minFontSize: 1, maxIterations: 3 } }
     * ```
     *
     * …the `TightenText` component could use this preset by specifying the
     * `preset` prop:
     *
     * ```jsx
     * <TightenText preset="myPreset" />
     * ```
     */
    presets: PropTypes.object,
    /**
     * The content that will have access to the defined presets via context.
     */
    children: PropTypes.node
  };

  static defaultProps = {
    presets: {}
  };

  static getDerivedStateFromProps(props) {
    return { presets: props.presets };
  }

  render() {
    const { children } = this.props;
    return <Context.Provider value={this.state}>{children}</Context.Provider>;
  }
}
