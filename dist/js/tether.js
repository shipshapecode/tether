/*! tether 2.0.0-beta.2 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Tether = factory());
}(this, function () { 'use strict';

  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  var Evented =
  /*#__PURE__*/
  function () {
    function Evented() {}

    var _proto = Evented.prototype;

    _proto.on = function on(event, handler, ctx, once) {
      if (once === void 0) {
        once = false;
      }

      if (typeof this.bindings === 'undefined') {
        this.bindings = {};
      }

      if (typeof this.bindings[event] === 'undefined') {
        this.bindings[event] = [];
      }

      this.bindings[event].push({
        handler: handler,
        ctx: ctx,
        once: once
      });
      return this;
    };

    _proto.once = function once(event, handler, ctx) {
      return this.on(event, handler, ctx, true);
    };

    _proto.off = function off(event, handler) {
      if (typeof this.bindings === 'undefined' || typeof this.bindings[event] === 'undefined') {
        return this;
      }

      if (typeof handler === 'undefined') {
        delete this.bindings[event];
      } else {
        var i = 0;

        while (i < this.bindings[event].length) {
          if (this.bindings[event][i].handler === handler) {
            this.bindings[event].splice(i, 1);
          } else {
            ++i;
          }
        }
      }

      return this;
    };

    _proto.trigger = function trigger(event) {
      if (typeof this.bindings !== 'undefined' && this.bindings[event]) {
        var i = 0;

        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        while (i < this.bindings[event].length) {
          var _this$bindings$event$ = this.bindings[event][i],
              handler = _this$bindings$event$.handler,
              ctx = _this$bindings$event$.ctx,
              once = _this$bindings$event$.once;
          var context = ctx;

          if (typeof context === 'undefined') {
            context = this;
          }

          handler.apply(context, args);

          if (once) {
            this.bindings[event].splice(i, 1);
          } else {
            ++i;
          }
        }
      }

      return this;
    };

    return Evented;
  }();

  var TetherBase;

  if (typeof TetherBase === 'undefined') {
    TetherBase = {
      modules: []
    };
  }

  var zeroElement = null; // Same as native getBoundingClientRect, except it takes into account parent <frame> offsets
  // if the element lies within a nested document (<frame> or <iframe>-like).

  function getActualBoundingClientRect(node) {
    var boundingRect = node.getBoundingClientRect(); // The original object returned by getBoundingClientRect is immutable, so we clone it
    // We can't use extend because the properties are not considered part of the object by hasOwnProperty in IE9

    var rect = {};

    for (var k in boundingRect) {
      rect[k] = boundingRect[k];
    }

    try {
      if (node.ownerDocument !== document) {
        var frameElement = node.ownerDocument.defaultView.frameElement;

        if (frameElement) {
          var frameRect = getActualBoundingClientRect(frameElement);
          rect.top += frameRect.top;
          rect.bottom += frameRect.top;
          rect.left += frameRect.left;
          rect.right += frameRect.left;
        }
      }
    } catch (err) {// Ignore "Access is denied" in IE11/Edge
    }

    return rect;
  }

  function getScrollParents(el) {
    // In firefox if the el is inside an iframe with display: none; window.getComputedStyle() will return null;
    // https://bugzilla.mozilla.org/show_bug.cgi?id=548397
    var computedStyle = getComputedStyle(el) || {};
    var position = computedStyle.position;
    var parents = [];

    if (position === 'fixed') {
      return [el];
    }

    var parent = el;

    while ((parent = parent.parentNode) && parent && parent.nodeType === 1) {
      var style = void 0;

      try {
        style = getComputedStyle(parent);
      } catch (err) {// Intentionally blank
      }

      if (typeof style === 'undefined' || style === null) {
        parents.push(parent);
        return parents;
      }

      var _style = style,
          overflow = _style.overflow,
          overflowX = _style.overflowX,
          overflowY = _style.overflowY;

      if (/(auto|scroll|overlay)/.test(overflow + overflowY + overflowX)) {
        if (position !== 'absolute' || ['relative', 'absolute', 'fixed'].indexOf(style.position) >= 0) {
          parents.push(parent);
        }
      }
    }

    parents.push(el.ownerDocument.body); // If the node is within a frame, account for the parent window scroll

    if (el.ownerDocument !== document) {
      parents.push(el.ownerDocument.defaultView);
    }

    return parents;
  }

  var uniqueId = function () {
    var id = 0;
    return function () {
      return ++id;
    };
  }();

  var zeroPosCache = {};

  var getOrigin = function getOrigin() {
    // getBoundingClientRect is unfortunately too accurate.  It introduces a pixel or two of
    // jitter as the user scrolls that messes with our ability to detect if two positions
    // are equivilant or not.  We place an element at the top left of the page that will
    // get the same jitter, so we can cancel the two out.
    var node = zeroElement;

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

    var id = node.getAttribute('data-tether-id');

    if (typeof zeroPosCache[id] === 'undefined') {
      zeroPosCache[id] = getActualBoundingClientRect(node); // Clear the cache when this position call is done

      defer(function () {
        delete zeroPosCache[id];
      });
    }

    return zeroPosCache[id];
  };

  function removeUtilElements() {
    if (zeroElement) {
      document.body.removeChild(zeroElement);
    }

    zeroElement = null;
  }

  function getBounds(el) {
    var doc;

    if (el === document) {
      doc = document;
      el = document.documentElement;
    } else {
      doc = el.ownerDocument;
    }

    var docEl = doc.documentElement;
    var box = getActualBoundingClientRect(el);
    var origin = getOrigin();
    box.top -= origin.top;
    box.left -= origin.left;

    if (typeof box.width === 'undefined') {
      box.width = document.body.scrollWidth - box.left - box.right;
    }

    if (typeof box.height === 'undefined') {
      box.height = document.body.scrollHeight - box.top - box.bottom;
    }

    box.top = box.top - docEl.clientTop;
    box.left = box.left - docEl.clientLeft;
    box.right = doc.body.clientWidth - box.width - box.left;
    box.bottom = doc.body.clientHeight - box.height - box.top;
    return box;
  }

  function getOffsetParent(el) {
    return el.offsetParent || document.documentElement;
  }

  var _scrollBarSize = null;

  function getScrollBarSize() {
    if (_scrollBarSize) {
      return _scrollBarSize;
    }

    var inner = document.createElement('div');
    inner.style.width = '100%';
    inner.style.height = '200px';
    var outer = document.createElement('div');
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
    var widthContained = inner.offsetWidth;
    outer.style.overflow = 'scroll';
    var widthScroll = inner.offsetWidth;

    if (widthContained === widthScroll) {
      widthScroll = outer.clientWidth;
    }

    document.body.removeChild(outer);
    var width = widthContained - widthScroll;
    _scrollBarSize = {
      width: width,
      height: width
    };
    return _scrollBarSize;
  }

  function extend(out) {
    if (out === void 0) {
      out = {};
    }

    var args = [];
    Array.prototype.push.apply(args, arguments);
    args.slice(1).forEach(function (obj) {
      if (obj) {
        for (var key in obj) {
          if ({}.hasOwnProperty.call(obj, key)) {
            out[key] = obj[key];
          }
        }
      }
    });
    return out;
  }

  var deferred = [];

  var defer = function defer(fn) {
    deferred.push(fn);
  };

  var flush = function flush() {
    var fn; // eslint-disable-next-line

    while (fn = deferred.pop()) {
      fn();
    }
  };

  TetherBase.Utils = {
    getActualBoundingClientRect: getActualBoundingClientRect,
    getScrollParents: getScrollParents,
    getBounds: getBounds,
    getOffsetParent: getOffsetParent,
    extend: extend,
    defer: defer,
    flush: flush,
    uniqueId: uniqueId,
    getScrollBarSize: getScrollBarSize,
    removeUtilElements: removeUtilElements
  };
  var TetherBase$1 = TetherBase;

  function addClass(el, name) {
    name.split(' ').forEach(function (cls) {
      if (cls.trim()) {
        el.classList.add(cls);
      }
    });
  }
  function removeClass(el, name) {
    name.split(' ').forEach(function (cls) {
      if (cls.trim()) {
        el.classList.remove(cls);
      }
    });
  }
  function updateClasses(el, add, all) {
    // Of the set of 'all' classes, we need the 'add' classes, and only the
    // 'add' classes to be set.
    all.forEach(function (cls) {
      if (add.indexOf(cls) === -1 && el.classList.contains(cls)) {
        removeClass(el, cls);
      }
    });
    add.forEach(function (cls) {
      if (!el.classList.contains(cls)) {
        addClass(el, cls);
      }
    });
  }

  var _TetherBase$Utils = TetherBase$1.Utils,
      getBounds$1 = _TetherBase$Utils.getBounds,
      extend$1 = _TetherBase$Utils.extend,
      defer$1 = _TetherBase$Utils.defer;
  var BOUNDS_FORMAT = ['left', 'top', 'right', 'bottom'];

  function getBoundingRect(tether, to) {
    if (to === 'scrollParent') {
      to = tether.scrollParents[0];
    } else if (to === 'window') {
      to = [pageXOffset, pageYOffset, innerWidth + pageXOffset, innerHeight + pageYOffset];
    }

    if (to === document) {
      to = to.documentElement;
    }

    if (typeof to.nodeType !== 'undefined') {
      var node = to;
      var size = getBounds$1(to);
      var pos = size;
      var style = getComputedStyle(to);
      to = [pos.left, pos.top, size.width + pos.left, size.height + pos.top]; // Account any parent Frames scroll offset

      if (node.ownerDocument !== document) {
        var win = node.ownerDocument.defaultView;
        to[0] += win.pageXOffset;
        to[1] += win.pageYOffset;
        to[2] += win.pageXOffset;
        to[3] += win.pageYOffset;
      }

      BOUNDS_FORMAT.forEach(function (side, i) {
        side = side[0].toUpperCase() + side.substr(1);

        if (side === 'Top' || side === 'Left') {
          to[i] += parseFloat(style["border" + side + "Width"]);
        } else {
          to[i] -= parseFloat(style["border" + side + "Width"]);
        }
      });
    }

    return to;
  }

  TetherBase$1.modules.push({
    position: function position(_ref) {
      var _this = this;

      var top = _ref.top,
          left = _ref.left,
          targetAttachment = _ref.targetAttachment;

      if (!this.options.constraints) {
        return true;
      }

      var _this$cache = this.cache('element-bounds', function () {
        return getBounds$1(_this.element);
      }),
          height = _this$cache.height,
          width = _this$cache.width;

      if (width === 0 && height === 0 && typeof this.lastSize !== 'undefined') {
        // Handle the item getting hidden as a result of our positioning without glitching
        // the classes in and out
        var _this$lastSize = this.lastSize;
        width = _this$lastSize.width;
        height = _this$lastSize.height;
      }

      var targetSize = this.cache('target-bounds', function () {
        return _this.getTargetBounds();
      });
      var targetHeight = targetSize.height,
          targetWidth = targetSize.width;
      var allClasses = [this.getClass('pinned'), this.getClass('out-of-bounds')];
      this.options.constraints.forEach(function (constraint) {
        var outOfBoundsClass = constraint.outOfBoundsClass,
            pinnedClass = constraint.pinnedClass;

        if (outOfBoundsClass) {
          allClasses.push(outOfBoundsClass);
        }

        if (pinnedClass) {
          allClasses.push(pinnedClass);
        }
      });
      allClasses.forEach(function (cls) {
        ['left', 'top', 'right', 'bottom'].forEach(function (side) {
          allClasses.push(cls + "-" + side);
        });
      });
      var addClasses = [];
      var tAttachment = extend$1({}, targetAttachment);
      var eAttachment = extend$1({}, this.attachment);
      this.options.constraints.forEach(function (constraint) {
        var to = constraint.to,
            attachment = constraint.attachment,
            pin = constraint.pin;

        if (typeof attachment === 'undefined') {
          attachment = '';
        }

        var changeAttachX, changeAttachY;

        if (attachment.indexOf(' ') >= 0) {
          var _attachment$split = attachment.split(' ');

          changeAttachY = _attachment$split[0];
          changeAttachX = _attachment$split[1];
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
          if (tAttachment.top === 'top') {
            if (eAttachment.top === 'bottom' && top < bounds[1]) {
              top += targetHeight;
              tAttachment.top = 'bottom';
              top += height;
              eAttachment.top = 'top';
            } else if (eAttachment.top === 'top' && top + height > bounds[3] && top - (height - targetHeight) >= bounds[1]) {
              top -= height - targetHeight;
              tAttachment.top = 'bottom';
              eAttachment.top = 'bottom';
            }
          }

          if (tAttachment.top === 'bottom') {
            if (eAttachment.top === 'top' && top + height > bounds[3]) {
              top -= targetHeight;
              tAttachment.top = 'top';
              top -= height;
              eAttachment.top = 'bottom';
            } else if (eAttachment.top === 'bottom' && top < bounds[1] && top + (height * 2 - targetHeight) <= bounds[3]) {
              top += height - targetHeight;
              tAttachment.top = 'top';
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
          if (left < bounds[0]) {
            if (eAttachment.left === 'right') {
              left += width;
              eAttachment.left = 'left';
            } else if (eAttachment.left === 'center') {
              left += width / 2;
              eAttachment.left = 'left';
            }
          }

          if (left + width > bounds[2]) {
            if (eAttachment.left === 'left') {
              left -= width;
              eAttachment.left = 'right';
            } else if (eAttachment.left === 'center') {
              left -= width / 2;
              eAttachment.left = 'right';
            }
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
          var pinnedClass;

          if (typeof _this.options.pinnedClass !== 'undefined') {
            pinnedClass = _this.options.pinnedClass;
          } else {
            pinnedClass = _this.getClass('pinned');
          }

          addClasses.push(pinnedClass);
          pinned.forEach(function (side) {
            addClasses.push(pinnedClass + "-" + side);
          });
        }

        if (oob.length) {
          var oobClass;

          if (typeof _this.options.outOfBoundsClass !== 'undefined') {
            oobClass = _this.options.outOfBoundsClass;
          } else {
            oobClass = _this.getClass('out-of-bounds');
          }

          addClasses.push(oobClass);
          oob.forEach(function (side) {
            addClasses.push(oobClass + "-" + side);
          });
        }

        if (pinned.indexOf('left') >= 0 || pinned.indexOf('right') >= 0) {
          eAttachment.left = tAttachment.left = false;
        }

        if (pinned.indexOf('top') >= 0 || pinned.indexOf('bottom') >= 0) {
          eAttachment.top = tAttachment.top = false;
        }

        if (tAttachment.top !== targetAttachment.top || tAttachment.left !== targetAttachment.left || eAttachment.top !== _this.attachment.top || eAttachment.left !== _this.attachment.left) {
          _this.updateAttachClasses(eAttachment, tAttachment);

          _this.trigger('update', {
            attachment: eAttachment,
            targetAttachment: tAttachment
          });
        }
      });
      defer$1(function () {
        if (!(_this.options.addTargetClasses === false)) {
          updateClasses(_this.target, addClasses, allClasses);
        }

        updateClasses(_this.element, addClasses, allClasses);
      });
      return {
        top: top,
        left: left
      };
    }
  });

  var _TetherBase$Utils$1 = TetherBase$1.Utils,
      getBounds$2 = _TetherBase$Utils$1.getBounds,
      defer$2 = _TetherBase$Utils$1.defer;
  TetherBase$1.modules.push({
    position: function position(_ref) {
      var _this = this;

      var top = _ref.top,
          left = _ref.left;

      var _this$cache = this.cache('element-bounds', function () {
        return getBounds$2(_this.element);
      }),
          height = _this$cache.height,
          width = _this$cache.width;

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
        allClasses.push(_this.getClass('abutted') + "-" + side);
      });

      if (abutted.length) {
        addClasses.push(this.getClass('abutted'));
      }

      abutted.forEach(function (side) {
        addClasses.push(_this.getClass('abutted') + "-" + side);
      });
      defer$2(function () {
        if (!(_this.options.addTargetClasses === false)) {
          updateClasses(_this.target, addClasses, allClasses);
        }

        updateClasses(_this.element, addClasses, allClasses);
      });
      return true;
    }
  });

  TetherBase$1.modules.push({
    position: function position(_ref) {
      var top = _ref.top,
          left = _ref.left;

      if (!this.options.shift) {
        return;
      }

      var shift = this.options.shift;

      if (typeof shift === 'function') {
        shift = shift.call(this, {
          top: top,
          left: left
        });
      }

      var shiftTop, shiftLeft;

      if (typeof shift === 'string') {
        shift = shift.split(' ');
        shift[1] = shift[1] || shift[0];
        var _shift = shift;
        shiftTop = _shift[0];
        shiftLeft = _shift[1];
        shiftTop = parseFloat(shiftTop, 10);
        shiftLeft = parseFloat(shiftLeft, 10);
      } else {
        var _ref2 = [shift.top, shift.left];
        shiftTop = _ref2[0];
        shiftLeft = _ref2[1];
      }

      top += shiftTop;
      left += shiftLeft;
      return {
        top: top,
        left: left
      };
    }
  });

  var _TetherBase$Utils$2 = TetherBase$1.Utils,
      getScrollParents$1 = _TetherBase$Utils$2.getScrollParents,
      getBounds$3 = _TetherBase$Utils$2.getBounds,
      getOffsetParent$1 = _TetherBase$Utils$2.getOffsetParent,
      extend$2 = _TetherBase$Utils$2.extend,
      defer$3 = _TetherBase$Utils$2.defer,
      flush$1 = _TetherBase$Utils$2.flush,
      getScrollBarSize$1 = _TetherBase$Utils$2.getScrollBarSize,
      removeUtilElements$1 = _TetherBase$Utils$2.removeUtilElements;

  function isFullscreenElement(e) {
    var d = e.ownerDocument;
    var fe = d.fullscreenElement || d.webkitFullscreenElement || d.mozFullScreenElement || d.msFullscreenElement;
    return fe === e;
  }

  function within(a, b, diff) {
    if (diff === void 0) {
      diff = 1;
    }

    return a + diff >= b && b >= a - diff;
  }

  var transformKey = function () {
    if (typeof document === 'undefined') {
      return '';
    }

    var el = document.createElement('div');
    var transforms = ['transform', 'WebkitTransform', 'OTransform', 'MozTransform', 'msTransform'];

    for (var i = 0; i < transforms.length; ++i) {
      var key = transforms[i];

      if (el.style[key] !== undefined) {
        return key;
      }
    }
  }();

  var tethers = [];

  var position = function position() {
    tethers.forEach(function (tether) {
      tether.position(false);
    });
    flush$1();
  };

  function now() {
    if (typeof performance === 'object' && typeof performance.now === 'function') {
      return performance.now();
    }

    return +new Date();
  }

  (function () {
    var lastCall = null;
    var lastDuration = null;
    var pendingTimeout = null;

    var tick = function tick() {
      if (typeof lastDuration !== 'undefined' && lastDuration > 16) {
        // We voluntarily throttle ourselves if we can't manage 60fps
        lastDuration = Math.min(lastDuration - 16, 250); // Just in case this is the last event, remember to position just once more

        pendingTimeout = setTimeout(tick, 250);
        return;
      }

      if (typeof lastCall !== 'undefined' && now() - lastCall < 10) {
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

    if (typeof window !== 'undefined' && typeof window.addEventListener !== 'undefined') {
      ['resize', 'scroll', 'touchmove'].forEach(function (event) {
        window.addEventListener(event, tick);
      });
    }
  })();

  var MIRROR_LR = {
    center: 'center',
    left: 'right',
    right: 'left'
  };
  var MIRROR_TB = {
    middle: 'middle',
    top: 'bottom',
    bottom: 'top'
  };
  var OFFSET_MAP = {
    top: 0,
    left: 0,
    middle: '50%',
    center: '50%',
    bottom: '100%',
    right: '100%'
  };

  var autoToFixedAttachment = function autoToFixedAttachment(attachment, relativeToAttachment) {
    var left = attachment.left,
        top = attachment.top;

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

  var attachmentToOffset = function attachmentToOffset(attachment) {
    var left = attachment.left,
        top = attachment.top;

    if (typeof OFFSET_MAP[attachment.left] !== 'undefined') {
      left = OFFSET_MAP[attachment.left];
    }

    if (typeof OFFSET_MAP[attachment.top] !== 'undefined') {
      top = OFFSET_MAP[attachment.top];
    }

    return {
      left: left,
      top: top
    };
  };

  function addOffset() {
    var out = {
      top: 0,
      left: 0
    };

    for (var _len = arguments.length, offsets = new Array(_len), _key = 0; _key < _len; _key++) {
      offsets[_key] = arguments[_key];
    }

    offsets.forEach(function (_ref) {
      var top = _ref.top,
          left = _ref.left;

      if (typeof top === 'string') {
        top = parseFloat(top, 10);
      }

      if (typeof left === 'string') {
        left = parseFloat(left, 10);
      }

      out.top += top;
      out.left += left;
    });
    return out;
  }

  function offsetToPx(offset, size) {
    if (typeof offset.left === 'string' && offset.left.indexOf('%') !== -1) {
      offset.left = parseFloat(offset.left, 10) / 100 * size.width;
    }

    if (typeof offset.top === 'string' && offset.top.indexOf('%') !== -1) {
      offset.top = parseFloat(offset.top, 10) / 100 * size.height;
    }

    return offset;
  }

  var parseOffset = function parseOffset(value) {
    var _value$split = value.split(' '),
        top = _value$split[0],
        left = _value$split[1];

    return {
      top: top,
      left: left
    };
  };

  var parseAttachment = parseOffset;

  var TetherClass =
  /*#__PURE__*/
  function (_Evented) {
    _inheritsLoose(TetherClass, _Evented);

    function TetherClass(options) {
      var _this;

      _this = _Evented.call(this) || this;
      _this.position = _this.position.bind(_assertThisInitialized(_this));
      tethers.push(_assertThisInitialized(_this));
      _this.history = [];

      _this.setOptions(options, false);

      TetherBase$1.modules.forEach(function (module) {
        if (typeof module.initialize !== 'undefined') {
          module.initialize.call(_assertThisInitialized(_this));
        }
      });

      _this.position();

      return _this;
    }

    var _proto = TetherClass.prototype;

    _proto.getClass = function getClass(key) {
      if (key === void 0) {
        key = '';
      }

      var classes = this.options.classes;

      if (typeof classes !== 'undefined' && classes[key]) {
        return this.options.classes[key];
      } else if (this.options.classPrefix) {
        return this.options.classPrefix + "-" + key;
      } else {
        return key;
      }
    };

    _proto.setOptions = function setOptions(options, pos) {
      var _this2 = this;

      if (pos === void 0) {
        pos = true;
      }

      var defaults = {
        offset: '0 0',
        targetOffset: '0 0',
        targetAttachment: 'auto auto',
        classPrefix: 'tether'
      };
      this.options = extend$2(defaults, options);
      var _this$options = this.options,
          element = _this$options.element,
          target = _this$options.target,
          targetModifier = _this$options.targetModifier;
      this.element = element;
      this.target = target;
      this.targetModifier = targetModifier;

      if (this.target === 'viewport') {
        this.target = document.body;
        this.targetModifier = 'visible';
      } else if (this.target === 'scroll-handle') {
        this.target = document.body;
        this.targetModifier = 'scroll-handle';
      }

      ['element', 'target'].forEach(function (key) {
        if (typeof _this2[key] === 'undefined') {
          throw new Error('Tether Error: Both element and target must be defined');
        }

        if (typeof _this2[key].jquery !== 'undefined') {
          _this2[key] = _this2[key][0];
        } else if (typeof _this2[key] === 'string') {
          _this2[key] = document.querySelector(_this2[key]);
        }
      });
      addClass(this.element, this.getClass('element'));

      if (!(this.options.addTargetClasses === false)) {
        addClass(this.target, this.getClass('target'));
      }

      if (!this.options.attachment) {
        throw new Error('Tether Error: You must provide an attachment');
      }

      this.targetAttachment = parseAttachment(this.options.targetAttachment);
      this.attachment = parseAttachment(this.options.attachment);
      this.offset = parseOffset(this.options.offset);
      this.targetOffset = parseOffset(this.options.targetOffset);

      if (typeof this.scrollParents !== 'undefined') {
        this.disable();
      }

      if (this.targetModifier === 'scroll-handle') {
        this.scrollParents = [this.target];
      } else {
        this.scrollParents = getScrollParents$1(this.target);
      }

      if (!(this.options.enabled === false)) {
        this.enable(pos);
      }
    };

    _proto.getTargetBounds = function getTargetBounds() {
      if (typeof this.targetModifier !== 'undefined') {
        if (this.targetModifier === 'visible') {
          if (this.target === document.body) {
            return {
              top: pageYOffset,
              left: pageXOffset,
              height: innerHeight,
              width: innerWidth
            };
          } else {
            var bounds = getBounds$3(this.target);
            var out = {
              height: bounds.height,
              width: bounds.width,
              top: bounds.top,
              left: bounds.left
            };
            out.height = Math.min(out.height, bounds.height - (pageYOffset - bounds.top));
            out.height = Math.min(out.height, bounds.height - (bounds.top + bounds.height - (pageYOffset + innerHeight)));
            out.height = Math.min(innerHeight, out.height);
            out.height -= 2;
            out.width = Math.min(out.width, bounds.width - (pageXOffset - bounds.left));
            out.width = Math.min(out.width, bounds.width - (bounds.left + bounds.width - (pageXOffset + innerWidth)));
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
        } else if (this.targetModifier === 'scroll-handle') {
          var _bounds;

          var target = this.target;

          if (target === document.body) {
            target = document.documentElement;
            _bounds = {
              left: pageXOffset,
              top: pageYOffset,
              height: innerHeight,
              width: innerWidth
            };
          } else {
            _bounds = getBounds$3(target);
          }

          var style = getComputedStyle(target);
          var hasBottomScroll = target.scrollWidth > target.clientWidth || [style.overflow, style.overflowX].indexOf('scroll') >= 0 || this.target !== document.body;
          var scrollBottom = 0;

          if (hasBottomScroll) {
            scrollBottom = 15;
          }

          var height = _bounds.height - parseFloat(style.borderTopWidth) - parseFloat(style.borderBottomWidth) - scrollBottom;
          var _out = {
            width: 15,
            height: height * 0.975 * (height / target.scrollHeight),
            left: _bounds.left + _bounds.width - parseFloat(style.borderLeftWidth) - 15
          };
          var fitAdj = 0;

          if (height < 408 && this.target === document.body) {
            fitAdj = -0.00011 * Math.pow(height, 2) - 0.00727 * height + 22.58;
          }

          if (this.target !== document.body) {
            _out.height = Math.max(_out.height, 24);
          }

          var scrollPercentage = this.target.scrollTop / (target.scrollHeight - height);
          _out.top = scrollPercentage * (height - _out.height - fitAdj) + _bounds.top + parseFloat(style.borderTopWidth);

          if (this.target === document.body) {
            _out.height = Math.max(_out.height, 24);
          }

          return _out;
        }
      } else {
        return getBounds$3(this.target);
      }
    };

    _proto.clearCache = function clearCache() {
      this._cache = {};
    };

    _proto.cache = function cache(k, getter) {
      // More than one module will often need the same DOM info, so
      // we keep a cache which is cleared on each position call
      if (typeof this._cache === 'undefined') {
        this._cache = {};
      }

      if (typeof this._cache[k] === 'undefined') {
        this._cache[k] = getter.call(this);
      }

      return this._cache[k];
    };

    _proto.enable = function enable(pos) {
      var _this3 = this;

      if (pos === void 0) {
        pos = true;
      }

      if (!(this.options.addTargetClasses === false)) {
        addClass(this.target, this.getClass('enabled'));
      }

      addClass(this.element, this.getClass('enabled'));
      this.enabled = true;
      this.scrollParents.forEach(function (parent) {
        if (parent !== _this3.target.ownerDocument) {
          parent.addEventListener('scroll', _this3.position);
        }
      });

      if (pos) {
        this.position();
      }
    };

    _proto.disable = function disable() {
      var _this4 = this;

      removeClass(this.target, this.getClass('enabled'));
      removeClass(this.element, this.getClass('enabled'));
      this.enabled = false;

      if (typeof this.scrollParents !== 'undefined') {
        this.scrollParents.forEach(function (parent) {
          parent.removeEventListener('scroll', _this4.position);
        });
      }
    };

    _proto.destroy = function destroy() {
      var _this5 = this;

      this.disable();
      tethers.forEach(function (tether, i) {
        if (tether === _this5) {
          tethers.splice(i, 1);
        }
      }); // Remove any elements we were using for convenience from the DOM

      if (tethers.length === 0) {
        removeUtilElements$1();
      }
    };

    _proto.updateAttachClasses = function updateAttachClasses(elementAttach, targetAttach) {
      var _this6 = this;

      elementAttach = elementAttach || this.attachment;
      targetAttach = targetAttach || this.targetAttachment;
      var sides = ['left', 'top', 'bottom', 'right', 'middle', 'center'];

      if (typeof this._addAttachClasses !== 'undefined' && this._addAttachClasses.length) {
        // updateAttachClasses can be called more than once in a position call, so
        // we need to clean up after ourselves such that when the last defer gets
        // ran it doesn't add any extra classes from previous calls.
        this._addAttachClasses.splice(0, this._addAttachClasses.length);
      }

      if (typeof this._addAttachClasses === 'undefined') {
        this._addAttachClasses = [];
      }

      var add = this._addAttachClasses;

      if (elementAttach.top) {
        add.push(this.getClass('element-attached') + "-" + elementAttach.top);
      }

      if (elementAttach.left) {
        add.push(this.getClass('element-attached') + "-" + elementAttach.left);
      }

      if (targetAttach.top) {
        add.push(this.getClass('target-attached') + "-" + targetAttach.top);
      }

      if (targetAttach.left) {
        add.push(this.getClass('target-attached') + "-" + targetAttach.left);
      }

      var all = [];
      sides.forEach(function (side) {
        all.push(_this6.getClass('element-attached') + "-" + side);
        all.push(_this6.getClass('target-attached') + "-" + side);
      });
      defer$3(function () {
        if (!(typeof _this6._addAttachClasses !== 'undefined')) {
          return;
        }

        updateClasses(_this6.element, _this6._addAttachClasses, all);

        if (!(_this6.options.addTargetClasses === false)) {
          updateClasses(_this6.target, _this6._addAttachClasses, all);
        }

        delete _this6._addAttachClasses;
      });
    };

    _proto.position = function position(flushChanges) {
      var _this7 = this;

      if (flushChanges === void 0) {
        flushChanges = true;
      }

      // flushChanges commits the changes immediately, leave true unless you are positioning multiple
      // tethers (in which case call Tether.Utils.flush yourself when you're done)
      if (!this.enabled) {
        return;
      }

      this.clearCache(); // Turn 'auto' attachments into the appropriate corner or edge

      var targetAttachment = autoToFixedAttachment(this.targetAttachment, this.attachment);
      this.updateAttachClasses(this.attachment, targetAttachment);
      var elementPos = this.cache('element-bounds', function () {
        return getBounds$3(_this7.element);
      });
      var width = elementPos.width,
          height = elementPos.height;

      if (width === 0 && height === 0 && typeof this.lastSize !== 'undefined') {
        // We cache the height and width to make it possible to position elements that are
        // getting hidden.
        var _this$lastSize = this.lastSize;
        width = _this$lastSize.width;
        height = _this$lastSize.height;
      } else {
        this.lastSize = {
          width: width,
          height: height
        };
      }

      var targetPos = this.cache('target-bounds', function () {
        return _this7.getTargetBounds();
      });
      var targetSize = targetPos; // Get an actual px offset from the attachment

      var offset = offsetToPx(attachmentToOffset(this.attachment), {
        width: width,
        height: height
      });
      var targetOffset = offsetToPx(attachmentToOffset(targetAttachment), targetSize);
      var manualOffset = offsetToPx(this.offset, {
        width: width,
        height: height
      });
      var manualTargetOffset = offsetToPx(this.targetOffset, targetSize); // Add the manually provided offset

      offset = addOffset(offset, manualOffset);
      targetOffset = addOffset(targetOffset, manualTargetOffset); // It's now our goal to make (element position + offset) == (target position + target offset)

      var left = targetPos.left + targetOffset.left - offset.left;
      var top = targetPos.top + targetOffset.top - offset.top;

      for (var i = 0; i < TetherBase$1.modules.length; ++i) {
        var module = TetherBase$1.modules[i];
        var ret = module.position.call(this, {
          left: left,
          top: top,
          targetAttachment: targetAttachment,
          targetPos: targetPos,
          elementPos: elementPos,
          offset: offset,
          targetOffset: targetOffset,
          manualOffset: manualOffset,
          manualTargetOffset: manualTargetOffset,
          scrollbarSize: scrollbarSize,
          attachment: this.attachment
        });

        if (ret === false) {
          return false;
        } else if (typeof ret === 'undefined' || typeof ret !== 'object') {
          continue;
        } else {
          top = ret.top;
          left = ret.left;
        }
      } // We describe the position three different ways to give the optimizer
      // a chance to decide the best possible way to position the element
      // with the fewest repaints.


      var next = {
        // It's position relative to the page (absolute positioning when
        // the element is a child of the body)
        page: {
          top: top,
          left: left
        },
        // It's position relative to the viewport (fixed positioning)
        viewport: {
          top: top - pageYOffset,
          bottom: pageYOffset - top - height + innerHeight,
          left: left - pageXOffset,
          right: pageXOffset - left - width + innerWidth
        }
      };
      var doc = this.target.ownerDocument;
      var win = doc.defaultView;
      var scrollbarSize;

      if (win.innerHeight > doc.documentElement.clientHeight) {
        scrollbarSize = this.cache('scrollbar-size', getScrollBarSize$1);
        next.viewport.bottom -= scrollbarSize.height;
      }

      if (win.innerWidth > doc.documentElement.clientWidth) {
        scrollbarSize = this.cache('scrollbar-size', getScrollBarSize$1);
        next.viewport.right -= scrollbarSize.width;
      }

      if (['', 'static'].indexOf(doc.body.style.position) === -1 || ['', 'static'].indexOf(doc.body.parentElement.style.position) === -1) {
        // Absolute positioning in the body will be relative to the page, not the 'initial containing block'
        next.page.bottom = doc.body.scrollHeight - top - height;
        next.page.right = doc.body.scrollWidth - left - width;
      }

      if (typeof this.options.optimizations !== 'undefined' && this.options.optimizations.moveElement !== false && !(typeof this.targetModifier !== 'undefined')) {
        var offsetParent = this.cache('target-offsetparent', function () {
          return getOffsetParent$1(_this7.target);
        });
        var offsetPosition = this.cache('target-offsetparent-bounds', function () {
          return getBounds$3(offsetParent);
        });
        var offsetParentStyle = getComputedStyle(offsetParent);
        var offsetParentSize = offsetPosition;
        var offsetBorder = {};
        ['Top', 'Left', 'Bottom', 'Right'].forEach(function (side) {
          offsetBorder[side.toLowerCase()] = parseFloat(offsetParentStyle["border" + side + "Width"]);
        });
        offsetPosition.right = doc.body.scrollWidth - offsetPosition.left - offsetParentSize.width + offsetBorder.right;
        offsetPosition.bottom = doc.body.scrollHeight - offsetPosition.top - offsetParentSize.height + offsetBorder.bottom;

        if (next.page.top >= offsetPosition.top + offsetBorder.top && next.page.bottom >= offsetPosition.bottom) {
          if (next.page.left >= offsetPosition.left + offsetBorder.left && next.page.right >= offsetPosition.right) {
            // We're within the visible part of the target's scroll parent
            var scrollLeft = offsetParent.scrollLeft,
                scrollTop = offsetParent.scrollTop; // It's position relative to the target's offset parent (absolute positioning when
            // the element is moved to be a child of the target's offset parent).

            next.offset = {
              top: next.page.top - offsetPosition.top + scrollTop - offsetBorder.top,
              left: next.page.left - offsetPosition.left + scrollLeft - offsetBorder.left
            };
          }
        }
      } // We could also travel up the DOM and try each containing context, rather than only
      // looking at the body, but we're gonna get diminishing returns.


      this.move(next);
      this.history.unshift(next);

      if (this.history.length > 3) {
        this.history.pop();
      }

      if (flushChanges) {
        flush$1();
      }

      return true;
    } // THE ISSUE
    ;

    _proto.move = function move(pos) {
      var _this8 = this;

      if (!(typeof this.element.parentNode !== 'undefined')) {
        return;
      }

      var same = {};

      for (var type in pos) {
        same[type] = {};

        for (var key in pos[type]) {
          var found = false;

          for (var i = 0; i < this.history.length; ++i) {
            var point = this.history[i];

            if (typeof point[type] !== 'undefined' && !within(point[type][key], pos[type][key])) {
              found = true;
              break;
            }
          }

          if (!found) {
            same[type][key] = true;
          }
        }
      }

      var css = {
        top: '',
        left: '',
        right: '',
        bottom: ''
      };

      var transcribe = function transcribe(_same, _pos) {
        var hasOptimizations = typeof _this8.options.optimizations !== 'undefined';
        var gpu = hasOptimizations ? _this8.options.optimizations.gpu : null;

        if (gpu !== false) {
          var yPos, xPos;

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

          if (typeof window.devicePixelRatio === 'number' && devicePixelRatio % 1 === 0) {
            xPos = Math.round(xPos * devicePixelRatio) / devicePixelRatio;
            yPos = Math.round(yPos * devicePixelRatio) / devicePixelRatio;
          }

          css[transformKey] = "translateX(" + xPos + "px) translateY(" + yPos + "px)";

          if (transformKey !== 'msTransform') {
            // The Z transform will keep this in the GPU (faster, and prevents artifacts),
            // but IE9 doesn't support 3d transforms and will choke.
            css[transformKey] += ' translateZ(0)';
          }
        } else {
          if (_same.top) {
            css.top = _pos.top + "px";
          } else {
            css.bottom = _pos.bottom + "px";
          }

          if (_same.left) {
            css.left = _pos.left + "px";
          } else {
            css.right = _pos.right + "px";
          }
        }
      };

      var hasOptimizations = typeof this.options.optimizations !== 'undefined';
      var allowPositionFixed = true;

      if (hasOptimizations && this.options.optimizations.allowPositionFixed === false) {
        allowPositionFixed = false;
      }

      var moved = false;

      if ((same.page.top || same.page.bottom) && (same.page.left || same.page.right)) {
        css.position = 'absolute';
        transcribe(same.page, pos.page);
      } else if (allowPositionFixed && (same.viewport.top || same.viewport.bottom) && (same.viewport.left || same.viewport.right)) {
        css.position = 'fixed';
        transcribe(same.viewport, pos.viewport);
      } else if (typeof same.offset !== 'undefined' && same.offset.top && same.offset.left) {
        css.position = 'absolute';
        var offsetParent = this.cache('target-offsetparent', function () {
          return getOffsetParent$1(_this8.target);
        });

        if (getOffsetParent$1(this.element) !== offsetParent) {
          defer$3(function () {
            _this8.element.parentNode.removeChild(_this8.element);

            offsetParent.appendChild(_this8.element);
          });
        }

        transcribe(same.offset, pos.offset);
        moved = true;
      } else {
        css.position = 'absolute';
        transcribe({
          top: true,
          left: true
        }, pos.page);
      }

      if (!moved) {
        if (this.options.bodyElement) {
          if (this.element.parentNode !== this.options.bodyElement) {
            this.options.bodyElement.appendChild(this.element);
          }
        } else {
          var offsetParentIsBody = true;
          var currentNode = this.element.parentNode;

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
      } // Any css change will trigger a repaint, so let's avoid one if nothing changed


      var writeCSS = {};
      var write = false;

      for (var _key2 in css) {
        var val = css[_key2];
        var elVal = this.element.style[_key2];

        if (elVal !== val) {
          write = true;
          writeCSS[_key2] = val;
        }
      }

      if (write) {
        defer$3(function () {
          extend$2(_this8.element.style, writeCSS);

          _this8.trigger('repositioned');
        });
      }
    };

    return TetherClass;
  }(Evented);

  TetherClass.modules = [];
  TetherBase$1.position = position;
  var Tether = extend$2(TetherClass, TetherBase$1);
  Tether.modules.push({
    initialize: function initialize() {
      var _this9 = this;

      this.markers = {};
      ['target', 'element'].forEach(function (type) {
        var el = document.createElement('div');
        el.className = _this9.getClass(type + "-marker");
        var dot = document.createElement('div');
        dot.className = _this9.getClass('marker-dot');
        el.appendChild(dot);

        _this9[type].appendChild(el);

        _this9.markers[type] = {
          dot: dot,
          el: el
        };
      });
    },
    position: function position(_ref2) {
      var manualOffset = _ref2.manualOffset,
          manualTargetOffset = _ref2.manualTargetOffset;
      var offsets = {
        element: manualOffset,
        target: manualTargetOffset
      };

      for (var type in offsets) {
        var offset = offsets[type];

        for (var side in offset) {
          var val = offset[side];
          var notString = typeof val !== 'string';

          if (notString || val.indexOf('%') === -1 && val.indexOf('px') === -1) {
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

  return Tether;

}));
//# sourceMappingURL=tether.js.map
