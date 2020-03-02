type Rects = ReturnType<typeof HTMLElement.prototype.getClientRects>;
type Rect = ReturnType<typeof HTMLElement.prototype.getBoundingClientRect>;

export function countLines(node: HTMLElement) {
  return node.getClientRects().length;
}

export function measureOverflow(node: HTMLElement) {
  return node.scrollWidth - node.clientWidth;
}

export function getLines(rects: Rects) {
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

export function getLineWidth(line: Rect[]) {
  const leftBound = Math.min(...line.map(rect => rect.left));
  const rightBound = Math.max(...line.map(rect => rect.right));
  return rightBound - leftBound;
}
