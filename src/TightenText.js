import React from "react";
import PropTypes from "prop-types";
import createLogger from "debug";
import ResizeObserver from "./ResizeObserver";
import binarySearch from "./binarySearch";

const debug = createLogger("react-typesetting:TightenText");

const defaultStyle = {
  display: "inline-block",
  position: "relative",
  width: "100%"
};

const innerStyle = {
  // Since this is applied to an inline element, the parent's `line-height`
  // should still control the rendered line height. But without this, browsers
  // will annoyingly shift around the height of the box as the `font-size` shrinks.
  lineHeight: 1
};

const defaultFormatter = value => `${value}em`;

/**
 * ```js
 * import { TightenText } from 'react-typesetting';
 * ```
 *
 * Tightens `word-spacing`, `letter-spacing`, and `font-size` (in that order)
 * by the minimum amount necessary to ensure a minimal number of wrapped lines
 * and overflow.
 *
 * The algorithm starts by setting the minimum of all values (defined by the
 * `minWordSpacing`, `minLetterSpacing`, and `minFontSize` props) to determine
 * whether adjusting these will result in fewer wrapped lines or less overflow.
 * If so, then a binary search is performed (with at most `maxIterations`) to
 * find the best fit.
 *
 * By default, element resizes that may necessitate refitting the text are
 * automatically detected. By specifying the `reflowKey` prop, you can instead
 * take manual control by changing the prop whenever you’d like the component to
 * update.
 *
 * Note that unlike with typical justified text, the fit adjustments must apply
 * to all lines of the text, not just the lines that need to be tightened,
 * because there is no way to target individual wrapped lines. Thus, this
 * component is best used sparingly for typographically important short runs
 * of text, like titles or labels.
 */
export default class TightenText extends React.PureComponent {
  static propTypes = {
    /**
     * The class to apply to the outer wrapper `span` created by this component.
     */
    className: PropTypes.string,
    /**
     * Extra style properties to add to the outer wrapper `span` created by this
     * component.
     */
    style: PropTypes.object,
    /**
     * The content to render.
     */
    children: PropTypes.node,
    /**
     * Minimum word spacing in ems. Set this to 0 if word spacing should not be
     * adjusted.
     */
    minWordSpacing: PropTypes.number,
    /**
     * Minimum letter spacing in ems. Set this to 0 if word spacing should not
     * be adjusted.
     */
    minLetterSpacing: PropTypes.number,
    /**
     * Minimum `font-size` in ems. Set this to 1 if font size should not be
     * adjusted.
     */
    minFontSize: PropTypes.number,
    /**
     * When performing a binary search to find the optimal value of each CSS
     * property, this sets the maximum number of iterations to run before
     * settling on a value.
     */
    maxIterations: PropTypes.number,
    /**
     * If specified, disables automatic reflow so that you can trigger it
     * manually by changing this value. The prop itself does nothing, but
     * changing it will cause React to update the component.
     */
    reflowKey: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    /**
     * Debounces reflows so they happen at most this often in milliseconds (at
     * the end of the given duration). If not specified, reflow is computed
     * every time the component is rendered.
     */
    reflowTimeout: PropTypes.number,
    /**
     * Whether to completely disable refitting the text. Any fit adjustments
     * that have already been applied in a previous render will be preserved.
     */
    disabled: PropTypes.bool,
    /**
     * A function to call when layout has been recomputed and the text is done
     * refitting.
     */
    onReflow: PropTypes.func
  };

  static defaultProps = {
    minWordSpacing: -0.02,
    minLetterSpacing: -0.02,
    minFontSize: 0.97,
    maxIterations: 5
  };

  outerRef = React.createRef();
  innerRef = React.createRef();
  reflowScheduled = false;

  scheduleReflow(snapshot) {
    const { reflowTimeout, disabled } = this.props;
    if (disabled) {
      return;
    }
    if (!this.reflowScheduled) {
      this.reflowScheduled = true;
      if (reflowTimeout) {
        this.timeout = window.setTimeout(this.reflow, reflowTimeout);
      } else {
        this.raf = window.requestAnimationFrame(this.reflow);
      }
    }
  }

  countLines() {
    return this.innerRef.current.getClientRects().length;
  }

  measureOverflow() {
    const node = this.outerRef.current;
    return node.scrollWidth - node.clientWidth;
  }

  resetStyle() {
    this.innerRef.current.style.cssText = `
      word-spacing: 0;
      letter-spacing: 0;
      font-size: 1em;
    `;
  }

  updateStyle(property, value, formatter = defaultFormatter) {
    const outputValue = value == null ? value : formatter(value);
    debug("Setting property '%s' to '%s'", property, outputValue);
    this.innerRef.current.style[property] = outputValue;
  }

  /**
   * Adjust the word spacing, letter spacing, and font size applied to
   * `innerNode` in order to minimize the number of wrapped lines and the amount
   * of overflow. Styles are updated directly on `innerNode` without using
   * `setState` - this should be okay because this component owns `innerNode`
   * and does not alter it in any way via React. If React decides to replace
   * `innerNode`, then it should call `componentDidUpdate` and this method will
   * reset and recalculate the styles anyway.
   */
  reflow = () => {
    this.reflowScheduled = false;

    let startTime;
    if (debug.enabled) {
      startTime = Date.now();
    }
    const {
      minWordSpacing,
      minLetterSpacing,
      minFontSize,
      maxIterations,
      onReflow
    } = this.props;

    // Reset styles and determine the number of lines. This is the widest the
    // text gets and thus should result in the maximum number of lines.
    this.resetStyle();
    const maxLineCount = this.countLines();
    const maxOverflow = this.measureOverflow();
    // If there's only one line, our job is done! Otherwise, find out if we
    // can apply styles to get fewer lines.
    if (maxLineCount > 1 || maxOverflow > 0) {
      this.innerRef.current.style.cssText = `
        word-spacing: ${minWordSpacing}em;
        letter-spacing: ${minLetterSpacing}em;
        font-size: ${minFontSize}em;
      `;
      const minLineCount = this.countLines();
      const minOverflow = this.measureOverflow();
      debug(
        "Determined target line count %s -> %s and overflow %s -> %s",
        maxLineCount,
        minLineCount,
        maxOverflow,
        minOverflow
      );
      // If tightening the text reduced the line count, perform a binary
      // search to find the widest the text can be. Otherwise, reset styles
      // again as they had no benefit.
      if (minLineCount < maxLineCount || minOverflow < maxOverflow) {
        // The measurement function should return `TOO_HIGH` if we should keep
        // searching for a smaller value and `TOO_LOW` if we should keep
        // searching for a larger value.
        const measure = () =>
          this.countLines() > minLineCount ||
          this.measureOverflow() > minOverflow
            ? binarySearch.TOO_HIGH
            : binarySearch.TOO_LOW;

        // First, check if shrinking the font size is even necessary to meet
        // our goal. If so, search for the optimal size, otherwise continue
        // on to letter spacing.
        this.updateStyle("fontSize", 1);
        if (measure() === binarySearch.TOO_HIGH) {
          binarySearch({
            lowerBound: minFontSize,
            upperBound: 1,
            maxIterations,
            measure,
            update: value => this.updateStyle("fontSize", value)
          });
        } else {
          // Do the same thing with letter spacing.
          this.updateStyle("letterSpacing", 0);
          if (measure() === binarySearch.TOO_HIGH) {
            binarySearch({
              lowerBound: minLetterSpacing,
              upperBound: 0,
              maxIterations,
              measure,
              update: value => this.updateStyle("letterSpacing", value)
            });
          } else {
            // We already know word spacing can't be 0, otherwise we wouldn't
            // have found a smaller line count / overflow in the first place
            // and wouldn't be in this branch. So there's no reason to reset
            // it first like the other values. Search for the optimal size
            // starting at the minimum.
            binarySearch({
              lowerBound: minWordSpacing,
              upperBound: 0,
              maxIterations,
              measure,
              update: value => this.updateStyle("wordSpacing", value)
            });
          }
        }
      } else {
        this.resetStyle();
      }
    }
    if (debug.enabled) {
      const endTime = Date.now();
      debug("Reflow completed in %sms", endTime - startTime);
    }
    if (onReflow) {
      onReflow();
    }
  };

  handleResize = () => {
    debug("Detected resize, forcing update");
    this.forceUpdate();
  };

  componentDidMount() {
    this.scheduleReflow();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.scheduleReflow(snapshot);
  }

  componentWillUnmount() {
    if (this.reflowScheduled) {
      window.clearTimeout(this.timeout);
      window.cancelAnimationFrame(this.raf);
    }
  }

  render() {
    const { className, style, reflowKey, children } = this.props;
    const outerStyle = style ? { ...defaultStyle, ...style } : defaultStyle;
    const content = (
      <span className={className} style={outerStyle} ref={this.outerRef}>
        <span ref={this.innerRef} style={innerStyle}>
          {children}
        </span>
        {reflowKey == null ? (
          <ResizeObserver onResize={this.handleResize} />
        ) : null}
      </span>
    );
    return reflowKey == null ? (
      <ResizeObserver observe={this.outerRef} onResize={this.handleResize}>
        {content}
      </ResizeObserver>
    ) : (
      content
    );
  }
}
