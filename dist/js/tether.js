
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
/* globals TetherBase */

'use strict';

var _TetherBase$Utils = TetherBase.Utils;
var getBounds = _TetherBase$Utils.getBounds;
var updateClasses = _TetherBase$Utils.updateClasses;
var defer = _TetherBase$Utils.defer;

TetherBase.modules.push({
  position: function position(_ref) {
    var _this = this;

    var top = _ref.top;
    var left = _ref.left;

    var _cache = this.cache('element-bounds', function () {
      return getBounds(_this.element);
    });

    var height = _cache.height;
    var width = _cache.width;

    var targetPos = this.getTargetBounds();

    var bottom = top + height;
    var right = left + width;

    var abutted = [];
    if (top <= targetPos.bottom && bottom >= targetPos.top) {
      ['left', 'right'].forEach(function (side) {
        var targetPosSide = targetPos[side];
        if (targetPosSide === left || targetPosSide === right) {
          abutted.push(side);
        }
      });
    }

    if (left <= targetPos.right && right >= targetPos.left) {
      ['top', 'bottom'].forEach(function (side) {
        var targetPosSide = targetPos[side];
        if (targetPosSide === top || targetPosSide === bottom) {
          abutted.push(side);
        }
      });
    }

    var allClasses = [];
    var addClasses = [];

    var sides = ['left', 'top', 'right', 'bottom'];
    allClasses.push(this.getClass('abutted'));
    sides.forEach(function (side) {
      allClasses.push('' + _this.getClass('abutted') + '-' + side);
    });

    if (abutted.length) {
      addClasses.push(this.getClass('abutted'));
    }

    abutted.forEach(function (side) {
      addClasses.push('' + _this.getClass('abutted') + '-' + side);
    });

    defer(function () {
      if (!(_this.options.addTargetClasses === false)) {
        updateClasses(_this.target, addClasses, allClasses);
      }
      updateClasses(_this.element, addClasses, allClasses);
    });

    return true;
  }
});
/* globals TetherBase */

'use strict';

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

TetherBase.modules.push({
  position: function position(_ref) {
    var top = _ref.top;
    var left = _ref.left;

    if (!this.options.shift) {
      return;
    }

    var shift = this.options.shift;
    if (typeof this.options.shift === 'function') {
      shift = this.options.shift.call(this, { top: top, left: left });
    }

    var shiftTop = undefined,
        shiftLeft = undefined;
    if (typeof shift === 'string') {
      shift = shift.split(' ');
      shift[1] = shift[1] || shift[0];

      var _shift = _slicedToArray(shift, 2);

      shiftTop = _shift[0];
      shiftLeft = _shift[1];

      shiftTop = parseFloat(shiftTop, 10);
      shiftLeft = parseFloat(shiftLeft, 10);
    } else {
      shiftTop = shift.top;
      shiftLeft = shift.left;
    }

    top += shiftTop;
    left += shiftLeft;

    return { top: top, left: left };
  }
});
return Tether;

}));
