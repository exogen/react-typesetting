import React from "react";
import PropTypes from "prop-types";
import Context from "./TypesettingContext";

/*
 * ```js
 * import { Typesetting } from 'react-typesetting';
 * ```
 *
 * An optional context provider for supplying typesetting presets.
 */
export default class TypesettingProvider extends React.Component {
  static displayName = "Typesetting.Provider";

  static propTypes = {
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
