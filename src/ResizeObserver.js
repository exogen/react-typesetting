import React from "react";
import PropTypes from "prop-types";

const style = {
  display: "inline-block",
  position: "absolute",
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  overflow: "hidden",
  zIndex: -1,
  visibility: "hidden",
  pointerEvents: "none"
};

const expandStyle = {
  display: "inline-block",
  position: "absolute",
  left: 0,
  top: 0,
  transition: "0s",
  width: 100000,
  height: 100000
};

const shrinkStyle = {
  display: "inline-block",
  position: "absolute",
  left: 0,
  top: 0,
  transition: "0s",
  width: "200%",
  height: "200%"
};

export default class ResizeObserver extends React.PureComponent {
  static propTypes = {
    /**
     * A function to call when the element size changes.
     */
    onResize: PropTypes.func
  };

  hostRef = React.createRef();
  expandRef = React.createRef();
  shrinkRef = React.createRef();

  resetScroll = ref => {
    this.ignoreEvents = true;
    ref.current.scrollTop = 100000;
    ref.current.scrollLeft = 100000;
    this.ignoreEvents = false;
  };

  handleScroll = event => {
    if (this.ignoreEvents) {
      return;
    }
    event.preventDefault();
    this.reflow();
  };

  reflow = () => {
    this.resetScroll(this.shrinkRef);
    this.resetScroll(this.expandRef);
    const { width, height } = this.hostRef.current.getBoundingClientRect();
    if (width !== this.lastWidth || height !== this.lastHeight) {
      this.lastWidth = width;
      this.lastHeight = height;
      this.props.onResize({ width, height });
    }
  };

  componentDidMount() {
    this.resetScroll(this.expandRef);
    this.resetScroll(this.shrinkRef);
  }

  render() {
    return (
      <span style={style} ref={this.hostRef} onScroll={this.handleScroll}>
        <span ref={this.expandRef} style={style}>
          <span style={expandStyle} />
        </span>
        <span ref={this.shrinkRef} style={style}>
          <span style={shrinkStyle} />
        </span>
      </span>
    );
  }
}
