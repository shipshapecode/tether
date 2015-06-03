var Evented, TetherBuilder, addClass, defer, deferred, extend, flush, getBounds, getClassName, getOffsetParent, getOrigin, getScrollBarSize, getScrollParent, hasClass, node, removeClass, setClassName, uniqueId, updateClasses, zeroPosCache,
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  slice = [].slice;

if (typeof TetherBuilder === 'undefined') {
  TetherBuilder = {
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

TetherBuilder.Utils = {
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
