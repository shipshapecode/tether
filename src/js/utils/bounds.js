import { defer } from './deferred';
import { extend, uniqueId } from './general';
import { isUndefined } from './type-check';

const zeroPosCache = {};
let zeroElement = null;

export function getBounds(body, el) {
  let doc;
  if (el === document) {
    doc = document;
    el = document.documentElement;
  } else {
    doc = el.ownerDocument;
  }

  const docEl = doc.documentElement;

  const box = _getActualBoundingClientRect(el);

  const origin = _getOrigin(body);

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

/**
 * Gets bounds for when target modifiier is 'scroll-handle'
 * @param target
 * @return {{left: number, width: number, height: number}}
 */
export function getScrollHandleBounds(body, target) {
  let bounds;
  // We have to do the check for the scrollTop and if target === document.body here and set to variables
  // because we may reset target below.
  const targetScrollTop = target.scrollTop;
  const targetIsBody = target === document.body;

  if (targetIsBody) {
    target = document.documentElement;

    bounds = {
      left: pageXOffset,
      top: pageYOffset,
      height: innerHeight,
      width: innerWidth
    };
  } else {
    bounds = getBounds(body, target);
  }

  const style = getComputedStyle(target);

  const hasBottomScroll = (
    target.scrollWidth > target.clientWidth ||
    [style.overflow, style.overflowX].indexOf('scroll') >= 0 ||
    !targetIsBody
  );

  let scrollBottom = 0;
  if (hasBottomScroll) {
    scrollBottom = 15;
  }

  const height = bounds.height - parseFloat(style.borderTopWidth) - parseFloat(style.borderBottomWidth) - scrollBottom;

  const out = {
    width: 15,
    height: height * 0.975 * (height / target.scrollHeight),
    left: bounds.left + bounds.width - parseFloat(style.borderLeftWidth) - 15
  };

  let fitAdj = 0;
  if (height < 408 && targetIsBody) {
    fitAdj = -0.00011 * Math.pow(height, 2) - 0.00727 * height + 22.58;
  }

  if (!targetIsBody) {
    out.height = Math.max(out.height, 24);
  }

  const scrollPercentage = targetScrollTop / (target.scrollHeight - height);
  out.top = scrollPercentage * (height - out.height - fitAdj) + bounds.top + parseFloat(style.borderTopWidth);

  if (targetIsBody) {
    out.height = Math.max(out.height, 24);
  }

  return out;
}

/**
 * Gets bounds for when target modifiier is 'visible
 * @param target
 * @return {{top: *, left: *, width: *, height: *}}
 */
export function getVisibleBounds(body, target) {
  if (target === document.body) {
    return { top: pageYOffset, left: pageXOffset, height: innerHeight, width: innerWidth };
  } else {
    const bounds = getBounds(body, target);

    const out = {
      height: bounds.height,
      width: bounds.width,
      top: bounds.top,
      left: bounds.left
    };

    out.height = Math.min(out.height, bounds.height - (pageYOffset - bounds.top));
    out.height = Math.min(out.height, bounds.height - ((bounds.top + bounds.height) - (pageYOffset + innerHeight)));
    out.height = Math.min(innerHeight, out.height);
    out.height -= 2;

    out.width = Math.min(out.width, bounds.width - (pageXOffset - bounds.left));
    out.width = Math.min(out.width, bounds.width - ((bounds.left + bounds.width) - (pageXOffset + innerWidth)));
    out.width = Math.min(innerWidth, out.width);
    out.width -= 2;

    if (out.top < pageYOffset) {
      out.top = pageYOffset;
    }
    if (out.left < pageXOffset) {
      out.left = pageXOffset;
    }

    return out;
  }
}

export function removeUtilElements(body) {
  if (zeroElement) {
    body.removeChild(zeroElement);
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

function _getOrigin(body) {
  // getBoundingClientRect is unfortunately too accurate.  It introduces a pixel or two of
  // jitter as the user scrolls that messes with our ability to detect if two positions
  // are equivilant or not.  We place an element at the top left of the page that will
  // get the same jitter, so we can cancel the two out.
  let node = zeroElement;
  if (!node || !body.contains(node)) {
    node = document.createElement('div');
    node.setAttribute('data-tether-id', uniqueId());
    extend(node.style, {
      top: 0,
      left: 0,
      position: 'absolute'
    });

    body.appendChild(node);

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
