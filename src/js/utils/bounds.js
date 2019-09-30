import { defer } from './deferred';
import { extend, uniqueId } from './general';
import { isUndefined } from './type-check';

const zeroPosCache = {};
let zeroElement = null;

export function getBounds(el) {
  let doc;
  if (el === document) {
    doc = document;
    el = document.documentElement;
  } else {
    doc = el.ownerDocument;
  }

  const docEl = doc.documentElement;

  const box = _getActualBoundingClientRect(el);

  const origin = _getOrigin();

  box.top -= origin.top;
  box.left -= origin.left;

  if (isUndefined(box.width)) {
    box.width = document.body.scrollWidth - box.left - box.right;
  }
  if (isUndefined(box.height)) {
    box.height = document.body.scrollHeight - box.top - box.bottom;
  }

  box.top = box.top - docEl.clientTop;
  box.left = box.left - docEl.clientLeft;
  box.right = doc.body.clientWidth - box.width - box.left;
  box.bottom = doc.body.clientHeight - box.height - box.top;

  return box;
}

export function removeUtilElements() {
  if (zeroElement) {
    document.body.removeChild(zeroElement);
  }
  zeroElement = null;
}

/**
 * Same as native getBoundingClientRect, except it takes into account parent <frame> offsets
 * if the element lies within a nested document (<frame> or <iframe>-like).
 * @param node
 */
function _getActualBoundingClientRect(node) {
  let boundingRect = node.getBoundingClientRect();

  // The original object returned by getBoundingClientRect is immutable, so we clone it
  // We can't use extend because the properties are not considered part of the object by hasOwnProperty in IE9
  let rect = {};
  for (let k in boundingRect) {
    rect[k] = boundingRect[k];
  }

  try {
    if (node.ownerDocument !== document) {
      let { frameElement } = node.ownerDocument.defaultView;
      if (frameElement) {
        let frameRect = _getActualBoundingClientRect(frameElement);
        rect.top += frameRect.top;
        rect.bottom += frameRect.top;
        rect.left += frameRect.left;
        rect.right += frameRect.left;
      }
    }
  } catch(err) {
    // Ignore "Access is denied" in IE11/Edge
  }

  return rect;
}

function _getOrigin() {
  // getBoundingClientRect is unfortunately too accurate.  It introduces a pixel or two of
  // jitter as the user scrolls that messes with our ability to detect if two positions
  // are equivilant or not.  We place an element at the top left of the page that will
  // get the same jitter, so we can cancel the two out.
  let node = zeroElement;
  if (!node || !document.body.contains(node)) {
    node = document.createElement('div');
    node.setAttribute('data-tether-id', uniqueId());
    extend(node.style, {
      top: 0,
      left: 0,
      position: 'absolute'
    });

    document.body.appendChild(node);

    zeroElement = node;
  }

  const id = node.getAttribute('data-tether-id');
  if (isUndefined(zeroPosCache[id])) {
    zeroPosCache[id] = _getActualBoundingClientRect(node);

    // Clear the cache when this position call is done
    defer(() => {
      delete zeroPosCache[id];
    });
  }

  return zeroPosCache[id];
}
