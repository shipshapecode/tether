let _scrollBarSize = null;

export function extend(out = {}) {
  const args = [];

  Array.prototype.push.apply(args, arguments);

  args.slice(1).forEach((obj) => {
    if (obj) {
      for (let key in obj) {
        if ({}.hasOwnProperty.call(obj, key)) {
          out[key] = obj[key];
        }
      }
    }
  });

  return out;
}

export function getScrollBarSize() {
  if (_scrollBarSize) {
    return _scrollBarSize;
  }
  const inner = document.createElement('div');
  inner.style.width = '100%';
  inner.style.height = '200px';

  const outer = document.createElement('div');
  extend(outer.style, {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
    visibility: 'hidden',
    width: '200px',
    height: '150px',
    overflow: 'hidden'
  });

  outer.appendChild(inner);

  document.body.appendChild(outer);

  const widthContained = inner.offsetWidth;
  outer.style.overflow = 'scroll';
  let widthScroll = inner.offsetWidth;

  if (widthContained === widthScroll) {
    widthScroll = outer.clientWidth;
  }

  document.body.removeChild(outer);

  const width = widthContained - widthScroll;

  _scrollBarSize = { width, height: width };
  return _scrollBarSize;
}

export const uniqueId = (() => {
  let id = 0;
  return () => ++id;
})();
