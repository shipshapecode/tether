
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require, exports, module);
  } else {
    root.Tether = factory();
  }
}(this, function(require, exports, module) {

var Evented, TetherBase, addClass, defer, deferred, extend, flush, getBounds, getClassName, getOffsetParent, getOrigin, getScrollBarSize, getScrollParent, hasClass, node, removeClass, setClassName, uniqueId, updateClasses, zeroPosCache,
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  slice = [].slice;

if (typeof TetherBase === 'undefined') {
  TetherBase = {
    modules: []
  };
}

getScrollParent = function(el) {
  var parent, position, ref, scrollParent, style;
  position = getComputedStyle(el).position;
  if (position === 'fixed') {
    return el;
  }
  scrollParent = void 0;
  parent = el;
  while (parent = parent.parentNode) {
    try {
      style = getComputedStyle(parent);
    } catch (_error) {}
    if (style == null) {
      return parent;
    }
    if (/(auto|scroll)/.test(style['overflow'] + style['overflowY'] + style['overflowX'])) {
      if (position !== 'absolute' || ((ref = style['position']) === 'relative' || ref === 'absolute' || ref === 'fixed')) {
        return parent;
      }
    }
  }
  return document.body;
};

uniqueId = (function() {
  var id;
  id = 0;
  return function() {
    return id++;
  };
})();

zeroPosCache = {};

getOrigin = function(doc) {
  var id, k, node, ref, v;
  node = doc._tetherZeroElement;
  if (node == null) {
    node = doc.createElement('div');
    node.setAttribute('data-tether-id', uniqueId());
    extend(node.style, {
      top: 0,
      left: 0,
      position: 'absolute'
    });
    doc.body.appendChild(node);
    doc._tetherZeroElement = node;
  }
  id = node.getAttribute('data-tether-id');
  if (zeroPosCache[id] == null) {
    zeroPosCache[id] = {};
    ref = node.getBoundingClientRect();
    for (k in ref) {
      v = ref[k];
      zeroPosCache[id][k] = v;
    }
    defer(function() {
      return zeroPosCache[id] = void 0;
    });
  }
  return zeroPosCache[id];
};

node = null;

getBounds = function(el) {
  var box, doc, docEl, k, origin, ref, v;
  if (el === document) {
    doc = document;
    el = document.documentElement;
  } else {
    doc = el.ownerDocument;
  }
  docEl = doc.documentElement;
  box = {};
  ref = el.getBoundingClientRect();
  for (k in ref) {
    v = ref[k];
    box[k] = v;
  }
  origin = getOrigin(doc);
  box.top -= origin.top;
  box.left -= origin.left;
  if (box.width == null) {
    box.width = document.body.scrollWidth - box.left - box.right;
  }
  if (box.height == null) {
    box.height = document.body.scrollHeight - box.top - box.bottom;
  }
  box.top = box.top - docEl.clientTop;
  box.left = box.left - docEl.clientLeft;
  box.right = doc.body.clientWidth - box.width - box.left;
  box.bottom = doc.body.clientHeight - box.height - box.top;
  return box;
};

getOffsetParent = function(el) {
  return el.offsetParent || document.documentElement;
};

getScrollBarSize = function() {
  var inner, outer, width, widthContained, widthScroll;
  inner = document.createElement('div');
  inner.style.width = '100%';
  inner.style.height = '200px';
  outer = document.createElement('div');
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
  widthContained = inner.offsetWidth;
  outer.style.overflow = 'scroll';
  widthScroll = inner.offsetWidth;
  if (widthContained === widthScroll) {
    widthScroll = outer.clientWidth;
  }
  document.body.removeChild(outer);
  width = widthContained - widthScroll;
  return {
    width: width,
    height: width
  };
};

extend = function(out) {
  var args, j, key, len, obj, ref, val;
  if (out == null) {
    out = {};
  }
  args = [];
  Array.prototype.push.apply(args, arguments);
  ref = args.slice(1);
  for (j = 0, len = ref.length; j < len; j++) {
    obj = ref[j];
    if (obj) {
      for (key in obj) {
        if (!hasProp.call(obj, key)) continue;
        val = obj[key];
        out[key] = val;
      }
    }
  }
  return out;
};

removeClass = function(el, name) {
  var className, cls, j, len, ref, results;
  if (el.classList != null) {
    ref = name.split(' ');
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      cls = ref[j];
      if (cls.trim()) {
        results.push(el.classList.remove(cls));
      }
    }
    return results;
  } else {
    className = getClassName(el).replace(new RegExp("(^| )" + (name.split(' ').join('|')) + "( |$)", 'gi'), ' ');
    return setClassName(el, className);
  }
};

addClass = function(el, name) {
  var cls, j, len, ref, results;
  if (el.classList != null) {
    ref = name.split(' ');
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      cls = ref[j];
      if (cls.trim()) {
        results.push(el.classList.add(cls));
      }
    }
    return results;
  } else {
    removeClass(el, name);
    cls = getClassName(el) + (" " + name);
    return setClassName(el, cls);
  }
};

hasClass = function(el, name) {
  if (el.classList != null) {
    return el.classList.contains(name);
  } else {
    return new RegExp("(^| )" + name + "( |$)", 'gi').test(getClassName(el));
  }
};

getClassName = function(el) {
  if (el.className instanceof SVGAnimatedString) {
    return el.className.baseVal;
  } else {
    return el.className;
  }
};

setClassName = function(el, className) {
  return el.setAttribute('class', className);
};

updateClasses = function(el, add, all) {
  var cls, j, l, len, len1, results;
  for (j = 0, len = all.length; j < len; j++) {
    cls = all[j];
    if (indexOf.call(add, cls) < 0) {
      if (hasClass(el, cls)) {
        removeClass(el, cls);
      }
    }
  }
  results = [];
  for (l = 0, len1 = add.length; l < len1; l++) {
    cls = add[l];
    if (!hasClass(el, cls)) {
      results.push(addClass(el, cls));
    } else {
      results.push(void 0);
    }
  }
  return results;
};

deferred = [];

defer = function(fn) {
  return deferred.push(fn);
};

flush = function() {
  var fn, results;
  results = [];
  while (fn = deferred.pop()) {
    results.push(fn());
  }
  return results;
};

Evented = (function() {
  function Evented() {}

  Evented.prototype.on = function(event, handler, ctx, once) {
    var base;
    if (once == null) {
      once = false;
    }
    if (this.bindings == null) {
      this.bindings = {};
    }
    if ((base = this.bindings)[event] == null) {
      base[event] = [];
    }
    return this.bindings[event].push({
      handler: handler,
      ctx: ctx,
      once: once
    });
  };

  Evented.prototype.once = function(event, handler, ctx) {
    return this.on(event, handler, ctx, true);
  };

  Evented.prototype.off = function(event, handler) {
    var i, ref, results;
    if (((ref = this.bindings) != null ? ref[event] : void 0) == null) {
      return;
    }
    if (handler == null) {
      return delete this.bindings[event];
    } else {
      i = 0;
      results = [];
      while (i < this.bindings[event].length) {
        if (this.bindings[event][i].handler === handler) {
          results.push(this.bindings[event].splice(i, 1));
        } else {
          results.push(i++);
        }
      }
      return results;
    }
  };

  Evented.prototype.trigger = function() {
    var args, ctx, event, handler, i, once, ref, ref1, results;
    event = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    if ((ref = this.bindings) != null ? ref[event] : void 0) {
      i = 0;
      results = [];
      while (i < this.bindings[event].length) {
        ref1 = this.bindings[event][i], handler = ref1.handler, ctx = ref1.ctx, once = ref1.once;
        handler.apply(ctx != null ? ctx : this, args);
        if (once) {
          results.push(this.bindings[event].splice(i, 1));
        } else {
          results.push(i++);
        }
      }
      return results;
    }
  };

  return Evented;

})();

TetherBase.Utils = {
  getScrollParent: getScrollParent,
  getBounds: getBounds,
  getOffsetParent: getOffsetParent,
  extend: extend,
  addClass: addClass,
  removeClass: removeClass,
  hasClass: hasClass,
  updateClasses: updateClasses,
  defer: defer,
  flush: flush,
  uniqueId: uniqueId,
  Evented: Evented,
  getScrollBarSize: getScrollBarSize
};

var MIRROR_LR, MIRROR_TB, OFFSET_MAP, Tether, TetherClass, addClass, addOffset, attachmentToOffset, autoToFixedAttachment, defer, extend, flush, getBounds, getOffsetParent, getOuterSize, getScrollBarSize, getScrollParent, getSize, now, offsetToPx, parseAttachment, parseOffset, position, ref, removeClass, tethers, transformKey, updateClasses, within,
  slice = [].slice,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

if (typeof TetherBase === "undefined" || TetherBase === null) {
  throw new Error("You must include the utils.js file before tether.js");
}

ref = TetherBase.Utils, getScrollParent = ref.getScrollParent, getSize = ref.getSize, getOuterSize = ref.getOuterSize, getBounds = ref.getBounds, getOffsetParent = ref.getOffsetParent, extend = ref.extend, addClass = ref.addClass, removeClass = ref.removeClass, updateClasses = ref.updateClasses, defer = ref.defer, flush = ref.flush, getScrollBarSize = ref.getScrollBarSize;

within = function(a, b, diff) {
  if (diff == null) {
    diff = 1;
  }
  return (a + diff >= b && b >= a - diff);
};

transformKey = (function() {
  var el, j, key, len, ref1;
  el = document.createElement('div');
  ref1 = ['transform', 'webkitTransform', 'OTransform', 'MozTransform', 'msTransform'];
  for (j = 0, len = ref1.length; j < len; j++) {
    key = ref1[j];
    if (el.style[key] !== void 0) {
      return key;
    }
  }
})();

tethers = [];

position = function() {
  var j, len, tether;
  for (j = 0, len = tethers.length; j < len; j++) {
    tether = tethers[j];
    tether.position(false);
  }
  return flush();
};

now = function() {
  var ref1;
  return (ref1 = typeof performance !== "undefined" && performance !== null ? typeof performance.now === "function" ? performance.now() : void 0 : void 0) != null ? ref1 : +(new Date);
};

(function() {
  var event, j, lastCall, lastDuration, len, pendingTimeout, ref1, results, tick;
  lastCall = null;
  lastDuration = null;
  pendingTimeout = null;
  tick = function() {
    if ((lastDuration != null) && lastDuration > 16) {
      lastDuration = Math.min(lastDuration - 16, 250);
      pendingTimeout = setTimeout(tick, 250);
      return;
    }
    if ((lastCall != null) && (now() - lastCall) < 10) {
      return;
    }
    if (pendingTimeout != null) {
      clearTimeout(pendingTimeout);
      pendingTimeout = null;
    }
    lastCall = now();
    position();
    return lastDuration = now() - lastCall;
  };
  ref1 = ['resize', 'scroll', 'touchmove'];
  results = [];
  for (j = 0, len = ref1.length; j < len; j++) {
    event = ref1[j];
    results.push(window.addEventListener(event, tick));
  }
  return results;
})();

MIRROR_LR = {
  center: 'center',
  left: 'right',
  right: 'left'
};

MIRROR_TB = {
  middle: 'middle',
  top: 'bottom',
  bottom: 'top'
};

OFFSET_MAP = {
  top: 0,
  left: 0,
  middle: '50%',
  center: '50%',
  bottom: '100%',
  right: '100%'
};

autoToFixedAttachment = function(attachment, relativeToAttachment) {
  var left, top;
  left = attachment.left, top = attachment.top;
  if (left === 'auto') {
    left = MIRROR_LR[relativeToAttachment.left];
  }
  if (top === 'auto') {
    top = MIRROR_TB[relativeToAttachment.top];
  }
  return {
    left: left,
    top: top
  };
};

attachmentToOffset = function(attachment) {
  var ref1, ref2;
  return {
    left: (ref1 = OFFSET_MAP[attachment.left]) != null ? ref1 : attachment.left,
    top: (ref2 = OFFSET_MAP[attachment.top]) != null ? ref2 : attachment.top
  };
};

addOffset = function() {
  var j, left, len, offsets, out, ref1, top;
  offsets = 1 <= arguments.length ? slice.call(arguments, 0) : [];
  out = {
    top: 0,
    left: 0
  };
  for (j = 0, len = offsets.length; j < len; j++) {
    ref1 = offsets[j], top = ref1.top, left = ref1.left;
    if (typeof top === 'string') {
      top = parseFloat(top, 10);
    }
    if (typeof left === 'string') {
      left = parseFloat(left, 10);
    }
    out.top += top;
    out.left += left;
  }
  return out;
};

offsetToPx = function(offset, size) {
  if (typeof offset.left === 'string' && offset.left.indexOf('%') !== -1) {
    offset.left = parseFloat(offset.left, 10) / 100 * size.width;
  }
  if (typeof offset.top === 'string' && offset.top.indexOf('%') !== -1) {
    offset.top = parseFloat(offset.top, 10) / 100 * size.height;
  }
  return offset;
};

parseAttachment = parseOffset = function(value) {
  var left, ref1, top;
  ref1 = value.split(' '), top = ref1[0], left = ref1[1];
  return {
    top: top,
    left: left
  };
};

TetherClass = (function() {
  TetherClass.modules = [];

  function TetherClass(options) {
    this.position = bind(this.position, this);
    var j, len, module, ref1, ref2;
    tethers.push(this);
    this.history = [];
    this.setOptions(options, false);
    ref1 = TetherBase.modules;
    for (j = 0, len = ref1.length; j < len; j++) {
      module = ref1[j];
      if ((ref2 = module.initialize) != null) {
        ref2.call(this);
      }
    }
    this.position();
  }

  TetherClass.prototype.getClass = function(key) {
    var ref1, ref2;
    if ((ref1 = this.options.classes) != null ? ref1[key] : void 0) {
      return this.options.classes[key];
    } else if (((ref2 = this.options.classes) != null ? ref2[key] : void 0) !== false) {
      if (this.options.classPrefix) {
        return this.options.classPrefix + "-" + key;
      } else {
        return key;
      }
    } else {
      return '';
    }
  };

  TetherClass.prototype.setOptions = function(options1, position) {
    var defaults, j, key, len, ref1, ref2;
    this.options = options1;
    if (position == null) {
      position = true;
    }
    defaults = {
      offset: '0 0',
      targetOffset: '0 0',
      targetAttachment: 'auto auto',
      classPrefix: 'tether'
    };
    this.options = extend(defaults, this.options);
    ref1 = this.options, this.element = ref1.element, this.target = ref1.target, this.targetModifier = ref1.targetModifier;
    if (this.target === 'viewport') {
      this.target = document.body;
      this.targetModifier = 'visible';
    } else if (this.target === 'scroll-handle') {
      this.target = document.body;
      this.targetModifier = 'scroll-handle';
    }
    ref2 = ['element', 'target'];
    for (j = 0, len = ref2.length; j < len; j++) {
      key = ref2[j];
      if (this[key] == null) {
        throw new Error("Tether Error: Both element and target must be defined");
      }
      if (this[key].jquery != null) {
        this[key] = this[key][0];
      } else if (typeof this[key] === 'string') {
        this[key] = document.querySelector(this[key]);
      }
    }
    addClass(this.element, this.getClass('element'));
    if (this.options.addTargetClasses !== false) {
      addClass(this.target, this.getClass('target'));
    }
    if (!this.options.attachment) {
      throw new Error("Tether Error: You must provide an attachment");
    }
    this.targetAttachment = parseAttachment(this.options.targetAttachment);
    this.attachment = parseAttachment(this.options.attachment);
    this.offset = parseOffset(this.options.offset);
    this.targetOffset = parseOffset(this.options.targetOffset);
    if (this.scrollParent != null) {
      this.disable();
    }
    if (this.targetModifier === 'scroll-handle') {
      this.scrollParent = this.target;
    } else {
      this.scrollParent = getScrollParent(this.target);
    }
    if (this.options.enabled !== false) {
      return this.enable(position);
    }
  };

  TetherClass.prototype.getTargetBounds = function() {
    var bounds, fitAdj, hasBottomScroll, height, out, scrollBottom, scrollPercentage, style, target;
    if (this.targetModifier != null) {
      switch (this.targetModifier) {
        case 'visible':
          if (this.target === document.body) {
            return {
              top: pageYOffset,
              left: pageXOffset,
              height: innerHeight,
              width: innerWidth
            };
          } else {
            bounds = getBounds(this.target);
            out = {
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
          break;
        case 'scroll-handle':
          target = this.target;
          if (target === document.body) {
            target = document.documentElement;
            bounds = {
              left: pageXOffset,
              top: pageYOffset,
              height: innerHeight,
              width: innerWidth
            };
          } else {
            bounds = getBounds(target);
          }
          style = getComputedStyle(target);
          hasBottomScroll = target.scrollWidth > target.clientWidth || 'scroll' === [style.overflow, style.overflowX] || this.target !== document.body;
          scrollBottom = 0;
          if (hasBottomScroll) {
            scrollBottom = 15;
          }
          height = bounds.height - parseFloat(style.borderTopWidth) - parseFloat(style.borderBottomWidth) - scrollBottom;
          out = {
            width: 15,
            height: height * 0.975 * (height / target.scrollHeight),
            left: bounds.left + bounds.width - parseFloat(style.borderLeftWidth) - 15
          };
          fitAdj = 0;
          if (height < 408 && this.target === document.body) {
            fitAdj = -0.00011 * Math.pow(height, 2) - 0.00727 * height + 22.58;
          }
          if (this.target !== document.body) {
            out.height = Math.max(out.height, 24);
          }
          scrollPercentage = this.target.scrollTop / (target.scrollHeight - height);
          out.top = scrollPercentage * (height - out.height - fitAdj) + bounds.top + parseFloat(style.borderTopWidth);
          if (this.target === document.body) {
            out.height = Math.max(out.height, 24);
          }
          return out;
      }
    } else {
      return getBounds(this.target);
    }
  };

  TetherClass.prototype.clearCache = function() {
    return this._cache = {};
  };

  TetherClass.prototype.cache = function(k, getter) {
    if (this._cache == null) {
      this._cache = {};
    }
    if (this._cache[k] == null) {
      this._cache[k] = getter.call(this);
    }
    return this._cache[k];
  };

  TetherClass.prototype.enable = function(position) {
    if (position == null) {
      position = true;
    }
    if (this.options.addTargetClasses !== false) {
      addClass(this.target, this.getClass('enabled'));
    }
    addClass(this.element, this.getClass('enabled'));
    this.enabled = true;
    if (this.scrollParent !== document) {
      this.scrollParent.addEventListener('scroll', this.position);
    }
    if (position) {
      return this.position();
    }
  };

  TetherClass.prototype.disable = function() {
    removeClass(this.target, this.getClass('enabled'));
    removeClass(this.element, this.getClass('enabled'));
    this.enabled = false;
    if (this.scrollParent != null) {
      return this.scrollParent.removeEventListener('scroll', this.position);
    }
  };

  TetherClass.prototype.destroy = function() {
    var i, j, len, results, tether;
    this.disable();
    results = [];
    for (i = j = 0, len = tethers.length; j < len; i = ++j) {
      tether = tethers[i];
      if (tether === this) {
        tethers.splice(i, 1);
        break;
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  TetherClass.prototype.updateAttachClasses = function(elementAttach, targetAttach) {
    var add, all, j, l, len, len1, ref1, side, sides;
    if (elementAttach == null) {
      elementAttach = this.attachment;
    }
    if (targetAttach == null) {
      targetAttach = this.targetAttachment;
    }
    sides = ['left', 'top', 'bottom', 'right', 'middle', 'center'];
    if ((ref1 = this._addAttachClasses) != null ? ref1.length : void 0) {
      this._addAttachClasses.splice(0, this._addAttachClasses.length);
    }
    add = this._addAttachClasses != null ? this._addAttachClasses : this._addAttachClasses = [];
    if (elementAttach.top) {
      add.push((this.getClass('element-attached')) + "-" + elementAttach.top);
    }
    if (elementAttach.left) {
      add.push((this.getClass('element-attached')) + "-" + elementAttach.left);
    }
    if (targetAttach.top) {
      add.push((this.getClass('target-attached')) + "-" + targetAttach.top);
    }
    if (targetAttach.left) {
      add.push((this.getClass('target-attached')) + "-" + targetAttach.left);
    }
    all = [];
    for (j = 0, len = sides.length; j < len; j++) {
      side = sides[j];
      all.push((this.getClass('element-attached')) + "-" + side);
    }
    for (l = 0, len1 = sides.length; l < len1; l++) {
      side = sides[l];
      all.push((this.getClass('target-attached')) + "-" + side);
    }
    return defer((function(_this) {
      return function() {
        if (_this._addAttachClasses == null) {
          return;
        }
        updateClasses(_this.element, _this._addAttachClasses, all);
        if (_this.options.addTargetClasses !== false) {
          updateClasses(_this.target, _this._addAttachClasses, all);
        }
        return _this._addAttachClasses = void 0;
      };
    })(this));
  };

  TetherClass.prototype.position = function(flushChanges) {
    var elementPos, elementStyle, height, j, l, left, len, len1, manualOffset, manualTargetOffset, module, next, offset, offsetBorder, offsetParent, offsetParentSize, offsetParentStyle, offsetPosition, ref1, ref2, ref3, ref4, ref5, ref6, ret, scrollLeft, scrollTop, scrollbarSize, side, targetAttachment, targetOffset, targetPos, targetSize, top, width;
    if (flushChanges == null) {
      flushChanges = true;
    }
    if (!this.enabled) {
      return;
    }
    this.clearCache();
    targetAttachment = autoToFixedAttachment(this.targetAttachment, this.attachment);
    this.updateAttachClasses(this.attachment, targetAttachment);
    elementPos = this.cache('element-bounds', (function(_this) {
      return function() {
        return getBounds(_this.element);
      };
    })(this));
    width = elementPos.width, height = elementPos.height;
    if (width === 0 && height === 0 && (this.lastSize != null)) {
      ref1 = this.lastSize, width = ref1.width, height = ref1.height;
    } else {
      this.lastSize = {
        width: width,
        height: height
      };
    }
    targetSize = targetPos = this.cache('target-bounds', (function(_this) {
      return function() {
        return _this.getTargetBounds();
      };
    })(this));
    offset = offsetToPx(attachmentToOffset(this.attachment), {
      width: width,
      height: height
    });
    targetOffset = offsetToPx(attachmentToOffset(targetAttachment), targetSize);
    manualOffset = offsetToPx(this.offset, {
      width: width,
      height: height
    });
    manualTargetOffset = offsetToPx(this.targetOffset, targetSize);
    offset = addOffset(offset, manualOffset);
    targetOffset = addOffset(targetOffset, manualTargetOffset);
    left = targetPos.left + targetOffset.left - offset.left;
    top = targetPos.top + targetOffset.top - offset.top;
    ref2 = TetherBase.modules;
    for (j = 0, len = ref2.length; j < len; j++) {
      module = ref2[j];
      ret = module.position.call(this, {
        left: left,
        top: top,
        targetAttachment: targetAttachment,
        targetPos: targetPos,
        attachment: this.attachment,
        elementPos: elementPos,
        offset: offset,
        targetOffset: targetOffset,
        manualOffset: manualOffset,
        manualTargetOffset: manualTargetOffset,
        scrollbarSize: scrollbarSize
      });
      if (ret === false) {
        return false;
      } else if ((ret == null) || typeof ret !== 'object') {
        continue;
      } else {
        top = ret.top, left = ret.left;
      }
    }
    next = {
      page: {
        top: top,
        left: left
      },
      viewport: {
        top: top - pageYOffset,
        bottom: pageYOffset - top - height + innerHeight,
        left: left - pageXOffset,
        right: pageXOffset - left - width + innerWidth
      }
    };
    if (document.body.scrollWidth > window.innerWidth) {
      scrollbarSize = this.cache('scrollbar-size', getScrollBarSize);
      next.viewport.bottom -= scrollbarSize.height;
    }
    if (document.body.scrollHeight > window.innerHeight) {
      scrollbarSize = this.cache('scrollbar-size', getScrollBarSize);
      next.viewport.right -= scrollbarSize.width;
    }
    if (((ref3 = document.body.style.position) !== '' && ref3 !== 'static') || ((ref4 = document.body.parentElement.style.position) !== '' && ref4 !== 'static')) {
      next.page.bottom = document.body.scrollHeight - top - height;
      next.page.right = document.body.scrollWidth - left - width;
    }
    if (((ref5 = this.options.optimizations) != null ? ref5.moveElement : void 0) !== false && (this.targetModifier == null)) {
      offsetParent = this.cache('target-offsetparent', (function(_this) {
        return function() {
          return getOffsetParent(_this.target);
        };
      })(this));
      offsetPosition = this.cache('target-offsetparent-bounds', function() {
        return getBounds(offsetParent);
      });
      offsetParentStyle = getComputedStyle(offsetParent);
      elementStyle = getComputedStyle(this.element);
      offsetParentSize = offsetPosition;
      offsetBorder = {};
      ref6 = ['Top', 'Left', 'Bottom', 'Right'];
      for (l = 0, len1 = ref6.length; l < len1; l++) {
        side = ref6[l];
        offsetBorder[side.toLowerCase()] = parseFloat(offsetParentStyle["border" + side + "Width"]);
      }
      offsetPosition.right = document.body.scrollWidth - offsetPosition.left - offsetParentSize.width + offsetBorder.right;
      offsetPosition.bottom = document.body.scrollHeight - offsetPosition.top - offsetParentSize.height + offsetBorder.bottom;
      if (next.page.top >= (offsetPosition.top + offsetBorder.top) && next.page.bottom >= offsetPosition.bottom) {
        if (next.page.left >= (offsetPosition.left + offsetBorder.left) && next.page.right >= offsetPosition.right) {
          scrollTop = offsetParent.scrollTop;
          scrollLeft = offsetParent.scrollLeft;
          next.offset = {
            top: next.page.top - offsetPosition.top + scrollTop - offsetBorder.top,
            left: next.page.left - offsetPosition.left + scrollLeft - offsetBorder.left
          };
        }
      }
    }
    this.move(next);
    this.history.unshift(next);
    if (this.history.length > 3) {
      this.history.pop();
    }
    if (flushChanges) {
      flush();
    }
    return true;
  };

  TetherClass.prototype.move = function(position) {
    var css, elVal, found, j, key, len, moved, offsetParent, point, ref1, ref2, same, transcribe, type, val, write, writeCSS;
    if (this.element.parentNode == null) {
      return;
    }
    same = {};
    for (type in position) {
      same[type] = {};
      for (key in position[type]) {
        found = false;
        ref1 = this.history;
        for (j = 0, len = ref1.length; j < len; j++) {
          point = ref1[j];
          if (!within((ref2 = point[type]) != null ? ref2[key] : void 0, position[type][key])) {
            found = true;
            break;
          }
        }
        if (!found) {
          same[type][key] = true;
        }
      }
    }
    css = {
      top: '',
      left: '',
      right: '',
      bottom: ''
    };
    transcribe = (function(_this) {
      return function(same, pos) {
        var ref3, xPos, yPos;
        if (((ref3 = _this.options.optimizations) != null ? ref3.gpu : void 0) !== false) {
          if (same.top) {
            css.top = 0;
            yPos = pos.top;
          } else {
            css.bottom = 0;
            yPos = -pos.bottom;
          }
          if (same.left) {
            css.left = 0;
            xPos = pos.left;
          } else {
            css.right = 0;
            xPos = -pos.right;
          }
          css[transformKey] = "translateX(" + (Math.round(xPos)) + "px) translateY(" + (Math.round(yPos)) + "px)";
          if (transformKey !== 'msTransform') {
            return css[transformKey] += " translateZ(0)";
          }
        } else {
          if (same.top) {
            css.top = pos.top + "px";
          } else {
            css.bottom = pos.bottom + "px";
          }
          if (same.left) {
            return css.left = pos.left + "px";
          } else {
            return css.right = pos.right + "px";
          }
        }
      };
    })(this);
    moved = false;
    if ((same.page.top || same.page.bottom) && (same.page.left || same.page.right)) {
      css.position = 'absolute';
      transcribe(same.page, position.page);
    } else if ((same.viewport.top || same.viewport.bottom) && (same.viewport.left || same.viewport.right)) {
      css.position = 'fixed';
      transcribe(same.viewport, position.viewport);
    } else if ((same.offset != null) && same.offset.top && same.offset.left) {
      css.position = 'absolute';
      offsetParent = this.cache('target-offsetparent', (function(_this) {
        return function() {
          return getOffsetParent(_this.target);
        };
      })(this));
      if (getOffsetParent(this.element) !== offsetParent) {
        defer((function(_this) {
          return function() {
            _this.element.parentNode.removeChild(_this.element);
            return offsetParent.appendChild(_this.element);
          };
        })(this));
      }
      transcribe(same.offset, position.offset);
      moved = true;
    } else {
      css.position = 'absolute';
      transcribe({
        top: true,
        left: true
      }, position.page);
    }
    if (!moved && this.element.parentNode.tagName !== 'BODY') {
      this.element.parentNode.removeChild(this.element);
      document.body.appendChild(this.element);
    }
    writeCSS = {};
    write = false;
    for (key in css) {
      val = css[key];
      elVal = this.element.style[key];
      if (elVal !== '' && val !== '' && (key === 'top' || key === 'left' || key === 'bottom' || key === 'right')) {
        elVal = parseFloat(elVal);
        val = parseFloat(val);
      }
      if (elVal !== val) {
        write = true;
        writeCSS[key] = css[key];
      }
    }
    if (write) {
      return defer((function(_this) {
        return function() {
          return extend(_this.element.style, writeCSS);
        };
      })(this));
    }
  };

  return TetherClass;

})();

TetherBase.position = position;

Tether = extend(TetherClass, TetherBase);

/* globals TetherBase */

'use strict';

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

var _TetherBase$Utils = TetherBase.Utils;
var getBounds = _TetherBase$Utils.getBounds;
var extend = _TetherBase$Utils.extend;
var updateClasses = _TetherBase$Utils.updateClasses;
var defer = _TetherBase$Utils.defer;

var BOUNDS_FORMAT = ['left', 'top', 'right', 'bottom'];

function getBoundingRect(tether, to) {
  if (to === 'scrollParent') {
    to = tether.scrollParent;
  } else if (to === 'window') {
    to = [pageXOffset, pageYOffset, innerWidth + pageXOffset, innerHeight + pageYOffset];
  }

  if (to === document) {
    to = to.documentElement;
  }

  if (typeof to.nodeType !== 'undefined') {
    (function () {
      var size = getBounds(to);
      var pos = size;
      var style = getComputedStyle(to);

      to = [pos.left, pos.top, size.width + pos.left, size.height + pos.top];

      BOUNDS_FORMAT.forEach(function (side, i) {
        side = side[0].toUpperCase() + side.substr(1);
        if (side === 'Top' || side === 'Left') {
          to[i] += parseFloat(style['border' + side + 'Width']);
        } else {
          to[i] -= parseFloat(style['border' + side + 'Width']);
        }
      });
    })();
  }

  return to;
}

TetherBase.modules.push({
  position: function position(_ref) {
    var _this = this;

    var top = _ref.top;
    var left = _ref.left;
    var targetAttachment = _ref.targetAttachment;

    if (!this.options.constraints) {
      return true;
    }

    var _cache = this.cache('element-bounds', function () {
      return getBounds(_this.element);
    });

    var height = _cache.height;
    var width = _cache.width;

    if (width === 0 && height === 0 && typeof this.lastSize !== 'undefined') {
      // Handle the item getting hidden as a result of our positioning without glitching
      // the classes in and out
      var _lastSize = this.lastSize;
      width = _lastSize.width;
      height = _lastSize.height;
    }

    var targetSize = this.cache('target-bounds', function () {
      return _this.getTargetBounds();
    });

    var targetHeight = targetSize.height;
    var targetWidth = targetSize.width;

    var allClasses = [this.getClass('pinned'), this.getClass('out-of-bounds')];

    this.options.constraints.forEach(function (constraint) {
      var outOfBoundsClass = constraint.outOfBoundsClass;
      var pinnedClass = constraint.pinnedClass;

      if (outOfBoundsClass) {
        allClasses.push(outOfBoundsClass);
      }
      if (pinnedClass) {
        allClasses.push(pinnedClass);
      }
    });

    allClasses.forEach(function (cls) {
      ['left', 'top', 'right', 'bottom'].forEach(function (side) {
        allClasses.push('' + cls + '-' + side);
      });
    });

    var addClasses = [];

    var tAttachment = extend({}, targetAttachment);
    var eAttachment = extend({}, this.attachment);

    this.options.constraints.forEach(function (constraint) {
      var to = constraint.to;
      var attachment = constraint.attachment;
      var pin = constraint.pin;

      if (typeof attachment === 'undefined') {
        attachment = '';
      }

      var changeAttachX = undefined,
          changeAttachY = undefined;
      if (attachment.indexOf(' ') >= 0) {
        var _attachment$split = attachment.split(' ');

        var _attachment$split2 = _slicedToArray(_attachment$split, 2);

        changeAttachY = _attachment$split2[0];
        changeAttachX = _attachment$split2[1];
      } else {
        changeAttachX = changeAttachY = attachment;
      }

      var bounds = getBoundingRect(_this, to);

      if (changeAttachY === 'target' || changeAttachY === 'both') {
        if (top < bounds[1] && tAttachment.top === 'top') {
          top += targetHeight;
          tAttachment.top = 'bottom';
        }

        if (top + height > bounds[3] && tAttachment.top === 'bottom') {
          top -= targetHeight;
          tAttachment.top = 'top';
        }
      }

      if (changeAttachY === 'together') {
        if (top < bounds[1] && tAttachment.top === 'top') {
          if (eAttachment.top === 'bottom') {
            top += targetHeight;
            tAttachment.top = 'bottom';

            top += height;
            eAttachment.top = 'top';
          } else if (eAttachment.top === 'top') {
            top += targetHeight;
            tAttachment.top = 'bottom';

            top -= height;
            eAttachment.top = 'bottom';
          }
        }

        if (top + height > bounds[3] && tAttachment.top === 'bottom') {
          if (eAttachment.top === 'top') {
            top -= targetHeight;
            tAttachment.top = 'top';

            top -= height;
            eAttachment.top = 'bottom';
          } else if (eAttachment.top === 'bottom') {
            top -= targetHeight;
            tAttachment.top = 'top';

            top += height;
            eAttachment.top = 'top';
          }
        }

        if (tAttachment.top === 'middle') {
          if (top + height > bounds[3] && eAttachment.top === 'top') {
            top -= height;
            eAttachment.top = 'bottom';
          } else if (top < bounds[1] && eAttachment.top === 'bottom') {
            top += height;
            eAttachment.top = 'top';
          }
        }
      }

      if (changeAttachX === 'target' || changeAttachX === 'both') {
        if (left < bounds[0] && tAttachment.left === 'left') {
          left += targetWidth;
          tAttachment.left = 'right';
        }

        if (left + width > bounds[2] && tAttachment.left === 'right') {
          left -= targetWidth;
          tAttachment.left = 'left';
        }
      }

      if (changeAttachX === 'together') {
        if (left < bounds[0] && tAttachment.left === 'left') {
          if (eAttachment.left === 'right') {
            left += targetWidth;
            tAttachment.left = 'right';

            left += width;
            eAttachment.left = 'left';
          } else if (eAttachment.left === 'left') {
            left += targetWidth;
            tAttachment.left = 'right';

            left -= width;
            eAttachment.left = 'right';
          }
        } else if (left + width > bounds[2] && tAttachment.left === 'right') {
          if (eAttachment.left === 'left') {
            left -= targetWidth;
            tAttachment.left = 'left';

            left -= width;
            eAttachment.left = 'right';
          } else if (eAttachment.left === 'right') {
            left -= targetWidth;
            tAttachment.left = 'left';

            left += width;
            eAttachment.left = 'left';
          }
        } else if (tAttachment.left === 'center') {
          if (left + width > bounds[2] && eAttachment.left === 'left') {
            left -= width;
            eAttachment.left = 'right';
          } else if (left < bounds[0] && eAttachment.left === 'right') {
            left += width;
            eAttachment.left = 'left';
          }
        }
      }

      if (changeAttachY === 'element' || changeAttachY === 'both') {
        if (top < bounds[1] && eAttachment.top === 'bottom') {
          top += height;
          eAttachment.top = 'top';
        }

        if (top + height > bounds[3] && eAttachment.top === 'top') {
          top -= height;
          eAttachment.top = 'bottom';
        }
      }

      if (changeAttachX === 'element' || changeAttachX === 'both') {
        if (left < bounds[0] && eAttachment.left === 'right') {
          left += width;
          eAttachment.left = 'left';
        }

        if (left + width > bounds[2] && eAttachment.left === 'left') {
          left -= width;
          eAttachment.left = 'right';
        }
      }

      if (typeof pin === 'string') {
        pin = pin.split(',').map(function (p) {
          return p.trim();
        });
      } else if (pin === true) {
        pin = ['top', 'left', 'right', 'bottom'];
      }

      pin = pin || [];

      var pinned = [];
      var oob = [];

      if (top < bounds[1]) {
        if (pin.indexOf('top') >= 0) {
          top = bounds[1];
          pinned.push('top');
        } else {
          oob.push('top');
        }
      }

      if (top + height > bounds[3]) {
        if (pin.indexOf('bottom') >= 0) {
          top = bounds[3] - height;
          pinned.push('bottom');
        } else {
          oob.push('bottom');
        }
      }

      if (left < bounds[0]) {
        if (pin.indexOf('left') >= 0) {
          left = bounds[0];
          pinned.push('left');
        } else {
          oob.push('left');
        }
      }

      if (left + width > bounds[2]) {
        if (pin.indexOf('right') >= 0) {
          left = bounds[2] - width;
          pinned.push('right');
        } else {
          oob.push('right');
        }
      }

      if (pinned.length) {
        (function () {
          var pinnedClass = undefined;
          if (typeof _this.options.pinnedClass !== 'undefined') {
            pinnedClass = _this.options.pinnedClass;
          } else {
            pinnedClass = _this.getClass('pinned');
          }

          addClasses.push(pinnedClass);
          pinned.forEach(function (side) {
            addClasses.push('' + pinnedClass + '-' + side);
          });
        })();
      }

      if (oob.length) {
        (function () {
          var oobClass = undefined;
          if (typeof _this.options.outOfBoundsClass !== 'undefined') {
            oobClass = _this.options.outOfBoundsClass;
          } else {
            oobClass = _this.getClass('out-of-bounds');
          }

          addClasses.push(oobClass);
          oob.forEach(function (side) {
            addClasses.push('' + oobClass + '-' + side);
          });
        })();
      }

      if (pinned.indexOf('left') >= 0 || pinned.indexOf('right') >= 0) {
        eAttachment.left = tAttachment.left = false;
      }
      if (pinned.indexOf('top') >= 0 || pinned.indexOf('bottom') >= 0) {
        eAttachment.top = tAttachment.top = false;
      }

      if (tAttachment.top !== targetAttachment.top || tAttachment.left !== targetAttachment.left || eAttachment.top !== _this.attachment.top || eAttachment.left !== _this.attachment.left) {
        _this.updateAttachClasses(eAttachment, tAttachment);
      }
    });

    defer(function () {
      if (!(_this.options.addTargetClasses === false)) {
        updateClasses(_this.target, addClasses, allClasses);
      }
      updateClasses(_this.element, addClasses, allClasses);
    });

    return { top: top, left: left };
  }
});

TetherBase.modules.push({
  position: function(arg) {
    var left, ref, result, shift, shiftLeft, shiftTop, top;
    top = arg.top, left = arg.left;
    if (!this.options.shift) {
      return;
    }
    result = function(val) {
      if (typeof val === 'function') {
        return val.call(this, {
          top: top,
          left: left
        });
      } else {
        return val;
      }
    };
    shift = result(this.options.shift);
    if (typeof shift === 'string') {
      shift = shift.split(' ');
      shift[1] || (shift[1] = shift[0]);
      shiftTop = shift[0], shiftLeft = shift[1];
      shiftTop = parseFloat(shiftTop, 10);
      shiftLeft = parseFloat(shiftLeft, 10);
    } else {
      ref = [shift.top, shift.left], shiftTop = ref[0], shiftLeft = ref[1];
    }
    top += shiftTop;
    left += shiftLeft;
    return {
      top: top,
      left: left
    };
  }
});

return Tether;

}));
