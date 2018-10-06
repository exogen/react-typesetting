import React from "react";
import PropTypes from "prop-types";
import FontFaceObserver from "fontfaceobserver";
import createLogger from "debug";
import Context from "./FontObserverContext";

const debug = createLogger("react-typesetting:FontObserver");

export default class FontObserverProvider extends React.Component {
  static displayName = "FontObserver.Provider";

  static propTypes = {
    /**
     * The fonts to load and observe. The font files themselves should already
     * be specified somewhere (in CSS), this component simply uses `FontFaceObserver`
     * to force them to load (if necessary) and observe when they are ready.
     *
     * Each item in the array specifies the font `family`, `weight`, `style`,
     * and `stretch`, with only `family` being required. Additionally, each item
     * can contain a custom `testString` and `timeout` for that font, if they
     * should diff from the defaults. If only the family name is needed, the
     * array item can just be a string.
     */
    fonts: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
          /**
           * The font family name.
           */
          family: PropTypes.string.isRequired,
          weight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
          style: PropTypes.string,
          stretch: PropTypes.string,
          testString: PropTypes.string,
          timeout: PropTypes.number
        })
      ])
    ).isRequired,
    /**
     * A custom test string to pass to the `load` method of `FontFaceObserver`,
     * to be used for all fonts that do not specify their own `testString`.
     */
    testString: PropTypes.string,
    /**
     * A custom timeout in milliseconds to pass to the `load` method of
     * `FontFaceObserver`, to be used for all fonts that do not specify their
     * own `timeout`.
     */
    timeout: PropTypes.number,
    /**
     * The content that will have access to font loading status via context.
     */
    children: PropTypes.node
  };

  mounted = false;

  fontDescriptors = this.props.fonts.map(font => {
    if (typeof font === "string") {
      font = { family: font };
    }
    return {
      font,
      observer: null,
      promise: null
    };
  });

  state = {
    fonts: this.fontDescriptors.map(descriptor => {
      return {
        ...descriptor.font,
        loaded: false,
        error: null
      };
    }),
    loaded: false,
    error: null
  };

  handleLoad(font, i) {
    if (this.mounted) {
      debug(
        "Loaded font “%s” (#%s of %s)",
        font.family,
        i + 1,
        this.fontDescriptors.length
      );
      this.setState(state => {
        const fonts = state.fonts.slice();
        fonts[i] = {
          ...fonts[i],
          loaded: true
        };
        return {
          fonts,
          loaded: fonts.length === 1 || fonts.every(font => font.loaded)
        };
      });
    }
  }

  handleError(font, i, err) {
    if (this.mounted) {
      debug(
        "Error loading font “%s” (#%s of %s)",
        font.family,
        i + 1,
        this.fontDescriptors.length
      );
      this.setState(state => {
        const fonts = state.fonts.slice();
        const error = err || new Error("Font failed to load");
        fonts[i] = {
          ...fonts[i],
          error
        };
        return {
          fonts,
          error: state.error || error
        };
      });
    }
  }

  componentDidMount() {
    this.mounted = true;

    const {
      testString: defaultTestString,
      timeout: defaultTimeout
    } = this.props;

    this.fontDescriptors.forEach((descriptor, i) => {
      const {
        family,
        testString = defaultTestString,
        timeout = defaultTimeout,
        ...variation
      } = descriptor.font;

      debug(
        "Creating FontFaceObserver for “%s” (#%s of %s)",
        family,
        i + 1,
        this.fontDescriptors.length
      );
      const observer = new FontFaceObserver(family, variation);
      const promise = observer.load(testString, timeout);

      promise.then(
        this.handleLoad.bind(this, descriptor.font, i),
        this.handleError.bind(this, descriptor.font, i)
      );

      descriptor.observer = observer;
      descriptor.promise = promise;
    });
  }

  componentWillUnmount() {
    this.mounted = false;
    this.fontDescriptors = undefined;
  }

  render() {
    const { children } = this.props;
    return <Context.Provider value={this.state}>{children}</Context.Provider>;
  }
}
