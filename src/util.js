import React from 'react'

export function getLines (node) {
  const rects = node.getClientRects()
  const lines = []
  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i]
    const lastIndex = lines.length - 1
    if (lines.length && rect.top === lines[lastIndex][0].top) {
      lines[lastIndex].push(rect)
    } else {
      lines.push([rect])
    }
  }
  return lines
}

export function getLineWidth (line) {
  const leftBound = Math.min(...line.map(rect => rect.left))
  const rightBound = Math.max(...line.map(rect => rect.right))
  return rightBound - leftBound
}

export function getLengthPx (length, data) {
  if (typeof length === 'function') {
    return getLengthPx(length(data), data)
  }
  if (typeof length === 'number') {
    return length
  }
  if (length.match(/^-?\d*\.?\d+%$/)) {
    return data.availableWidth * parseFloat(length) / 100
  }
  if (length.match(/^-?\d*\.?\d+px$/)) {
    return parseFloat(length)
  }
  throw new Error(`Unknown length unit: ${length}`)
}

export function iterTextNodesReverse (node) {
  if (node.nodeType === 1) {
    let i = 0
    let subIter = null
    const iter = () => {
      if (subIter) {
        const value = subIter()
        if (value !== null) {
          return value
        } else {
          subIter = null
        }
      }
      i += 1
      const index = node.childNodes.length - i
      if (index < 0) {
        return null
      }
      const childNode = node.childNodes[index]
      subIter = iterTextNodesReverse(childNode)
      return iter()
    }
    return iter
  } else if (node.nodeType === 3) {
    let done = false
    return () => {
      let value = null
      if (!done) {
        value = node
        done = true
      }
      return value
    }
  }
  return () => null
}

export function replaceNodeWithText (node, replacement) {
  const { parentNode, previousSibling, nextSibling } = node
  const summary = { inserted: [], updated: [], removed: [] }
  parentNode.removeChild(node)
  summary.removed.push(node)
  if (previousSibling && previousSibling.nodeType === 3) {
    previousSibling.nodeValue += typeof replacement === 'string'
      ? replacement
      : replacement.nodeValue
    summary.updated.push(previousSibling)
  }
  if (nextSibling && nextSibling.nodeType === 3) {
    if (summary.updated.length) {
      previousSibling.nodeValue += nextSibling.nodeValue
      parentNode.removeChild(nextSibling)
      summary.removed.push(nextSibling)
    } else {
      nextSibling.nodeValue =
        (typeof replacement === 'string'
          ? replacement
          : replacement.nodeValue) + nextSibling.nodeValue
      summary.updated.push(nextSibling)
    }
  }
  if (!summary.updated.length) {
    const replacementNode = typeof replacement === 'string'
      ? document.createTextNode(replacement)
      : replacement
    parentNode.insertBefore(replacementNode, nextSibling)
    summary.inserted.push(replacementNode)
  }
  return summary
}

export function replaceTextInNode (textNode, startIndex, length, replacement) {
  if (typeof replacement === 'object' && replacement.nodeType === 3) {
    replacement = replacement.nodeValue
  }
  const text = textNode.nodeValue
  const head = text.slice(0, startIndex)
  const tail = text.slice(startIndex + length)
  const summary = { inserted: [], updated: [], removed: [] }
  if (typeof replacement === 'string') {
    const newText = head + replacement + tail
    if (newText) {
      textNode.nodeValue = newText
      summary.updated.push(textNode)
    } else {
      textNode.parentNode.removeChild(textNode)
      summary.removed.push(textNode)
    }
  } else if (replacement.nodeType === 1) {
    const { parentNode } = textNode
    parentNode.insertBefore(replacement, textNode)
    summary.inserted.push(replacement)
    if (head) {
      const headNode = document.createTextNode(head)
      parentNode.insertBefore(headNode, replacement)
      summary.inserted.push(headNode)
    }
    if (tail) {
      textNode.nodeValue = tail
      summary.updated.push(textNode)
    } else {
      parentNode.removeChild(textNode)
      summary.removed.push(textNode)
    }
  } else {
    throw new Error(`Unexpected replacement type: ${replacement}`)
  }
  return summary
}
