import React from "react";
import PropTypes from "prop-types";
import createLogger from "debug";
import ResizeObserver from "./ResizeObserver";

const debug = createLogger("react-typesetting:Justify");

const justifyStyle = {
  position: "relative",
  textAlign: "justify"
};

/**
 * The `Justify` component conditionally applies `text-align: justify` to its
 * container element (a &lt;p&gt; by default) depending on whether or not there
 * is enough room. The minimum width is defined by `minWidth` and defaults to
 * 17em.
 */
export default class Justify extends React.Component {
  static propTypes = {
    /**
     *
     */
    as: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.func,
      PropTypes.object
    ]),
    /**
     * The minimum width at which to allow justified text. Numbers indicate an
     * absolute pixel width. Strings will be applied to an element's CSS in
     * order to perform the width calculation.
     */
    minWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    /**
     * Whether or not to initially set `text-align: justify` before the
     * available width has been determined.
     */
    initialJustify: PropTypes.bool
  };

  static defaultProps = {
    as: "p",
    minWidth: "17em",
    initialJustify: true
  };

  hostRef = React.createRef();
  widthNode = null;
  state = { justify: this.props.initialJustify };

  handleResize = () => {
    debug("Detected resize, forcing update");
    this.forceUpdate();
  };

  componentDidMount() {
    this.scheduleReflow();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.justify === prevState.justify) {
      this.scheduleReflow(snapshot);
    }
  }

  scheduleReflow(snapshot) {
    const { reflowTimeout, disabled } = this.props;
    if (disabled) {
      return;
    }
    if (!this.reflowScheduled) {
      this.reflowScheduled = true;
      if (reflowTimeout) {
        this.timeout = window.setTimeout(this.reflow, reflowTimeout);
      } else {
        this.raf = window.requestAnimationFrame(this.reflow);
      }
    }
  }

  reflow = () => {
    this.reflowScheduled = false;

    const { minWidth } = this.props;

    if (!this.widthNode) {
      this.widthNode = document.createElement("span");
    }
    this.widthNode.style.cssText = `
      display: inline-block;
      position: absolute;
      left: 0;
      width: ${minWidth};
      height: 1px;
      background: red;
      pointer-events: none;
    `;
    const { width: hostWidth } = this.hostRef.current.getBoundingClientRect();
    this.hostRef.current.appendChild(this.widthNode);
    const { width: targetWidth } = this.widthNode.getBoundingClientRect();
    this.hostRef.current.removeChild(this.widthNode);
    const justify = hostWidth >= targetWidth;
    this.setState(state => {
      if (state.justify !== justify) {
        return { justify };
      }
      return null;
    });
  };

  render() {
    const { as: Component, className, style, reflowKey, children } = this.props;
    const { justify } = this.state;
    const alignStyle = justify ? justifyStyle : undefined;
    const outerStyle = style ? { ...alignStyle, ...style } : alignStyle;

    return (
      <Component className={className} style={outerStyle} ref={this.hostRef}>
        {children}
        {reflowKey == null ? (
          <ResizeObserver onResize={this.handleResize} />
        ) : null}
      </Component>
    );
  }
}
