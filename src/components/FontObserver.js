import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import FontFaceObserver from 'fontfaceobserver'

/**
 * Detect when fonts load using the [fontfaceobserver](https://github.com/bramstein/fontfaceobserver)
 * library under the hood. This is useful if you are rendering custom fonts
 * within any components that need to compute text metrics such as line width
 * (like several of the components in this library). In such cases, you want
 * those components to re-render once the font has been applied, so their
 * metrics are up to date.
 *
 * ### Examples
 *
 * Re-render a child element as each font loads (or times out). Note that this
 * is only useful if the child component needs to compute text metrics after it
 * renders, and is allowed by the components `shouldComponentUpdate` method.
 *
 * ```jsx
 * <FontObserver fonts={[
 *   { family: 'Lato', weight: 400 },
 *   { family: 'Lato', weight: 700 }
 * ]}>
 *   <TightenText>This Headline Uses <strong>Custom Fonts</strong>!</TightenText>
 * </FontObserver>
 * ```
 *
 * Notify the rendering component when all fonts have loaded (or timed out).
 * If the handler calls `setState`, then even components not wrapped by
 * `FontObserver` will potentially be re-rendered (if their `shouldComponentUpdate`
 * method allows it).
 *
 *
 * ```jsx
 * <FontObserver onDone={this.handleFontsDone} fonts={APP_FONTS} />
 * <Header />
 * <Body />
 * <Footer />
 * ```
 *
 * Render a loading state until all fonts have loaded (or timed out):
 *
 * ```jsx
 * <FontObserver fonts={APP_FONTS}>
 *   {status => status.done ? <App /> : <p>Loading…</p>}
 * </FontObserver>
 * ```
 *
 * Render a list of the loaded fonts:
 *
 * ```jsx
 * <FontObserver fonts={APP_FONTS}>
 *   {status => status.fonts.map((font, i) => (
 *     <ul>
 *       <li key={i}>
 *         {font.error ? '✘ ' : '✔ '}
 *         {font.family}
 *         {font.weight ? ` • ${font.weight}` : ''}
 *         {font.style ? ` • ${font.style}` : ''}
 *       </li>
 *     </ul>
 *   ))}
 * </FontObserver>
 * ```
 */
export default class FontObserver extends PureComponent {
  static propTypes = {
    /**
     * The font faces to detect.
     *
     * * **String** values specify the font family name. This is sufficient if
     *   you are using only the family’s `normal` weight, style, and stretch
     *   values. Otherwise, you should list each style individually (see below)
     *   to truly detect when the full set of fonts has loaded.
     * * **Object** values must specify at least a `family`, and optionally
     *   `weight`, `style`, and `stretch` properties.
     */
    fonts: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          family: PropTypes.string.isRequired,
          weight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          style: PropTypes.string,
          stretch: PropTypes.string
        })
      ])
    ).isRequired,
    /**
     * Duration (in milliseconds) after which a font is considered to have
     * failed loading. If not provided, the [fontfaceobserver](https://github.com/bramstein/fontfaceobserver)
     * library will implicity use its own default.
     */
    timeout: PropTypes.number,
    /**
     * Test string to use for detecting if a font is available. If not provided,
     * the [fontfaceobserver](https://github.com/bramstein/fontfaceobserver)
     * library will implicitly use its own default.
     */
    testString: PropTypes.string,
    /**
     * Function to call every time a font in the list has successfully loaded.
     * It will be called with the full state of the `FontObserver` component
     * (see the `children` prop).
     */
    onLoad: PropTypes.func,
    /**
     * Function to call every time a font in the list has failed to load.
     * It will be called with the full state of the `FontObserver` component
     * (see the `children` prop).
     */
    onError: PropTypes.func,
    /**
     * Function to call once every font in the list has either loaded or failed.
     * It will be called with the full state of the `FontObserver` component
     * (see the `children` prop).
     */
    onDone: PropTypes.func,
    /**
     * A function or React Element to re-render on every font update.
     *
     * **Function** values will be called with an object useful for determining
     * the status of the requested fonts:
     *
     * ```js
     * {
     *   // The fonts loaded so far. They’ll be in the order
     *   // loaded, not the order provided to `FontObserver`.
     *   fonts: [{
     *     family: 'Lato', weight: 400, error: false
     *   }],
     *   // Whether any font failed to load.
     *   error: false,
     *   // Whether all fonts have either loaded or failed.
     *   done: true
     * }
     * ```
     *
     * **React Element** values must be a single child to re-render on every
     * font update. No extra props regarding the font status are passed to the
     * child – if you need this, use a function (see above).
     */
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.element])
  }

  static defaultProps = {}

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
      observer
        .load(testString, timeout)
        .then(
          () => this.onFontUpdate(fontConfig, false, --remaining),
          () => this.onFontUpdate(fontConfig, true, --remaining)
        )
    })
  }

  onFontUpdate (fontConfig, error, remaining) {
    if (this._mounted) {
      this.setState(state => {
        const font = typeof fontConfig === 'string'
          ? { family: fontConfig, error }
          : { ...fontConfig, error }
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
    } else if (React.isValidElement(children)) {
      children = React.cloneElement(children)
    }
    return children ? React.Children.only(children) : null
  }
}
