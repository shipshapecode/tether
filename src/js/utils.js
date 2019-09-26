import { extend } from './utils/general';

let TetherBase;
if (typeof TetherBase === 'undefined') {
  TetherBase = { modules: [] };
}

function getScrollParents(el) {
  // In firefox if the el is inside an iframe with display: none; window.getComputedStyle() will return null;
  // https://bugzilla.mozilla.org/show_bug.cgi?id=548397
  const computedStyle = getComputedStyle(el) || {};
  const { position } = computedStyle;
  let parents = [];

  if (position === 'fixed') {
    return [el];
  }

  let parent = el;
  while ((parent = parent.parentNode) && parent && parent.nodeType === 1) {
    let style;
    try {
      style = getComputedStyle(parent);
    } catch(err) {
      // Intentionally blank
    }

    if (typeof style === 'undefined' || style === null) {
      parents.push(parent);
      return parents;
    }

    const { overflow, overflowX, overflowY } = style;
    if (/(auto|scroll|overlay)/.test(overflow + overflowY + overflowX)) {
      if (position !== 'absolute' || ['relative', 'absolute', 'fixed'].indexOf(style.position) >= 0) {
        parents.push(parent);
      }
    }
  }

  parents.push(el.ownerDocument.body);

  // If the node is within a frame, account for the parent window scroll
  if (el.ownerDocument !== document) {
    parents.push(el.ownerDocument.defaultView);
  }

  return parents;
}

function getOffsetParent(el) {
  return el.offsetParent || document.documentElement;
}

let _scrollBarSize = null;

function getScrollBarSize() {
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

TetherBase.Utils = {
  getScrollParents,
  getOffsetParent,
  getScrollBarSize
};

export default TetherBase;
