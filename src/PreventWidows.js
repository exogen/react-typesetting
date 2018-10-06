import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import createLogger from "debug";
import ResizeObserver from "./ResizeObserver";
import {
  iterTextNodesReverse,
  replaceTextInNode,
  getLines,
  getLineWidth
} from "./domUtils";

const debug = createLogger("react-typesetting:PreventWidows");

const NBSP = "\u00a0";

let _nbspIncubator;

/**
 * Prevents [widows](https://www.fonts.com/content/learning/fontology/level-2/text-typography/rags-widows-orphans)
 * by measuring the width of the last line of text rendered by the component’s
 * children. Spaces will be converted to non-breaking spaces until the given
 * minimum width or the maximum number of substitutions is reached.
 *
 * By default, element resizes that may necessitate recomputing line widths are
 * automatically detected. By specifying the `reflowKey` prop, you can instead
 * take manual control by changing the prop whenever you’d like the component to
 * update.
 */
export default class PreventWidows extends React.PureComponent {
  hostRef = React.createRef();

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
     * The maximum number of spaces to substitute.
     */
    maxSubstitutions: PropTypes.number,
    /**
     * The minimum width of the last line, below which non-breaking spaces will
     * be inserted until the minimum is met.
     *
     * * **Numbers** indicate an absolute pixel width.
     * * **Strings** indicate a CSS `width` value that will be computed by
     *   temporarily injecting an element into the container and determining its
     *   width.
     * * **Functions** will be called with relevant data to determine a dynamic
     *   number or string value to return. This can be used, for example, to
     *   have different rules at different breakpoints – like a media query.
     */
    minLineWidth: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.func
    ]),
    /**
     * A character or element to use when substituting spaces. Defaults to a
     * standard non-breaking space character, which you should almost certainly
     * stick with unless you want to visualize where non-breaking spaces are
     * being inserted for debugging purposes, or adjust their width.
     *
     * * **String** values will be inserted directly into the existing Text node
     *   containing the space.
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
    ]),
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
     * Whether to completely disable widow prevention.
     */
    disabled: PropTypes.bool,
    /**
     * A function to call when layout has been recomputed and space substitution
     * is done.
     */
    onReflow: PropTypes.func
  };

  static defaultProps = {
    maxSubstitutions: 3,
    minLineWidth: "15%",
    nbspChar: NBSP
  };

  undoFunctions = [];

  handleResize = () => {
    debug("Detected resize, forcing update");
    this.forceUpdate();
  };

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

  createNbsp(nbspChar) {
    if (typeof nbspChar === "function") {
      return nbspChar();
    } else if (React.isValidElement(nbspChar)) {
      if (!_nbspIncubator) {
        _nbspIncubator = document.createElement("div");
      }
      // WARNING: This depends on `ReactDOM.render` being synchronous!
      ReactDOM.render(nbspChar, _nbspIncubator);
      const node = _nbspIncubator.childNodes[0];
      ReactDOM.unmountComponentAtNode(_nbspIncubator);
      return node;
    }
    return nbspChar;
  }

  getSnapshotBeforeUpdate() {
    const startTime = Date.now();
    this.undoFunctions.forEach(undo => undo());
    debug(
      "Undid %s substitutions in %sms",
      this.undoFunctions.length,
      Date.now() - startTime
    );
    return null;
  }

  reflow = () => {
    this.reflowScheduled = false;

    let startTime;
    if (debug.enabled) {
      startTime = Date.now();
    }
    const { onReflow, nbspChar, maxSubstitutions, minLineWidth } = this.props;

    let widthFn;
    if (typeof minLineWidth === "string") {
      widthFn = options => {
        const widthNode = document.createElement("span");
        widthNode.style.display = "block";
        widthNode.style.position = "absolute";
        widthNode.style.width = minLineWidth;
        const parentNode = options.ref.current;
        parentNode.appendChild(widthNode);
        const { width } = widthNode.getBoundingClientRect();
        parentNode.removeChild(widthNode);
        debug(
          "Computed minLineWidth of %o to be %s pixels",
          minLineWidth,
          width
        );
        return width || 0;
      };
    } else if (typeof minLineWidth === "function") {
      widthFn = minLineWidth;
    } else {
      widthFn = () => minLineWidth || 0;
    }

    const undoFunctions = [];
    let targetWidth;

    while (undoFunctions.length < maxSubstitutions) {
      const rects = this.hostRef.current.getClientRects();
      const lines = getLines(rects);
      if (lines.length < 2) {
        break;
      }
      const lineWidths = lines.map(getLineWidth);
      const maxLineWidth = Math.max(...lineWidths);
      const prevLineWidth = lineWidths[lineWidths.length - 2];
      const lastLineWidth = lineWidths[lineWidths.length - 1];
      if (targetWidth == null) {
        targetWidth = widthFn({
          ref: this.hostRef,
          lineWidths,
          maxLineWidth,
          prevLineWidth,
          lastLineWidth
        });
      }
      if (lastLineWidth >= targetWidth) {
        break;
      }
      // If meeting the target line width would require decreasing the
      // penultimate line's width below the minimum, bail out.
      if (prevLineWidth - (targetWidth - lastLineWidth) < targetWidth) {
        break;
      }
      const iter = iterTextNodesReverse(this.hostRef.current);
      let textNode = iter();
      while (textNode !== null) {
        const text = textNode.nodeValue;
        const lastSpace = text.lastIndexOf(" ");
        if (lastSpace !== -1) {
          const nbsp = this.createNbsp(nbspChar);
          const undo = replaceTextInNode(textNode, lastSpace, 1, nbsp);
          undoFunctions.push(undo);
          break;
        }
        textNode = iter();
      }
    }
    debug("Performed %s substitutions", undoFunctions.length);
    this.undoFunctions = undoFunctions;

    if (debug.enabled) {
      const endTime = Date.now();
      debug("Reflow completed in %sms", endTime - startTime);
    }
    if (onReflow) {
      onReflow();
    }
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
    return (
      <span className={className} style={style} ref={this.hostRef}>
        {children}
        {reflowKey == null ? (
          <ResizeObserver onResize={this.handleResize} />
        ) : null}
      </span>
    );
  }
}
