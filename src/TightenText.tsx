import React, {
  FunctionComponent,
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef
} from "react";
import { countLines, measureOverflow } from "./domUtils";
import binarySearch, { BinarySearchResult } from "./binarySearch";

const DEV = process.env.NODE_ENV !== "production";

const debug = DEV
  ? require("debug")("react-typesetting:TightenText")
  : undefined;

// React needlessly warns about using `useLayoutEffect` effect on the server,
// even though it's just as meaningless as `useEffect` there. So swap to
// `useEffect` in a server environment.
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const outerStyle = {
  display: "inline-block",
  transformOrigin: "0 0"
};

function updateStyle(
  node: HTMLElement,
  property: string,
  value: number | string | null
) {
  let outputValue: string | null;
  switch (property) {
    case "scaleX":
      if (typeof value === "number") {
        updateStyle(node, "width", 100 / value);
        outputValue = `${property}(${value})`;
      } else {
        updateStyle(node, "width", 100);
        outputValue = value;
      }
      property = "transform";
      break;
    case "width":
      if (typeof value === "number") {
        outputValue = `${value}%`;
      } else {
        outputValue = value;
      }
      break;
    default:
      if (typeof value === "number") {
        outputValue = `${value}em`;
      } else {
        outputValue = value;
      }
  }
  if (DEV) {
    debug("Setting property %s to %s.", property, outputValue);
  }
  node.style.setProperty(property, outputValue);
}

function resetStyle(node: HTMLElement) {
  updateStyle(node, "word-spacing", null);
  updateStyle(node, "letter-spacing", null);
  updateStyle(node, "scaleX", null);
}

type RequestId = ReturnType<typeof requestAnimationFrame>;
type TimeoutId = ReturnType<typeof setTimeout>;

interface TightenTextProps {
  // I would rather not have to specify `children` myself, since React already
  // includes this in its `ChildWithProps<P>` type. But there's an issue with
  // `React.memo` losing those types:
  // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/37087
  children?: ReactNode;
  disabled?: boolean;
  maxIterations?: number;
  minLetterSpacing?: number | ((initial: number) => number);
  minScaleX?: number | ((initial: number) => number);
  minWordSpacing?: number | ((initial: number) => number);
  reflowKey?: unknown;
  reflowTimeout?: number;
}

const TightenText: FunctionComponent<TightenTextProps> = ({
  children,
  disabled = false,
  maxIterations = 5,
  minLetterSpacing: inputMinLetterSpacing = initial => initial - 0.02,
  minScaleX: inputMinScaleX = 0.97,
  minWordSpacing: inputMinWordSpacing = initial => initial - 0.02,
  reflowTimeout = 0
}) => {
  const outerRef = useRef<HTMLSpanElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);
  const raf = useRef<RequestId>();
  const timeout = useRef<TimeoutId>();
  const isStyleModified = useRef(false);

  const reflow = useCallback(() => {
    let startTime;
    if (DEV) {
      startTime = Date.now();
    }

    const outerNode = outerRef.current!;
    const innerNode = innerRef.current!;

    // Reset styles and determine the number of lines. This is the widest the
    // text gets and thus should result in the maximum number of lines.
    resetStyle(outerNode);
    isStyleModified.current = false;
    if (disabled) {
      return;
    }
    const maxLineCount = countLines(innerNode);
    const maxOverflow = measureOverflow(outerNode);
    // If there's only one line, our job is done! Otherwise, find out if we
    // can apply styles to get fewer lines.
    if (maxLineCount > 1 || maxOverflow > 0) {
      const computedStyle = window.getComputedStyle(outerNode);
      const fontSize = parseInt(computedStyle.fontSize, 10);
      const wordSpacing =
        computedStyle.wordSpacing === "normal"
          ? 0
          : parseInt(computedStyle.wordSpacing, 10);
      const letterSpacing =
        computedStyle.letterSpacing === "normal"
          ? 0
          : parseInt(computedStyle.letterSpacing, 10);

      const maxWordSpacing = wordSpacing / fontSize;
      const maxLetterSpacing = letterSpacing / fontSize;
      const maxScaleX = 1;

      const minWordSpacing =
        typeof inputMinWordSpacing === "function"
          ? inputMinWordSpacing(maxWordSpacing)
          : inputMinWordSpacing;
      const minLetterSpacing =
        typeof inputMinLetterSpacing === "function"
          ? inputMinLetterSpacing(maxLetterSpacing)
          : inputMinLetterSpacing;
      const minScaleX =
        typeof inputMinScaleX === "function"
          ? inputMinScaleX(1)
          : inputMinScaleX;

      updateStyle(outerNode, "word-spacing", minWordSpacing);
      updateStyle(outerNode, "letter-spacing", minLetterSpacing);
      updateStyle(outerNode, "scaleX", minScaleX);
      isStyleModified.current = true;

      const minLineCount = countLines(innerNode);
      const minOverflow = measureOverflow(outerNode);

      if (DEV) {
        debug(
          "Determined target line count %s -> %s and overflow %s -> %s.",
          maxLineCount,
          minLineCount,
          maxOverflow,
          minOverflow
        );
      }
      // If tightening the text reduced the line count, perform a binary
      // search to find the widest the text can be. Otherwise, reset styles
      // again as they had no benefit.
      if (minLineCount < maxLineCount || minOverflow < maxOverflow) {
        // If the minimum overflow is not zero, don't bother trying to widen the
        // parameters, just end on the tightest fitting, which we're already on.
        if (!minOverflow) {
          // The measurement function should return `High` if we should keep
          // searching for a smaller value and `Low` if we should keep
          // searching for a larger value.
          const measure = () =>
            countLines(innerNode) > minLineCount ||
            measureOverflow(outerNode) > minOverflow
              ? BinarySearchResult.High
              : BinarySearchResult.Low;

          // First, check if shrinking the scaleX transform is even necessary to
          // meet our goal. If so, search for the optimal size, otherwise continue
          // on to letter spacing.
          updateStyle(outerNode, "scaleX", null);
          if (measure() === BinarySearchResult.High) {
            binarySearch({
              lowerBound: minScaleX,
              upperBound: maxScaleX,
              maxIterations,
              measure,
              update: value => updateStyle(outerNode, "scaleX", value)
            });
          } else {
            // Do the same thing with letter spacing.
            updateStyle(outerNode, "letter-spacing", null);
            if (measure() === BinarySearchResult.High) {
              binarySearch({
                lowerBound: minLetterSpacing,
                upperBound: maxLetterSpacing,
                maxIterations,
                measure,
                update: value => updateStyle(outerNode, "letter-spacing", value)
              });
            } else {
              // We already know word spacing can't be 0, otherwise we wouldn't
              // have found a smaller line count / overflow in the first place
              // and wouldn't be in this branch. So there's no reason to reset
              // it first like the other values. Search for the optimal size
              // starting at the minimum.
              binarySearch({
                lowerBound: minWordSpacing,
                upperBound: maxWordSpacing,
                maxIterations,
                measure,
                update: value => updateStyle(outerNode, "word-spacing", value)
              });
            }
          }
        }
      } else {
        resetStyle(outerNode);
        isStyleModified.current = false;
      }
    } else {
      if (DEV) {
        debug("Already at minimum line count and overflow.");
      }
    }
    if (DEV) {
      if (startTime) {
        const endTime = Date.now();
        debug("Reflow completed in %sms.", endTime - startTime);
      }
    }
  }, [
    disabled,
    maxIterations,
    inputMinLetterSpacing,
    inputMinScaleX,
    inputMinWordSpacing
  ]);

  useIsomorphicLayoutEffect(() => {
    if (disabled && !isStyleModified.current) {
      return;
    }
    const scheduleReflow = () => {
      timeout.current = undefined;
      raf.current = window.requestAnimationFrame(reflow);
    };
    if (reflowTimeout) {
      if (timeout.current == null) {
        timeout.current = setTimeout(scheduleReflow, reflowTimeout);
      }
    } else {
      scheduleReflow();
    }
    return () => {
      if (raf.current != null) {
        window.cancelAnimationFrame(raf.current);
      }
    };
  });

  useIsomorphicLayoutEffect(() => {
    return () => {
      if (timeout.current != null) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  return (
    <span ref={outerRef} style={outerStyle}>
      <span ref={innerRef}>{children}</span>
    </span>
  );
};

export default React.memo(TightenText);
