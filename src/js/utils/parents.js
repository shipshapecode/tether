import { isUndefined } from './type-check';

export function getScrollParents(el) {
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

    if (isUndefined(style) || style === null) {
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

export function getOffsetParent(el) {
  return el.offsetParent || document.documentElement;
}
