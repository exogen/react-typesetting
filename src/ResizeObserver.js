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
     * A function to call when the element size changes.
     */
    onResize: PropTypes.func
  };

  hostRef = React.createRef();
  observer = null;
  observedNode = null;

  handleResize = entries => {
    this.props.onResize(entries);
  };

  componentDidMount() {
    const ref = this.props.observe || this.hostRef;
    this.observedNode = ref.current;
    this.observer = new ResizeObserver(this.handleResize);
    this.observer.observe(this.observedNode);
  }

  componentDidUpdate() {
    const ref = this.props.observe || this.hostRef;
    if (this.observedNode !== ref.current) {
      this.observer.unobserve(this.observedNode);
      this.observedNode = ref.current;
      this.observer.observe(this.observedNode);
    }
  }

  componentWillUnmount() {
    this.observer.unobserve(this.observedNode);
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
