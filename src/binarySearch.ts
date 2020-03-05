export enum BinarySearchResult {
  Low = -1,
  Optimal = 0,
  High = 1
}

interface BinarySearchOptions {
  lowerBound: number;
  upperBound: number;
  measure: () => BinarySearchResult;
  update: (value: number) => void;
  limitPrecision?: number | false;
  maxIterations?: number;
  preference?: BinarySearchResult;
}

/**
 * Find an optimal value between `lowerBound` and `upperBound` by repeatedly
 * calling `update` and `measure` to determine if it's too high or too low.
 * After reaching the iteration limit, the final value will be determined by
 * `preference`, which indicates whether it's preferable to overshoot,
 * undershoot, or just settle for the last value no matter what. When this
 * function returns, `update` will already have been called with the final
 * value, so there's no need to use the return value to perform the final
 * update.
 */
export default function binarySearch({
  lowerBound,
  upperBound,
  measure,
  update,
  limitPrecision = 6,
  maxIterations = 5,
  preference = BinarySearchResult.Low
}: BinarySearchOptions): number {
  let lastValue = upperBound;
  for (let i = 0; i < maxIterations; i++) {
    // Calculate the midpoint of the current upper and lower bounds.
    let middle = (upperBound + lowerBound) / 2;
    // Browsers limit the precision that CSS values can have. WebKit and Gecko
    // use a precision of 6. We can use this to our advantage to bail out
    // early if the number of iterations leads us into too-precise territory.
    if (limitPrecision !== false) {
      middle = parseFloat(middle.toPrecision(limitPrecision));
    }
    if (middle === upperBound || middle === lowerBound) {
      // There's no point in iterating further due to limited precision.
      break;
    }
    lastValue = middle;
    update(middle);
    const result = measure();
    switch (result) {
      case BinarySearchResult.Low:
        // Increase the lower bound so we search for a higher value.
        lowerBound = middle;
        break;
      case BinarySearchResult.High:
        // Decrease the upper bound so we search for a lower value.
        upperBound = middle;
        break;
      default:
        // We've found the optimal value.
        return middle;
    }
  }
  // It's possible that we've ended on an iteration that doesn't satisfy our
  // goal (e.g. minimizing the line count). If a preference is specified,
  // return the last value that satisfies that preference instead of the value
  // we landed on.
  let finalValue;
  switch (preference) {
    case BinarySearchResult.Low:
      finalValue = lowerBound;
      break;
    case BinarySearchResult.High:
      finalValue = upperBound;
      break;
    default:
      finalValue = lastValue;
  }
  if (lastValue !== finalValue) {
    update(finalValue);
  }
  return finalValue;
}
