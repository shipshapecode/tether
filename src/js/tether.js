import '../css/tether.scss';
import '../css/tether-theme-arrows.scss';
import '../css/tether-theme-arrows-dark.scss';
import '../css/tether-theme-basic.scss';
import Abutment from './abutment';
import Constraint from './constraint';
import Shift from './shift';
import { Evented } from './evented';
import { addClass, getClass, removeClass, updateClasses } from './utils/classes';
import { defer, flush } from './utils/deferred';
import { extend, getScrollBarSize } from './utils/general';
import { addOffset, attachmentToOffset, autoToFixedAttachment, offsetToPx, parseTopLeft } from './utils/offset';
import { getBounds, getScrollHandleBounds, getVisibleBounds, removeUtilElements } from './utils/bounds';
import { getOffsetParent, getScrollParents } from './utils/parents';
import { isNumber, isObject, isString, isUndefined } from './utils/type-check';

const TetherBase = { modules: [Constraint, Abutment, Shift] };

function isFullscreenElement(e) {
  let d = e.ownerDocument;
  let fe = d.fullscreenElement || d.webkitFullscreenElement || d.mozFullScreenElement || d.msFullscreenElement;
  return fe === e;
}

function within(a, b, diff = 1) {
  return (a + diff >= b && b >= a - diff);
}

const transformKey = (() => {
  if (isUndefined(document)) {
    return '';
  }
  const el = document.createElement('div');

  const transforms = ['transform', 'WebkitTransform', 'OTransform', 'MozTransform', 'msTransform'];
  for (let i = 0; i < transforms.length; ++i) {
    const key = transforms[i];
    if (el.style[key] !== undefined) {
      return key;
    }
  }
})();

const tethers = [];

const position = () => {
  tethers.forEach((tether) => {
    tether.position(false);
  });
  flush();
};

function now() {
  return performance.now();
}

(() => {
  let lastCall = null;
  let lastDuration = null;
  let pendingTimeout = null;

  const tick = () => {
    if (!isUndefined(lastDuration) && lastDuration > 16) {
      // We voluntarily throttle ourselves if we can't manage 60fps
      lastDuration = Math.min(lastDuration - 16, 250);

      // Just in case this is the last event, remember to position just once more
      pendingTimeout = setTimeout(tick, 250);
      return;
    }

    if (!isUndefined(lastCall) && (now() - lastCall) < 10) {
      // Some browsers call events a little too frequently, refuse to run more than is reasonable
      return;
    }

    if (pendingTimeout != null) {
      clearTimeout(pendingTimeout);
      pendingTimeout = null;
    }

    lastCall = now();
    position();
    lastDuration = now() - lastCall;
  };

  if (!isUndefined(window) && !isUndefined(window.addEventListener)) {
    ['resize', 'scroll', 'touchmove'].forEach((event) => {
      window.addEventListener(event, tick);
    });
  }
})();

class TetherClass extends Evented {
  constructor(options) {
    super();
    this.position = this.position.bind(this);

    tethers.push(this);

    this.history = [];

    this.setOptions(options, false);

    TetherBase.modules.forEach((module) => {
      if (!isUndefined(module.initialize)) {
        module.initialize.call(this);
      }
    });

    this.position();
  }

  setOptions(options, pos = true) {
    const defaults = {
      offset: '0 0',
      targetOffset: '0 0',
      targetAttachment: 'auto auto',
      classPrefix: 'tether',
      bodyElement: document.body
    };

    this.options = extend(defaults, options);

    let { element, target, targetModifier, bodyElement } = this.options;
    this.element = element;
    this.target = target;
    this.targetModifier = targetModifier;

    if (typeof bodyElement === 'string') {
      bodyElement = document.querySelector(bodyElement);
    }
    this.bodyElement = bodyElement;

    if (this.target === 'viewport') {
      this.target = document.body;
      this.targetModifier = 'visible';
    } else if (this.target === 'scroll-handle') {
      this.target = document.body;
      this.targetModifier = 'scroll-handle';
    }

    ['element', 'target'].forEach((key) => {
      if (isUndefined(this[key])) {
        throw new Error('Tether Error: Both element and target must be defined');
      }

      if (!isUndefined(this[key].jquery)) {
        this[key] = this[key][0];
      } else if (isString(this[key])) {
        this[key] = document.querySelector(this[key]);
      }
    });

    this._addClasses();

    if (!this.options.attachment) {
      throw new Error('Tether Error: You must provide an attachment');
    }

    this.targetAttachment = parseTopLeft(this.options.targetAttachment);
    this.attachment = parseTopLeft(this.options.attachment);
    this.offset = parseTopLeft(this.options.offset);
    this.targetOffset = parseTopLeft(this.options.targetOffset);

    if (!isUndefined(this.scrollParents)) {
      this.disable();
    }

    if (this.targetModifier === 'scroll-handle') {
      this.scrollParents = [this.target];
    } else {
      this.scrollParents = getScrollParents(this.target);
    }

    if (!(this.options.enabled === false)) {
      this.enable(pos);
    }
  }

  getTargetBounds() {
    if (!isUndefined(this.targetModifier)) {
      if (this.targetModifier === 'visible') {
        return getVisibleBounds(this.bodyElement, this.target);
      } else if (this.targetModifier === 'scroll-handle') {
        return getScrollHandleBounds(this.bodyElement, this.target);
      }
    } else {
      return getBounds(this.bodyElement, this.target);
    }
  }

  clearCache() {
    this._cache = {};
  }

  cache(k, getter) {
    // More than one module will often need the same DOM info, so
    // we keep a cache which is cleared on each position call
    if (isUndefined(this._cache)) {
      this._cache = {};
    }

    if (isUndefined(this._cache[k])) {
      this._cache[k] = getter.call(this);
    }

    return this._cache[k];
  }

  enable(pos = true) {
    const { classes, classPrefix } = this.options;
    if (!(this.options.addTargetClasses === false)) {
      addClass(this.target, getClass('enabled', classes, classPrefix));
    }
    addClass(this.element, getClass('enabled', classes, classPrefix));
    this.enabled = true;

    this.scrollParents.forEach((parent) => {
      if (parent !== this.target.ownerDocument) {
        parent.addEventListener('scroll', this.position);
      }
    });

    if (pos) {
      this.position();
    }
  }

  disable() {
    const { classes, classPrefix } = this.options;
    removeClass(this.target, getClass('enabled', classes, classPrefix));
    removeClass(this.element, getClass('enabled', classes, classPrefix));
    this.enabled = false;

    if (!isUndefined(this.scrollParents)) {
      this.scrollParents.forEach((parent) => {
        parent.removeEventListener('scroll', this.position);
      });
    }
  }

  destroy() {
    this.disable();

    this._removeClasses();

    tethers.forEach((tether, i) => {
      if (tether === this) {
        tethers.splice(i, 1);
      }
    });

    // Remove any elements we were using for convenience from the DOM
    if (tethers.length === 0) {
      removeUtilElements(this.bodyElement);
    }
  }

  updateAttachClasses(elementAttach, targetAttach) {
    elementAttach = elementAttach || this.attachment;
    targetAttach = targetAttach || this.targetAttachment;
    const sides = ['left', 'top', 'bottom', 'right', 'middle', 'center'];
    const { classes, classPrefix } = this.options;

    if (!isUndefined(this._addAttachClasses) && this._addAttachClasses.length) {
      // updateAttachClasses can be called more than once in a position call, so
      // we need to clean up after ourselves such that when the last defer gets
      // ran it doesn't add any extra classes from previous calls.
      this._addAttachClasses.splice(0, this._addAttachClasses.length);
    }

    if (isUndefined(this._addAttachClasses)) {
      this._addAttachClasses = [];
    }
    this.add = this._addAttachClasses;

    if (elementAttach.top) {
      this.add.push(`${getClass('element-attached', classes, classPrefix)}-${elementAttach.top}`);
    }
    if (elementAttach.left) {
      this.add.push(`${getClass('element-attached', classes, classPrefix)}-${elementAttach.left}`);
    }
    if (targetAttach.top) {
      this.add.push(`${getClass('target-attached', classes, classPrefix)}-${targetAttach.top}`);
    }
    if (targetAttach.left) {
      this.add.push(`${getClass('target-attached', classes, classPrefix)}-${targetAttach.left}`);
    }

    this.all = [];
    sides.forEach((side) => {
      this.all.push(`${getClass('element-attached', classes, classPrefix)}-${side}`);
      this.all.push(`${getClass('target-attached', classes, classPrefix)}-${side}`);
    });

    defer(() => {
      if (isUndefined(this._addAttachClasses)) {
        return;
      }

      updateClasses(this.element, this._addAttachClasses, this.all);
      if (!(this.options.addTargetClasses === false)) {
        updateClasses(this.target, this._addAttachClasses, this.all);
      }

      delete this._addAttachClasses;
    });
  }

  position(flushChanges = true) {
    // flushChanges commits the changes immediately, leave true unless you are positioning multiple
    // tethers (in which case call Tether.Utils.flush yourself when you're done)

    if (!this.enabled) {
      return;
    }

    this.clearCache();

    // Turn 'auto' attachments into the appropriate corner or edge
    const targetAttachment = autoToFixedAttachment(this.targetAttachment, this.attachment);

    this.updateAttachClasses(this.attachment, targetAttachment);

    const elementPos = this.cache('element-bounds', () => {
      return getBounds(this.bodyElement, this.element);
    });

    let { width, height } = elementPos;

    if (width === 0 && height === 0 && !isUndefined(this.lastSize)) {
      // We cache the height and width to make it possible to position elements that are
      // getting hidden.
      ({ width, height } = this.lastSize);
    } else {
      this.lastSize = { width, height };
    }

    const targetPos = this.cache('target-bounds', () => {
      return this.getTargetBounds();
    });
    const targetSize = targetPos;

    // Get an actual px offset from the attachment
    let offset = offsetToPx(attachmentToOffset(this.attachment), { width, height });
    let targetOffset = offsetToPx(attachmentToOffset(targetAttachment), targetSize);

    const manualOffset = offsetToPx(this.offset, { width, height });
    const manualTargetOffset = offsetToPx(this.targetOffset, targetSize);

    // Add the manually provided offset
    offset = addOffset(offset, manualOffset);
    targetOffset = addOffset(targetOffset, manualTargetOffset);

    // It's now our goal to make (element position + offset) == (target position + target offset)
    let left = targetPos.left + targetOffset.left - offset.left;
    let top = targetPos.top + targetOffset.top - offset.top;

    for (let i = 0; i < TetherBase.modules.length; ++i) {
      const module = TetherBase.modules[i];
      const ret = module.position.call(this, {
        left,
        top,
        targetAttachment,
        targetPos,
        elementPos,
        offset,
        targetOffset,
        manualOffset,
        manualTargetOffset,
        scrollbarSize,
        attachment: this.attachment
      });

      if (ret === false) {
        return false;
      } else if (isUndefined(ret) || !isObject(ret)) {
        continue;
      } else {
        ({ top, left } = ret);
      }
    }

    // We describe the position three different ways to give the optimizer
    // a chance to decide the best possible way to position the element
    // with the fewest repaints.
    const next = {
      // It's position relative to the page (absolute positioning when
      // the element is a child of the body)
      page: {
        top,
        left
      },

      // It's position relative to the viewport (fixed positioning)
      viewport: {
        top: top - pageYOffset,
        bottom: pageYOffset - top - height + innerHeight,
        left: left - pageXOffset,
        right: pageXOffset - left - width + innerWidth
      }
    };

    let doc = this.target.ownerDocument;
    let win = doc.defaultView;

    let scrollbarSize;
    if (win.innerHeight > doc.documentElement.clientHeight) {
      scrollbarSize = this.cache('scrollbar-size', getScrollBarSize);
      next.viewport.bottom -= scrollbarSize.height;
    }

    if (win.innerWidth > doc.documentElement.clientWidth) {
      scrollbarSize = this.cache('scrollbar-size', getScrollBarSize);
      next.viewport.right -= scrollbarSize.width;
    }

    if (['', 'static'].indexOf(doc.body.style.position) === -1 ||
      ['', 'static'].indexOf(doc.body.parentElement.style.position) === -1) {
      // Absolute positioning in the body will be relative to the page, not the 'initial containing block'
      next.page.bottom = doc.body.scrollHeight - top - height;
      next.page.right = doc.body.scrollWidth - left - width;
    }

    if (!isUndefined(this.options.optimizations) &&
      this.options.optimizations.moveElement !== false &&
      isUndefined(this.targetModifier)) {
      const offsetParent = this.cache('target-offsetparent', () => getOffsetParent(this.target));
      const offsetPosition = this.cache('target-offsetparent-bounds', () => getBounds(this.bodyElement, offsetParent));
      const offsetParentStyle = getComputedStyle(offsetParent);
      const offsetParentSize = offsetPosition;

      const offsetBorder = {};
      ['Top', 'Left', 'Bottom', 'Right'].forEach((side) => {
        offsetBorder[side.toLowerCase()] = parseFloat(offsetParentStyle[`border${side}Width`]);
      });

      offsetPosition.right = doc.body.scrollWidth - offsetPosition.left - offsetParentSize.width + offsetBorder.right;
      offsetPosition.bottom = doc.body.scrollHeight - offsetPosition.top - offsetParentSize.height + offsetBorder.bottom;

      if (next.page.top >= (offsetPosition.top + offsetBorder.top) && next.page.bottom >= offsetPosition.bottom) {
        if (next.page.left >= (offsetPosition.left + offsetBorder.left) && next.page.right >= offsetPosition.right) {
          // We're within the visible part of the target's scroll parent
          const { scrollLeft, scrollTop } = offsetParent;

          // It's position relative to the target's offset parent (absolute positioning when
          // the element is moved to be a child of the target's offset parent).
          next.offset = {
            top: next.page.top - offsetPosition.top + scrollTop - offsetBorder.top,
            left: next.page.left - offsetPosition.left + scrollLeft - offsetBorder.left
          };
        }
      }
    }

    // We could also travel up the DOM and try each containing context, rather than only
    // looking at the body, but we're gonna get diminishing returns.

    this.move(next);

    this.history.unshift(next);

    if (this.history.length > 3) {
      this.history.pop();
    }

    if (flushChanges) {
      flush();
    }

    return true;
  }

  // THE ISSUE
  move(pos) {
    if (isUndefined(this.element.parentNode)) {
      return;
    }

    const same = {};

    for (let type in pos) {
      same[type] = {};

      for (let key in pos[type]) {
        let found = false;

        for (let i = 0; i < this.history.length; ++i) {
          const point = this.history[i];
          if (!isUndefined(point[type]) &&
            !within(point[type][key], pos[type][key])) {
            found = true;
            break;
          }

        }

        if (!found) {
          same[type][key] = true;
        }
      }
    }

    let css = { top: '', left: '', right: '', bottom: '' };

    const transcribe = (_same, _pos) => {
      const hasOptimizations = !isUndefined(this.options.optimizations);
      const gpu = hasOptimizations ? this.options.optimizations.gpu : null;
      if (gpu !== false) {
        let yPos, xPos;
        if (_same.top) {
          css.top = 0;
          yPos = _pos.top;
        } else {
          css.bottom = 0;
          yPos = -_pos.bottom;
        }

        if (_same.left) {
          css.left = 0;
          xPos = _pos.left;
        } else {
          css.right = 0;
          xPos = -_pos.right;
        }

        if (isNumber(window.devicePixelRatio) && devicePixelRatio % 1 === 0) {
          xPos = Math.round(xPos * devicePixelRatio) / devicePixelRatio;
          yPos = Math.round(yPos * devicePixelRatio) / devicePixelRatio;
        }

        css[transformKey] = `translateX(${xPos}px) translateY(${yPos}px)`;

        if (transformKey !== 'msTransform') {
          // The Z transform will keep this in the GPU (faster, and prevents artifacts),
          // but IE9 doesn't support 3d transforms and will choke.
          css[transformKey] += ' translateZ(0)';
        }

      } else {
        if (_same.top) {
          css.top = `${_pos.top}px`;
        } else {
          css.bottom = `${_pos.bottom}px`;
        }

        if (_same.left) {
          css.left = `${_pos.left}px`;
        } else {
          css.right = `${_pos.right}px`;
        }
      }
    };

    const hasOptimizations = !isUndefined(this.options.optimizations);
    let allowPositionFixed = true;

    if (hasOptimizations && this.options.optimizations.allowPositionFixed === false) {
      allowPositionFixed = false;
    }

    let moved = false;
    if ((same.page.top || same.page.bottom) && (same.page.left || same.page.right)) {
      css.position = 'absolute';
      transcribe(same.page, pos.page);

    } else if (allowPositionFixed && (same.viewport.top || same.viewport.bottom) && (same.viewport.left || same.viewport.right)) {
      css.position = 'fixed';
      transcribe(same.viewport, pos.viewport);
    } else if (!isUndefined(same.offset) && same.offset.top && same.offset.left) {
      css.position = 'absolute';
      const offsetParent = this.cache('target-offsetparent', () => getOffsetParent(this.target));

      if (getOffsetParent(this.element) !== offsetParent) {
        defer(() => {
          this.element.parentNode.removeChild(this.element);
          offsetParent.appendChild(this.element);
        });
      }

      transcribe(same.offset, pos.offset);
      moved = true;

    } else {
      css.position = 'absolute';
      transcribe({ top: true, left: true }, pos.page);
    }

    if (!moved) {
      if (this.options.bodyElement) {
        if (this.element.parentNode !== this.options.bodyElement) {
          this.options.bodyElement.appendChild(this.element);
        }
      } else {
        let offsetParentIsBody = true;

        let currentNode = this.element.parentNode;
        while (currentNode && currentNode.nodeType === 1 && currentNode.tagName !== 'BODY' && !isFullscreenElement(currentNode)) {
          if (getComputedStyle(currentNode).position !== 'static') {
            offsetParentIsBody = false;
            break;
          }

          currentNode = currentNode.parentNode;
        }

        if (!offsetParentIsBody) {
          this.element.parentNode.removeChild(this.element);
          this.element.ownerDocument.body.appendChild(this.element);
        }
      }
    }

    // Any css change will trigger a repaint, so let's avoid one if nothing changed
    const writeCSS = {};
    let write = false;
    for (let key in css) {
      let val = css[key];
      let elVal = this.element.style[key];

      if (elVal !== val) {
        write = true;
        writeCSS[key] = val;
      }
    }

    if (write) {
      defer(() => {
        extend(this.element.style, writeCSS);
        this.trigger('repositioned');
      });
    }
  }

  _addClasses() {
    const { classes, classPrefix } = this.options;
    addClass(this.element, getClass('element', classes, classPrefix));
    if (!(this.options.addTargetClasses === false)) {
      addClass(this.target, getClass('target', classes, classPrefix));
    }
  }

  _removeClasses() {
    const { classes, classPrefix } = this.options;
    removeClass(this.element, getClass('element', classes, classPrefix));
    if (!(this.options.addTargetClasses === false)) {
      removeClass(this.target, getClass('target', classes, classPrefix));
    }

    this.all.forEach((className) => {
      this.element.classList.remove(className);
      this.target.classList.remove(className);
    });
  }
}

TetherClass.modules = [];

TetherBase.position = position;

let Tether = extend(TetherClass, TetherBase);

Tether.modules.push({
  initialize() {
    const { classes, classPrefix } = this.options;
    this.markers = {};

    ['target', 'element'].forEach((type) => {
      const el = document.createElement('div');
      el.className = getClass(`${type}-marker`, classes, classPrefix);

      const dot = document.createElement('div');
      dot.className = getClass('marker-dot', classes, classPrefix);
      el.appendChild(dot);

      this[type].appendChild(el);

      this.markers[type] = { dot, el };
    });
  },

  position({ manualOffset, manualTargetOffset }) {
    const offsets = {
      element: manualOffset,
      target: manualTargetOffset
    };

    for (let type in offsets) {
      const offset = offsets[type];
      for (let side in offset) {
        let val = offset[side];
        if (!isString(val) ||
          val.indexOf('%') === -1 &&
          val.indexOf('px') === -1) {
          val += 'px';
        }

        if (this.markers[type].dot.style[side] !== val) {
          this.markers[type].dot.style[side] = val;
        }
      }
    }

    return true;
  }
});

export default Tether;
