export function iterTextNodesReverse(node) {
  if (node.nodeType === 1) {
    let i = 0;
    let subIter = null;
    const iter = () => {
      if (subIter) {
        const value = subIter();
        if (value !== null) {
          return value;
        } else {
          subIter = null;
        }
      }
      i += 1;
      const index = node.childNodes.length - i;
      if (index < 0) {
        return null;
      }
      const childNode = node.childNodes[index];
      subIter = iterTextNodesReverse(childNode);
      return iter();
    };
    return iter;
  } else if (node.nodeType === 3) {
    let done = false;
    return () => {
      let value = null;
      if (!done) {
        value = node;
        done = true;
      }
      return value;
    };
  }
  return () => null;
}

// export function replaceNodeWithText(node, replacement) {
//   const { parentNode, previousSibling, nextSibling } = node;
//   const summary = { inserted: [], updated: [], removed: [] };
//   parentNode.removeChild(node);
//   summary.removed.push(node);
//   if (previousSibling && previousSibling.nodeType === 3) {
//     previousSibling.nodeValue +=
//       typeof replacement === "string" ? replacement : replacement.nodeValue;
//     summary.updated.push(previousSibling);
//   }
//   if (nextSibling && nextSibling.nodeType === 3) {
//     if (summary.updated.length) {
//       previousSibling.nodeValue += nextSibling.nodeValue;
//       parentNode.removeChild(nextSibling);
//       summary.removed.push(nextSibling);
//     } else {
//       nextSibling.nodeValue =
//         (typeof replacement === "string"
//           ? replacement
//           : replacement.nodeValue) + nextSibling.nodeValue;
//       summary.updated.push(nextSibling);
//     }
//   }
//   if (!summary.updated.length) {
//     const replacementNode =
//       typeof replacement === "string"
//         ? document.createTextNode(replacement)
//         : replacement;
//     parentNode.insertBefore(replacementNode, nextSibling);
//     summary.inserted.push(replacementNode);
//   }
//   return summary;
// }

/**
 * Replaces the span of text in `textNode` indicated by `startIndex` and
 * `length` with the given `replacement` string or node. The return value is an
 * undo function; calling it should leave the DOM in the same state it was in
 * before any changes were made.
 */
export function replaceTextInNode(textNode, startIndex, length, replacement) {
  if (
    replacement &&
    typeof replacement === "object" &&
    replacement.nodeType === 3
  ) {
    replacement = replacement.nodeValue;
  }
  const text = textNode.nodeValue;
  const head = text.slice(0, startIndex);
  const tail = text.slice(startIndex + length);
  if (typeof replacement === "string") {
    const oldValue = textNode.nodeValue;
    const newValue = head + replacement + tail;
    textNode.nodeValue = newValue;
    return () => {
      textNode.nodeValue = text;
    };
  } else if (replacement.nodeType === 1) {
    const headNode = document.createTextNode(head);
    textNode.nodeValue = tail;
    textNode.parentNode.insertBefore(replacement, textNode);
    textNode.parentNode.insertBefore(headNode, replacement);
    return () => {
      // `parentNode` might not be valid anymore!
      if (headNode.parentNode) {
        headNode.parentNode.removeChild(headNode);
      }
      if (replacement.parentNode) {
        replacement.parentNode.removeChild(replacement);
      }
      textNode.nodeValue = text;
    };
  } else {
    throw new Error(`Unexpected replacement type: ${replacement}`);
  }
}

export function getLines(rects) {
  const lines = [];
  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i];
    const lastIndex = lines.length - 1;
    if (lastIndex === -1 || rect.top > lines[lastIndex][0].top) {
      lines.push([rect]);
    } else {
      lines[lastIndex].push(rect);
    }
  }
  return lines;
}

export function getLineWidth(line) {
  const leftBound = Math.min(...line.map(rect => rect.left));
  const rightBound = Math.max(...line.map(rect => rect.right));
  return rightBound - leftBound;
}
