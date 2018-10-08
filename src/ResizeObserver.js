import React from "react";
import PropTypes from "prop-types";
import ResizeDetector from "react-resize-detector";

export default function ResizeObserver(props) {
  return <ResizeDetector handleWidth handleHeight onResize={props.onResize} />;
}

ResizeObserver.propTypes = {
  /**
   * A function to call when the element size changes.
   */
  onResize: PropTypes.func
};
