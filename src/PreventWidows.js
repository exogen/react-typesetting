import React, { PureComponent, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import {
  iterTextNodesReverse,
  replaceTextInNode,
  replaceNodeWithText,
  getLengthPx,
  getLines,
  getLineWidth
} from './util'

const NBSP = '\u00A0'

export default class PreventWidows extends PureComponent {
  static propTypes = {
    minLineWidth: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.func
    ]),
    maxSpaces: PropTypes.number,
    nbspChar: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.element,
      PropTypes.func
    ])
  }

  static defaultProps = {
    minLineWidth: '10%',
    maxSpaces: 3,
    nbspChar: NBSP
  }

  createNbsp () {
    let { nbspChar } = this.props
    if (typeof nbspChar === 'function') {
      nbspChar = nbspChar()
    }
    if (React.isValidElement(nbspChar)) {
      if (!this._nbspIncubator) {
        this._nbspIncubator = document.createElement('div')
      }
      // This is probably a bad idea, but it's neat to support React elements
      // as replacement nodes.
      const incubator = this._nbspIncubator
      // This will need to be fixed (using a callback or ref) if ReactDOM starts
      // rendering asynchronously.
      ReactDOM.render(nbspChar, incubator)
      // Assume there's only one node and it's the one we want. This will break
      // if ReactDOM does weird stuff like insert comment nodes around the one
      // we want.
      nbspChar = incubator.removeChild(incubator.childNodes[0])
    }
    return nbspChar
  }

  updateTextNode = (node) => {
    this._textNode = node
  }

  componentDidMount () {
    this.spaces = new WeakMap()
    this.fixWidows()
  }

  componentWillUpdate () {
    this.restoreSpaces()
  }

  componentDidUpdate () {
    this.fixWidows()
  }

  componentWillUnmount () {
    // Don't need these anymore!
    this.spaces = null
    this._nbspIncubator = null
  }

  onChildrenReady = () => {
    if (this._textNode) {
      this.forceUpdate()
    }
  }

  restoreSpaces () {
    const node = this._textNode
    if (this._spaceCount) {
      let iter = iterTextNodesReverse(node)
      let textNode = iter()
      let spaceCount = 0
      while (textNode !== null) {
        const possibleNbsp = textNode.parentNode
        if (this.spaces.has(possibleNbsp)) {
          const { parentNode } = possibleNbsp
          const space = document.createTextNode(' ')
          parentNode.replaceChild(space, possibleNbsp)
          parentNode.normalize()
          this.spaces.delete(possibleNbsp)
          spaceCount += 1
          if (spaceCount >= this._spaceCount) {
            break
          }
          iter = iterTextNodesReverse(node)
        }
        textNode = iter()
      }
    }
  }

  fixWidows () {
    const { minLineWidth, maxSpaces } = this.props
    let spaceCount = 0
    while (spaceCount < maxSpaces) {
      const lines = getLines(this._textNode)
      const numLines = lines.length
      if (numLines <= 1) {
        break
      }
      const availableWidth = this._textNode.getBoundingClientRect().width
      const lineWidths = lines.map(getLineWidth)
      const longestLineWidth = Math.max(...lineWidths)
      const previousLineWidth = lineWidths[numLines - 2]
      const lastLineWidth = lineWidths[numLines - 1]
      const minWidthPx = getLengthPx(minLineWidth, {
        availableWidth,
        longestLineWidth,
        previousLineWidth,
        lastLineWidth
      })
      if (lastLineWidth >= minWidthPx || previousLineWidth <= minWidthPx) {
        break
      }
      const iter = iterTextNodesReverse(this._textNode)
      let textNode = iter()
      while (textNode !== null) {
        const text = textNode.nodeValue
        const lastSpace = text.lastIndexOf(' ')
        if (lastSpace !== -1) {
          const nbsp = this.createNbsp()
          replaceTextInNode(textNode, lastSpace, 1, nbsp)
          if (typeof nbsp !== 'string') {
            this.spaces.set(nbsp, true)
          }
          spaceCount += 1
          break
        }
        textNode = iter()
      }
    }
    this._spaceCount = spaceCount
  }

  render () {
    let { className, children } = this.props
    return (
      <span className={className} ref={this.updateTextNode}>
        {React.Children.map(children, child => (
          React.isValidElement(child) && typeof child.type !== 'string'
            ? React.cloneElement(child, { onReadyForTypesetting: this.onChildrenReady })
            : child
        ))}
      </span>
    )
  }
}
