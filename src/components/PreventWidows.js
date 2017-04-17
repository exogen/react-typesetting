import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import {
  iterTextNodesReverse,
  replaceTextInNode,
  replaceNodeWithText,
  getLengthPx,
  getLines,
  getLineWidth
} from '../util'

const NBSP = '\u00A0'

/**
 * Avoid rendering a very short last line of text (whether created by a single
 * word or several very short words).
 *
 * ### Examples
 *
 * Use the defaults: a minimum final line width of 10% of the longest line.
 *
 * ```jsx
 * <h1>
 *   <PreventWidows>
 *     It This Headline Has Some Short Words, Then So Be It
 *   </PreventWidows>
 * </h1>
 * ```
 *
 * Specify a custom minimum width:
 *
 * ```jsx
 * <p>
 *   <PreventWidows minLineWidth="30%">
 *     Higher percentages make sense for shorter width elements.
 *   </PreventWidows>
 * </p>
 * ```
 *
 * Specify a dynamic minimum width:
 *
 * ```jsx
 * <p>
 *   <PreventWidows minLineWidth={metrics => {
 *     if (metrics.longestLineWidth < 300) {
 *       return '15%'
 *     } else if (metrics.longestLineWidth < 800) {
 *       return '10%'
 *     } else {
 *       return 80
 *     }
 *   }}>
 *     Lorem ipsum dolor sit amet…
 *   </PreventWidows>
 * </p>
 * ```
 *
 * Render a custom non-breaking space wrapper during development so you can
 * visualize how it’s working:
 *
 * ```jsx
 * <p>
 *   <PreventWidows nbspChar={<span style={{ background: '#fd0' }}>&nbsp;</span>}>
 *     Lorem ipsum dolor sit amet…
 *   </PreventWidows>
 * </p>
 * ```
 */
export default class PreventWidows extends PureComponent {
  static propTypes = {
    /**
     * The minimum width of the last line, below which non-breaking spaces will
     * be inserted until the minimum is met.
     *
     * * **Numbers** are treated as absolute pixel widths.
     * * **Strings** must be numbers ending with `%` or `px`. Percentage values
     *   are determined as a percentage of the longest line.
     * * **Functions** will be called with relevant data to determine a dynamic
     *   number or string value to return. This can be used, for example, to
     *   have different rules at different breakpoints – like a media query.
     */
    minLineWidth: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.func
    ]).isRequired,
    /**
     * The maximum number of spaces to be substituted for non-breaking spaces.
     * If this number is reached, no more adjustments will be made, even if the
     * line is too short.
     */
    maxSpaces: PropTypes.number,
    /**
     * A character or element to use when substituting spaces. Defaults to a
     * standard non-breaking space character, which you should almost certainly
     * stick with unless you want to visualize where non-breaking spaces are
     * being inserted (during development) or adjust their width.
     *
     * * **String** values will be inserted directly into existing Text nodes.
     * * **React Element** values will be rendered into an in-memory “incubator”
     *   node, then transplanted into the DOM, splitting up the Text node in
     *   which the space was found.
     * * **Function** values must produce a string, Text node, Element node, or
     *   React Element to insert.
     */
    nbspChar: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.element,
      PropTypes.func
    ]).isRequired
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
      // This is probably a terrible idea, but it's neat to support React
      // elements as replacement nodes.
      if (!this._nbspIncubator) {
        this._nbspIncubator = document.createElement('div')
      }
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

  updateTextNode = node => {
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
        {React.Children.map(
          children,
          child =>
            (React.isValidElement(child) && typeof child.type !== 'string'
              ? React.cloneElement(child, {
                onReadyForTypesetting: this.onChildrenReady
              })
              : child)
        )}
      </span>
    )
  }
}
