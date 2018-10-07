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
 * This component may include more advanced justification features in the
 * future, but it is currently very simple: it conditionally applies
 * `text-align: justify` to its container element (a `<p>` by default)
 * depending on whether or not there is enough room to avoid large, unseemly
 * word gaps. The minimum width is defined by `minWidth` and defaults to 16 ems.
 */
export default class Justify extends React.Component {
  static propTypes = {
    /**
     * The class to apply to the outer wrapper element created by this
     * component.
     */
    className: PropTypes.string,
    /**
     * Extra style properties to add to the outer wrapper element created by
     * this component.
     */
    style: PropTypes.object,
    /**
     * The content to render.
     */
    children: PropTypes.node,
    /**
     * The element type in which to render the supplied children. It must be
     * a block level element, like `p` or `div`, since `text-align` has no
     * effect on inline elements. It may also be a custom React component, as
     * long as it uses `forwardRef`.
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
    initialJustify: PropTypes.bool,
    /**
     * If specified, disables automatic reflow so that you can trigger it
     * manually by changing this value. The prop itself does nothing, but
     * changing it will cause React to update the component.
     */
    reflowKey: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    /**
     * Debounces reflows so they happen at most this often in milliseconds (at
     * the end of the given duration). If not specified, reflow is computed
     * every time the component is rendered.
     */
    reflowTimeout: PropTypes.number,
    /**
     * Whether to completely disable justification detection. The last
     * alignment that was applied will be preserved.
     */
    disabled: PropTypes.bool,
    /**
     * A function to call when layout has been recomputed and justification
     * has been applied or unapplied.
     */
    onReflow: PropTypes.func
  };

  static defaultProps = {
    as: "p",
    minWidth: "16em",
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
