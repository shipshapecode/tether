export function addOffset(...offsets) {
  const out = { top: 0, left: 0 };

  offsets.forEach(({ top, left }) => {
    if (typeof top === 'string') {
      top = parseFloat(top);
    }
    if (typeof left === 'string') {
      left = parseFloat(left);
    }

    out.top += top;
    out.left += left;
  });

  return out;
}

export function offsetToPx(offset, size) {
  if (typeof offset.left === 'string' && offset.left.indexOf('%') !== -1) {
    offset.left = parseFloat(offset.left) / 100 * size.width;
  }
  if (typeof offset.top === 'string' && offset.top.indexOf('%') !== -1) {
    offset.top = parseFloat(offset.top) / 100 * size.height;
  }

  return offset;
}

export function parseTopLeft(value) {
  const [top, left] = value.split(' ');
  return { top, left };
}
