import React, { PureComponent } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import { DraggableCore } from 'react-draggable'
import styled from 'styled-components'

const NOOP = function () {}

const Handle = styled.div`
  position: absolute;
  top: -1px;
  right: -19px;
  bottom: -1px;
  width: 31px;
  background: transparent;
  cursor: ew-resize;

  &:before {
    display: block;
    position: absolute;
    top: 0;
    left: 12px;
    bottom: 0;
    width: 7px;
    border-radius: 2px;
    background: #1289de;
    content: '';
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
    content: '';
  }
`

export const ResizableHandle = props => (
  <DraggableCore {...props}>
    <Handle />
  </DraggableCore>
)

export default class Resizable extends PureComponent {
  static propTypes = {
    initialWidth: PropTypes.number,
    onStart: PropTypes.func,
    onStop: PropTypes.func,
    onResize: PropTypes.func,
    style: PropTypes.object,
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func])
  }

  static defaultProps = {
    style: {}
  }

  constructor (props) {
    super(props)
    const { initialWidth } = props
    this.state = {
      attemptedWidth: initialWidth
    }
  }

  componentDidMount () {
    // Adding this empty event listener fixes the window scrolling while
    // a handle is being dragged.
    window.addEventListener('touchmove', NOOP)
    const actualWidth = this.getActualWidth()
    this.setState({ actualWidth })
  }

  componentWillUnmount () {
    window.removeEventListener('touchmove', NOOP)
  }

  componentDidUpdate (prevProps, prevState) {
    const { actualWidth } = this.state
    const nextActualWidth = this.getActualWidth()
    if (nextActualWidth !== actualWidth) {
      if (actualWidth != null && this.props.onResize) {
        this.props.onResize({
          width: nextActualWidth,
          deltaX: nextActualWidth - actualWidth
        })
      }
      this.setState({
        actualWidth: nextActualWidth
      })
    }
  }

  getActualWidth () {
    const node = ReactDOM.findDOMNode(this)
    return parseInt(window.getComputedStyle(node).width)
  }

  onStart = () => {
    const actualWidth = this.getActualWidth()
    if (this.props.onStart) {
      this.props.onStart({ width: actualWidth })
    }
    this.setState({
      actualWidth,
      attemptedWidth: actualWidth
    })
  }

  onStop = () => {
    const actualWidth = this.getActualWidth()
    if (this.props.onStop) {
      this.props.onStop({ width: actualWidth })
    }
    this.setState({
      actualWidth,
      attemptedWidth: actualWidth
    })
  }

  onDrag = (event, data) => {
    this.setState(state => ({
      attemptedWidth: state.attemptedWidth + data.deltaX
    }))
  }

  render () {
    const { className, style, children } = this.props
    const { attemptedWidth } = this.state
    const { onStart, onStop, onDrag } = this
    return (
      <div
        className={className}
        style={{
          ...style,
          position: style.position === 'absolute' ? 'absolute' : 'relative',
          width: attemptedWidth
        }}
      >
        <ResizableHandle onStart={onStart} onStop={onStop} onDrag={onDrag} />
        {typeof children === 'function'
          ? children(attemptedWidth)
          : React.cloneElement(children)}
      </div>
    )
  }
}
