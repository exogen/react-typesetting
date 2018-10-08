import React from "react";
import PropTypes from "prop-types";
import { DraggableCore } from "react-draggable";
import styled from "styled-components";

const noop = () => {};

const ResizableContent = styled.div`
  position: relative;
  margin-top: 40px;
`;

const Hint = styled.div`
  position: absolute;
  left: -5em;
  right: -1em;
  bottom: 100%;
  margin: 0 auto 8px auto;
  font-family: Courgette, sans-serif;
  font-size: 14px;
  font-weight: normal;
  font-style: normal;
  line-height: 1;
  color: #1289de;
  text-align: center;
  pointer-events: none;
  opacity: ${props => (props.hasBeenDragged ? 0 : 1)};
  transform: scale(${props => (props.hasBeenDragged ? 0.8 : 1)});
  transition-property: transform, opacity;
  transition-duration: 0.5s;
`;

const Handle = styled.div`
  position: absolute;
  top: -1px;
  right: -19px;
  bottom: -1px;
  width: 31px;
  background: transparent;
  cursor: ew-resize;
  user-select: none;
  z-index: 2;

  @media (max-width: 767px) {
    top: -4px;
    bottom: -4px;
    width: 39px;
  }

  &:before {
    display: block;
    position: absolute;
    top: 0;
    left: 12px;
    bottom: 0;
    width: 7px;
    border-radius: 2px;
    background: #1289de;
    content: "";

    @media (max-width: 767px) {
      left: 15px;
      width: 9px;
    }
  }

  &:after {
    display: block;
    position: absolute;
    top: 50%;
    left: 15px;
    width: 1px;
    height: 12px;
    margin-top: -6px;
    background: rgba(179, 241, 255, 0.85);
    content: "";

    @media (max-width: 767px) {
      left: 19px;
      height: 18px;
      margin-top: -9px;
    }
  }
`;

export const ResizableHandle = ({ title, hint, hasBeenDragged, ...props }) => (
  <DraggableCore {...props}>
    <Handle title={title}>
      {hint ? <Hint hasBeenDragged={hasBeenDragged}>{hint}</Hint> : null}
    </Handle>
  </DraggableCore>
);

export default class Resizable extends React.PureComponent {
  static propTypes = {
    className: PropTypes.string,
    initialWidth: PropTypes.number,
    onStart: PropTypes.func,
    onStop: PropTypes.func,
    onResize: PropTypes.func,
    style: PropTypes.object,
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func])
  };

  static defaultProps = {
    style: {}
  };

  state = {
    attemptedWidth: this.props.initialWidth,
    dragged: false
  };

  hostRef = React.createRef();

  getActualWidth() {
    const node = this.hostRef.current;
    return parseFloat(window.getComputedStyle(node).width);
  }

  handleStart = () => {
    const actualWidth = this.getActualWidth();
    if (this.props.onStart) {
      this.props.onStart({ width: actualWidth });
    }
    this.setState({
      attemptedWidth: actualWidth
    });
  };

  handleStop = () => {
    const actualWidth = this.getActualWidth();
    if (this.props.onStop) {
      this.props.onStop({ width: actualWidth });
    }
    this.setState({ attemptedWidth: actualWidth });
  };

  handleDrag = (event, data) => {
    this.setState(state => ({
      attemptedWidth: state.attemptedWidth + data.deltaX,
      dragged: true
    }));
  };

  componentDidMount() {
    // Adding this empty event listener fixes the window scrolling while
    // a handle is being dragged.
    window.addEventListener("touchmove", noop);
    this.actualWidth = this.getActualWidth();
  }

  componentDidUpdate(prevProps, prevState) {
    const actualWidth = this.getActualWidth();
    if (actualWidth !== this.actualWidth) {
      if (actualWidth != null && this.props.onResize) {
        this.props.onResize({
          width: actualWidth,
          deltaX: actualWidth - this.actualWidth
        });
        this.actualWidth = actualWidth;
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener("touchmove", noop);
  }

  render() {
    const { className, style, children } = this.props;
    const { attemptedWidth, dragged } = this.state;
    return (
      <ResizableContent
        ref={this.hostRef}
        className={className}
        style={{ ...style, width: attemptedWidth }}
      >
        <ResizableHandle
          onStart={this.handleStart}
          onStop={this.handleStop}
          onDrag={this.handleDrag}
          hasBeenDragged={dragged}
          title="Drag to resize"
          hint={"Drag to resize!"}
        />
        {typeof children === "function" ? children(attemptedWidth) : children}
      </ResizableContent>
    );
  }
}
