import React, { PureComponent, PropTypes } from 'react'
import FontFaceObserver from 'fontfaceobserver'

export default class FontObserver extends PureComponent {
  static propTypes = {
    fonts: PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        family: PropTypes.string.isRequired,
        weight: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number
        ]),
        style: PropTypes.string,
        stretch: PropTypes.string
      })
    ])).isRequired,
    testString: PropTypes.string,
    timeout: PropTypes.number,
    children: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.element
    ]).isRequired,
    onUpdate: PropTypes.func
  }

  static defaultProps = {
    testString: null
  }

  state = {
    fonts: [],
    error: false,
    done: false
  }

  componentDidMount () {
    const { fonts, testString, timeout } = this.props
    let remaining = fonts.length
    this._mounted = true
    fonts.forEach(fontConfig => {
      const args = []
      if (typeof fontConfig === 'object') {
        const { family, ...descriptors } = fontConfig
        args.push(family, descriptors)
      } else {
        args.push(fontConfig)
      }
      const observer = new FontFaceObserver(...args)
      observer.load(testString, timeout).then(
        () => this.onFontUpdate(fontConfig, false, --remaining),
        () => this.onFontUpdate(fontConfig, true, --remaining)
      )
    })
  }

  onFontUpdate (fontConfig, error, remaining) {
    if (this._mounted) {
      this.setState(state => {
        const font = typeof fontConfig === 'string'
          ? { family: fontConfig, error } : { ...fontConfig, error }
        return {
          fonts: [...state.fonts, font],
          error: error || state.error,
          done: remaining === 0
        }
      })
    }
  }

  componentWillUnmount () {
    this._mounted = false
  }

  componentDidUpdate (prevProps, prevState) {
    const { state } = this
    const { onLoad, onError, onDone } = this.props
    if (onError || onLoad) {
      for (let i = prevState.fonts.length; i < state.fonts.length; i++) {
        const font = state.fonts[i]
        const handler = font.error ? onError : onLoad
        if (handler) {
          handler({ ...state })
        }
      }
    }
    if (onDone && state.done && !prevState.done) {
      onDone({ ...state })
    }
  }

  render () {
    let { children } = this.props
    if (typeof children === 'function') {
      children = children({ ...this.state })
    }
    return React.Children.only(children)
  }
}
