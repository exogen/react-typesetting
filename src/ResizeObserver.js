import React from "react";
import PropTypes from "prop-types";
import ResizeObserver from "resize-observer-polyfill";

const style = {
  display: "block",
  position: "absolute",
  pointerEvents: "none",
  visibility: "hidden",
  zIndex: -1
};

export default class ResizeObserverComponent extends React.PureComponent {
  static displayName = "ResizeObserver";

  static propTypes = {
    /**
     * A function to call when the element size changes.
     */
    onResize: PropTypes.func
  };

  hostRef = React.createRef();
  observer = null;

  handleResize = entries => {
    this.props.onResize(entries);
  };

  componentDidMount() {
    this.observer = new ResizeObserver(this.handleResize);
    this.observer.observe(this.hostRef.current);
  }

  componentWillUnmount() {
    this.observer.unobserve(this.hostRef.current);
    this.observer = null;
  }

  render() {
    return <span ref={this.hostRef} style={style} />;
  }
}
