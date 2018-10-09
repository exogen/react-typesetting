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
     * The content to render. This should only really be necessary if you pass
     * an `observe` prop and want to ensure that the given ref is populated.
     */
    children: PropTypes.node,
    /**
     * A React ref to observe. If not given, an absolutely positioned `<span>`
     * will be rendered and observed.
     */
    observe: PropTypes.object,
    /**
     * Whether to also observe `document.body`. This helps to catch content
     * changes that occur as a result of media queries but may not affect the
     * size of the observed container.
     */
    observeBody: PropTypes.bool,
    /**
     * A function to call when the element size changes.
     */
    onResize: PropTypes.func
  };

  static defaultProps = {
    observeBody: false
  };

  hostRef = React.createRef();
  observer = null;
  observedNode = null;

  handleResize = entries => {
    this.props.onResize(entries);
  };

  componentDidMount() {
    const { observe = this.hostRef, observeBody } = this.props;
    this.observedNode = observe.current;
    this.observer = new ResizeObserver(this.handleResize);
    this.observer.observe(this.observedNode);
    if (observeBody) {
      this.observer.observe(document.body);
    }
  }

  componentDidUpdate(prevProps) {
    const { observe = this.hostRef, observeBody } = this.props;
    if (this.observedNode !== observe.current) {
      this.observer.unobserve(this.observedNode);
      this.observedNode = observe.current;
      this.observer.observe(this.observedNode);
    }
    if (observeBody && !prevProps.observeBody) {
      this.observer.observe(document.body);
    } else if (!observeBody && prevProps.observeBody) {
      this.observer.unobserve(document.body);
    }
  }

  componentWillUnmount() {
    this.observer.disconnect();
    this.observer = null;
    this.observedNode = null;
  }

  render() {
    const { observe, children } = this.props;
    return (
      <React.Fragment>
        {children}
        {observe ? null : <span ref={this.hostRef} style={style} />}
      </React.Fragment>
    );
  }
}
