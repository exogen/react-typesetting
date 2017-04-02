import React, { PureComponent, PropTypes } from 'react'
import Measure from 'react-measure'
import { getLines, getLineWidth } from './util'

export default class TightenText extends PureComponent {
  static propTypes = {
    // Minimum font size as a percentage.
    minFontSize: PropTypes.number,
    // Minimum letter-spacing value in ems.
    minLetterSpacing: PropTypes.number,
    // Minimum word-spacing value in ems.
    minWordSpacing: PropTypes.number,
    // Whether to automatically refit text when the container element resizes.
    autoDetectResize: PropTypes.bool,
    // Callback for the owner to know when text is done refitting.
    onReadyForTypesetting: PropTypes.func
  }

  static defaultProps = {
    minFontSize: 96,
    minLetterSpacing: -9 / 320,
    minWordSpacing: -8 / 320
  }

  state = {
    index: 0,
    bestIndex: 0,
    high: 0,
    low: 0
  }

  componentWillReceiveProps () {
    // Re-measure these!
    this._minLines = null
    this._maxLines = null
  }

  componentDidMount () {
    this._searchArray = this.generateSearchArray()
    this._maxIndex = this._searchArray.length *
      this._searchArray[0][1].length * this._searchArray[0][1][0][1].length - 1
    this.adjustFit(getLines(this._textNode), this.state)
  }

  componentDidUpdate (prevProps, prevState) {
    this.adjustFit(getLines(this._textNode), prevState)
  }

  updateTextNode = (node) => {
    this._textNode = node
  }

  onDone () {
    if (this.props.onReadyForTypesetting) {
      this.props.onReadyForTypesetting()
    }
  }

  generateSearchArray () {
    // Generate an efficient multi-dimensional array of values to be binary
    // searched.
    const { minWordSpacing, minLetterSpacing, minFontSize } = this.props

    let wordSpacing = 0
    let wordSpacingNumerator = 0
    const wordSpacingArray = [wordSpacing]
    while (wordSpacing > minWordSpacing) {
      wordSpacingNumerator -= 1
      wordSpacing = Math.max(minWordSpacing, wordSpacingNumerator / 320)
      wordSpacingArray.push(wordSpacing)
    }

    let letterSpacing = 0
    let letterSpacingNumerator = 0
    const letterSpacingArray = [[letterSpacing, wordSpacingArray]]
    while (letterSpacing > minLetterSpacing) {
      letterSpacingNumerator -= 1
      letterSpacing = Math.max(minLetterSpacing, letterSpacingNumerator / 320)
      letterSpacingArray.push([letterSpacing, wordSpacingArray])
    }

    let fontSize = 100
    let fontSizeNumerator = 0
    const fontSizeArray = [[fontSize, letterSpacingArray]]
    while (fontSize > minFontSize) {
      fontSizeNumerator -= 1
      fontSize = Math.max(minFontSize, 100 + fontSizeNumerator / 4)
      fontSizeArray.push([fontSize, letterSpacingArray])
    }

    return fontSizeArray
  }

  getSearchIndex (arr, index) {
    const xSize = arr.length
    const ySize = arr[0][1].length
    const zSize = arr[0][1][0][1].length
    const z = index % zSize
    index = Math.floor(index / zSize)
    const y = index % ySize
    const x = Math.floor(index / ySize)
    const fontSize = arr[x][0]
    const letterSpacing = arr[x][1][y][0]
    const wordSpacing = arr[x][1][y][1][z]
    return {
      fontSize: fontSize === 100 ? null : `${fontSize}%`,
      letterSpacing: letterSpacing === 0 ? null : `${letterSpacing}em`,
      wordSpacing: wordSpacing === 0 ? null : `${wordSpacing}em`
    }
  }

  adjustFit (lines, prevState) {
    const { index, bestIndex, low, high } = this.state
    if (index === 0) {
      this._maxLines = lines
    }
    if (index === this._maxIndex) {
      this._minLines = lines
    }
    if (this._maxLines == null) {
      this.setState({ index: 0, low: 0 })
      return
    }
    if (this._minLines == null) {
      this.setState({
        index: this._maxIndex,
        bestIndex: this._maxIndex,
        high: this._maxIndex
      })
      return
    }
    const maxLineCount = this._maxLines.length
    const minLineCount = this._minLines.length
    const lineCount = lines.length
    if (minLineCount < maxLineCount) {
      if (lineCount > minLineCount && index < high) {
        this.setState({
          index: Math.ceil((index + high) / 2),
          low: index
        })
      } else if (lineCount === minLineCount && index > low) {
        const nextIndex = Math.ceil((low + index) / 2)
        if (nextIndex !== index) {
          this.setState({
            index: nextIndex,
            bestIndex: index,
            high: index
          })
        } else {
          this.onDone()
        }
      } else if (index !== bestIndex) {
        this.setState({ index: bestIndex })
      } else {
        this.onDone()
      }
    } else if (index !== 0 || bestIndex !== 0) {
      this.setState({ index: 0, bestIndex: 0 })
    } else {
      this.onDone()
    }
  }

  render () {
    const { children } = this.props
    const { index } = this.state
    const style = this._searchArray
      ? this.getSearchIndex(this._searchArray, index) : null
    return (
      <span style={style} ref={this.updateTextNode}>
        {children}
      </span>
    )
  }
}
