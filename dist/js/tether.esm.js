/*! tether 2.0.0-beta.5 */

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

/**
 * Checks if `value` is classified as a `Function` object.
 * @param {*} value The param to check if it is a function
 */
function isFunction(value) {
  return typeof value === 'function';
}
/**
 * Checks if `value` is classified as a `Number` object.
 * @param {*} value The param to check if it is a number
 */

function isNumber(value) {
  return typeof value === 'number';
}
/**
 * Checks if `value` is classified as an `Object`.
 * @param {*} value The param to check if it is an object
 */

function isObject(value) {
  return typeof value === 'object';
}
/**
 * Checks if `value` is classified as a `String` object.
 * @param {*} value The param to check if it is a string
 */

function isString(value) {
  return typeof value === 'string';
}
/**
 * Checks if `value` is undefined.
 * @param {*} value The param to check if it is undefined
 */

function isUndefined(value) {
  return value === undefined;
}

function addClass(el, name) {
  name.split(' ').forEach(function (cls) {
    if (cls.trim()) {
      el.classList.add(cls);
    }
  });
}
/**
 * Get class string based on previously determined classes
 * @param  {String} [key=''] - default value for the classes object
 * @param  {Object} classes
 * @param  {String} classPrefix
 */

function getClass(key, classes, classPrefix) {
  if (key === void 0) {
    key = '';
  }

  if (!isUndefined(classes) && !isUndefined(classes[key])) {
    if (classes[key] === false) {
      return '';
    }

    return classes[key];
  } else if (classPrefix) {
    return classPrefix + "-" + key;
  } else {
    return key;
  }
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

var deferred = [];
function defer(fn) {
  deferred.push(fn);
}
function flush() {
  var fn; // eslint-disable-next-line

  while (fn = deferred.pop()) {
    fn();
  }
}

var _scrollBarSize = null;
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
var uniqueId = function () {
  var id = 0;
  return function () {
    return ++id;
  };
}();

var zeroPosCache = {};
var zeroElement = null;
function getBounds(body, el) {
  var doc;

  if (el === document) {
    doc = document;
    el = document.documentElement;
  } else {
    doc = el.ownerDocument;
  }

  var docEl = doc.documentElement;

  var box = _getActualBoundingClientRect(el);

  var origin = _getOrigin(body);

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

function getScrollHandleBounds(body, target) {
  var bounds; // We have to do the check for the scrollTop and if target === document.body here and set to variables
  // because we may reset target below.

  var targetScrollTop = target.scrollTop;
  var targetIsBody = target === document.body;

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

  var style = getComputedStyle(target);
  var hasBottomScroll = target.scrollWidth > target.clientWidth || [style.overflow, style.overflowX].indexOf('scroll') >= 0 || !targetIsBody;
  var scrollBottom = 0;

  if (hasBottomScroll) {
    scrollBottom = 15;
  }

  var height = bounds.height - parseFloat(style.borderTopWidth) - parseFloat(style.borderBottomWidth) - scrollBottom;
  var out = {
    width: 15,
    height: height * 0.975 * (height / target.scrollHeight),
    left: bounds.left + bounds.width - parseFloat(style.borderLeftWidth) - 15
  };
  var fitAdj = 0;

  if (height < 408 && targetIsBody) {
    fitAdj = -0.00011 * Math.pow(height, 2) - 0.00727 * height + 22.58;
  }

  if (!targetIsBody) {
    out.height = Math.max(out.height, 24);
  }

  var scrollPercentage = targetScrollTop / (target.scrollHeight - height);
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

function getVisibleBounds(body, target) {
  if (target === document.body) {
    return {
      top: pageYOffset,
      left: pageXOffset,
      height: innerHeight,
      width: innerWidth
    };
  } else {
    var bounds = getBounds(body, target);
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
}
function removeUtilElements(body) {
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
        var frameRect = _getActualBoundingClientRect(frameElement);

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

function _getOrigin(body) {
  // getBoundingClientRect is unfortunately too accurate.  It introduces a pixel or two of
  // jitter as the user scrolls that messes with our ability to detect if two positions
  // are equivilant or not.  We place an element at the top left of the page that will
  // get the same jitter, so we can cancel the two out.
  var node = zeroElement;

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

  var id = node.getAttribute('data-tether-id');

  if (isUndefined(zeroPosCache[id])) {
    zeroPosCache[id] = _getActualBoundingClientRect(node); // Clear the cache when this position call is done

    defer(function () {
      delete zeroPosCache[id];
    });
  }

  return zeroPosCache[id];
}

var Abutment = {
  position: function position(_ref) {
    var _this = this;

    var top = _ref.top,
        left = _ref.left;

    var _this$cache = this.cache('element-bounds', function () {
      return getBounds(_this.element);
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

    var sides = ['left', 'top', 'right', 'bottom'];
    var _this$options = this.options,
        classes = _this$options.classes,
        classPrefix = _this$options.classPrefix;
    this.all.push(getClass('abutted', classes, classPrefix));
    sides.forEach(function (side) {
      _this.all.push(getClass('abutted', classes, classPrefix) + "-" + side);
    });

    if (abutted.length) {
      this.add.push(getClass('abutted', classes, classPrefix));
    }

    abutted.forEach(function (side) {
      _this.add.push(getClass('abutted', classes, classPrefix) + "-" + side);
    });
    defer(function () {
      if (!(_this.options.addTargetClasses === false)) {
        updateClasses(_this.target, _this.add, _this.all);
      }

      updateClasses(_this.element, _this.add, _this.all);
    });
    return true;
  }
};

var BOUNDS_FORMAT = ['left', 'top', 'right', 'bottom'];
/**
 * Returns an array of bounds of the format [left, top, right, bottom]
 * @param tether
 * @param to
 * @return {*[]|HTMLElement|ActiveX.IXMLDOMElement}
 */

function getBoundingRect(body, tether, to) {
  // arg to is required
  if (!to) {
    return null;
  }

  if (to === 'scrollParent') {
    to = tether.scrollParents[0];
  } else if (to === 'window') {
    to = [pageXOffset, pageYOffset, innerWidth + pageXOffset, innerHeight + pageYOffset];
  }

  if (to === document) {
    to = to.documentElement;
  }

  if (!isUndefined(to.nodeType)) {
    var node = to;
    var size = getBounds(body, to);
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
/**
 * Add out of bounds classes to the list of classes we add to tether
 * @param {string[]} oob An array of directions that are out of bounds
 * @param {string[]} addClasses The array of classes to add to Tether
 * @param {string[]} classes The array of class types for Tether
 * @param {string} classPrefix The prefix to add to the front of the class
 * @param {string} outOfBoundsClass The class to apply when out of bounds
 * @private
 */


function _addOutOfBoundsClass(oob, addClasses, classes, classPrefix, outOfBoundsClass) {
  if (oob.length) {
    var oobClass;

    if (!isUndefined(outOfBoundsClass)) {
      oobClass = outOfBoundsClass;
    } else {
      oobClass = getClass('out-of-bounds', classes, classPrefix);
    }

    addClasses.push(oobClass);
    oob.forEach(function (side) {
      addClasses.push(oobClass + "-" + side);
    });
  }
}
/**
 * Calculates if out of bounds or pinned in the X direction.
 *
 * @param {number} left
 * @param {number[]} bounds Array of bounds of the format [left, top, right, bottom]
 * @param {number} width
 * @param pin
 * @param pinned
 * @param {string[]} oob
 * @return {number}
 * @private
 */


function _calculateOOBAndPinnedLeft(left, bounds, width, pin, pinned, oob) {
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

  return left;
}
/**
 * Calculates if out of bounds or pinned in the Y direction.
 *
 * @param {number} top
 * @param {number[]} bounds Array of bounds of the format [left, top, right, bottom]
 * @param {number} height
 * @param pin
 * @param {string[]} pinned
 * @param {string[]} oob
 * @return {number}
 * @private
 */


function _calculateOOBAndPinnedTop(top, bounds, height, pin, pinned, oob) {
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

  return top;
}
/**
 * Flip X "together"
 * @param {object} tAttachment The target attachment
 * @param {object} eAttachment The element attachment
 * @param {number[]} bounds Array of bounds of the format [left, top, right, bottom]
 * @param {number} width
 * @param targetWidth
 * @param {number} left
 * @private
 */


function _flipXTogether(tAttachment, eAttachment, bounds, width, targetWidth, left) {
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

  return left;
}
/**
 * Flip Y "together"
 * @param {object} tAttachment The target attachment
 * @param {object} eAttachment The element attachment
 * @param {number[]} bounds Array of bounds of the format [left, top, right, bottom]
 * @param {number} height
 * @param targetHeight
 * @param {number} top
 * @private
 */


function _flipYTogether(tAttachment, eAttachment, bounds, height, targetHeight, top) {
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

  return top;
}
/**
 * Get all the initial classes
 * @param classes
 * @param {string} classPrefix
 * @param constraints
 * @return {[*, *]}
 * @private
 */


function _getAllClasses(classes, classPrefix, constraints) {
  var allClasses = [getClass('pinned', classes, classPrefix), getClass('out-of-bounds', classes, classPrefix)];
  constraints.forEach(function (constraint) {
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
  return allClasses;
}

var Constraint = {
  position: function position(_ref) {
    var _this = this;

    var top = _ref.top,
        left = _ref.left,
        targetAttachment = _ref.targetAttachment;

    if (!this.options.constraints) {
      return true;
    }

    var _this$cache = this.cache('element-bounds', function () {
      return getBounds(_this.bodyElement, _this.element);
    }),
        height = _this$cache.height,
        width = _this$cache.width;

    if (width === 0 && height === 0 && !isUndefined(this.lastSize)) {
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
    var _this$options = this.options,
        classes = _this$options.classes,
        classPrefix = _this$options.classPrefix;

    var allClasses = _getAllClasses(classes, classPrefix, this.options.constraints);

    var addClasses = [];
    var tAttachment = extend({}, targetAttachment);
    var eAttachment = extend({}, this.attachment);
    this.options.constraints.forEach(function (constraint) {
      var to = constraint.to,
          attachment = constraint.attachment,
          pin = constraint.pin;

      if (isUndefined(attachment)) {
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

      var bounds = getBoundingRect(_this.bodyElement, _this, to);

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
        top = _flipYTogether(tAttachment, eAttachment, bounds, height, targetHeight, top);
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
        left = _flipXTogether(tAttachment, eAttachment, bounds, width, targetWidth, left);
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

      if (isString(pin)) {
        pin = pin.split(',').map(function (p) {
          return p.trim();
        });
      } else if (pin === true) {
        pin = ['top', 'left', 'right', 'bottom'];
      }

      pin = pin || [];
      var pinned = [];
      var oob = [];
      left = _calculateOOBAndPinnedLeft(left, bounds, width, pin, pinned, oob);
      top = _calculateOOBAndPinnedTop(top, bounds, height, pin, pinned, oob);

      if (pinned.length) {
        var pinnedClass;

        if (!isUndefined(_this.options.pinnedClass)) {
          pinnedClass = _this.options.pinnedClass;
        } else {
          pinnedClass = getClass('pinned', classes, classPrefix);
        }

        addClasses.push(pinnedClass);
        pinned.forEach(function (side) {
          addClasses.push(pinnedClass + "-" + side);
        });
      }

      _addOutOfBoundsClass(oob, addClasses, classes, classPrefix, _this.options.outOfBoundsClass);

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
    defer(function () {
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
};

var Shift = {
  position: function position(_ref) {
    var top = _ref.top,
        left = _ref.left;

    if (!this.options.shift) {
      return;
    }

    var shift = this.options.shift;

    if (isFunction(shift)) {
      shift = shift.call(this, {
        top: top,
        left: left
      });
    }

    var shiftTop, shiftLeft;

    if (isString(shift)) {
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
};

var Evented =
/*#__PURE__*/
function () {
  function Evented() {}

  var _proto = Evented.prototype;

  _proto.on = function on(event, handler, ctx, once) {
    if (once === void 0) {
      once = false;
    }

    if (isUndefined(this.bindings)) {
      this.bindings = {};
    }

    if (isUndefined(this.bindings[event])) {
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
    var _this = this;

    if (isUndefined(this.bindings) || isUndefined(this.bindings[event])) {
      return this;
    }

    if (isUndefined(handler)) {
      delete this.bindings[event];
    } else {
      this.bindings[event].forEach(function (binding, index) {
        if (binding.handler === handler) {
          _this.bindings[event].splice(index, 1);
        }
      });
    }

    return this;
  };

  _proto.trigger = function trigger(event) {
    var _this2 = this;

    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    if (!isUndefined(this.bindings) && this.bindings[event]) {
      this.bindings[event].forEach(function (binding, index) {
        var ctx = binding.ctx,
            handler = binding.handler,
            once = binding.once;
        var context = ctx || _this2;
        handler.apply(context, args);

        if (once) {
          _this2.bindings[event].splice(index, 1);
        }
      });
    }

    return this;
  };

  return Evented;
}();

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

    if (isString(top)) {
      top = parseFloat(top);
    }

    if (isString(left)) {
      left = parseFloat(left);
    }

    out.top += top;
    out.left += left;
  });
  return out;
}
function attachmentToOffset(attachment) {
  var left = attachment.left,
      top = attachment.top;

  if (!isUndefined(OFFSET_MAP[attachment.left])) {
    left = OFFSET_MAP[attachment.left];
  }

  if (!isUndefined(OFFSET_MAP[attachment.top])) {
    top = OFFSET_MAP[attachment.top];
  }

  return {
    left: left,
    top: top
  };
}
function autoToFixedAttachment(attachment, relativeToAttachment) {
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
}
function offsetToPx(offset, size) {
  if (isString(offset.left) && offset.left.indexOf('%') !== -1) {
    offset.left = parseFloat(offset.left) / 100 * size.width;
  }

  if (isString(offset.top) && offset.top.indexOf('%') !== -1) {
    offset.top = parseFloat(offset.top) / 100 * size.height;
  }

  return offset;
}
function parseTopLeft(value) {
  var _value$split = value.split(' '),
      top = _value$split[0],
      left = _value$split[1];

  return {
    top: top,
    left: left
  };
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

    if (isUndefined(style) || style === null) {
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
function getOffsetParent(el) {
  return el.offsetParent || document.documentElement;
}

var TetherBase = {
  modules: [Constraint, Abutment, Shift]
};

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
  if (isUndefined(document)) {
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
  flush();
};

function now() {
  return performance.now();
}

(function () {
  var lastCall = null;
  var lastDuration = null;
  var pendingTimeout = null;

  var tick = function tick() {
    if (!isUndefined(lastDuration) && lastDuration > 16) {
      // We voluntarily throttle ourselves if we can't manage 60fps
      lastDuration = Math.min(lastDuration - 16, 250); // Just in case this is the last event, remember to position just once more

      pendingTimeout = setTimeout(tick, 250);
      return;
    }

    if (!isUndefined(lastCall) && now() - lastCall < 10) {
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
    ['resize', 'scroll', 'touchmove'].forEach(function (event) {
      window.addEventListener(event, tick);
    });
  }
})();

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

    TetherBase.modules.forEach(function (module) {
      if (!isUndefined(module.initialize)) {
        module.initialize.call(_assertThisInitialized(_this));
      }
    });

    _this.position();

    return _this;
  }

  var _proto = TetherClass.prototype;

  _proto.setOptions = function setOptions(options, pos) {
    var _this2 = this;

    if (pos === void 0) {
      pos = true;
    }

    var defaults = {
      offset: '0 0',
      targetOffset: '0 0',
      targetAttachment: 'auto auto',
      classPrefix: 'tether',
      bodyElement: document.body
    };
    this.options = extend(defaults, options);
    var _this$options = this.options,
        element = _this$options.element,
        target = _this$options.target,
        targetModifier = _this$options.targetModifier,
        bodyElement = _this$options.bodyElement;
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

    ['element', 'target'].forEach(function (key) {
      if (isUndefined(_this2[key])) {
        throw new Error('Tether Error: Both element and target must be defined');
      }

      if (!isUndefined(_this2[key].jquery)) {
        _this2[key] = _this2[key][0];
      } else if (isString(_this2[key])) {
        _this2[key] = document.querySelector(_this2[key]);
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
  };

  _proto.getTargetBounds = function getTargetBounds() {
    if (!isUndefined(this.targetModifier)) {
      if (this.targetModifier === 'visible') {
        return getVisibleBounds(this.bodyElement, this.target);
      } else if (this.targetModifier === 'scroll-handle') {
        return getScrollHandleBounds(this.bodyElement, this.target);
      }
    } else {
      return getBounds(this.bodyElement, this.target);
    }
  };

  _proto.clearCache = function clearCache() {
    this._cache = {};
  };

  _proto.cache = function cache(k, getter) {
    // More than one module will often need the same DOM info, so
    // we keep a cache which is cleared on each position call
    if (isUndefined(this._cache)) {
      this._cache = {};
    }

    if (isUndefined(this._cache[k])) {
      this._cache[k] = getter.call(this);
    }

    return this._cache[k];
  };

  _proto.enable = function enable(pos) {
    var _this3 = this;

    if (pos === void 0) {
      pos = true;
    }

    var _this$options2 = this.options,
        classes = _this$options2.classes,
        classPrefix = _this$options2.classPrefix;

    if (!(this.options.addTargetClasses === false)) {
      addClass(this.target, getClass('enabled', classes, classPrefix));
    }

    addClass(this.element, getClass('enabled', classes, classPrefix));
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

    var _this$options3 = this.options,
        classes = _this$options3.classes,
        classPrefix = _this$options3.classPrefix;
    removeClass(this.target, getClass('enabled', classes, classPrefix));
    removeClass(this.element, getClass('enabled', classes, classPrefix));
    this.enabled = false;

    if (!isUndefined(this.scrollParents)) {
      this.scrollParents.forEach(function (parent) {
        parent.removeEventListener('scroll', _this4.position);
      });
    }
  };

  _proto.destroy = function destroy() {
    var _this5 = this;

    this.disable();

    this._removeClasses();

    tethers.forEach(function (tether, i) {
      if (tether === _this5) {
        tethers.splice(i, 1);
      }
    }); // Remove any elements we were using for convenience from the DOM

    if (tethers.length === 0) {
      removeUtilElements(this.bodyElement);
    }
  };

  _proto.updateAttachClasses = function updateAttachClasses(elementAttach, targetAttach) {
    var _this6 = this;

    elementAttach = elementAttach || this.attachment;
    targetAttach = targetAttach || this.targetAttachment;
    var sides = ['left', 'top', 'bottom', 'right', 'middle', 'center'];
    var _this$options4 = this.options,
        classes = _this$options4.classes,
        classPrefix = _this$options4.classPrefix;

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
      this.add.push(getClass('element-attached', classes, classPrefix) + "-" + elementAttach.top);
    }

    if (elementAttach.left) {
      this.add.push(getClass('element-attached', classes, classPrefix) + "-" + elementAttach.left);
    }

    if (targetAttach.top) {
      this.add.push(getClass('target-attached', classes, classPrefix) + "-" + targetAttach.top);
    }

    if (targetAttach.left) {
      this.add.push(getClass('target-attached', classes, classPrefix) + "-" + targetAttach.left);
    }

    this.all = [];
    sides.forEach(function (side) {
      _this6.all.push(getClass('element-attached', classes, classPrefix) + "-" + side);

      _this6.all.push(getClass('target-attached', classes, classPrefix) + "-" + side);
    });
    defer(function () {
      if (isUndefined(_this6._addAttachClasses)) {
        return;
      }

      updateClasses(_this6.element, _this6._addAttachClasses, _this6.all);

      if (!(_this6.options.addTargetClasses === false)) {
        updateClasses(_this6.target, _this6._addAttachClasses, _this6.all);
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
      return getBounds(_this7.bodyElement, _this7.element);
    });
    var width = elementPos.width,
        height = elementPos.height;

    if (width === 0 && height === 0 && !isUndefined(this.lastSize)) {
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

    for (var i = 0; i < TetherBase.modules.length; ++i) {
      var module = TetherBase.modules[i];
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
      } else if (isUndefined(ret) || !isObject(ret)) {
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
      scrollbarSize = this.cache('scrollbar-size', getScrollBarSize);
      next.viewport.bottom -= scrollbarSize.height;
    }

    if (win.innerWidth > doc.documentElement.clientWidth) {
      scrollbarSize = this.cache('scrollbar-size', getScrollBarSize);
      next.viewport.right -= scrollbarSize.width;
    }

    if (['', 'static'].indexOf(doc.body.style.position) === -1 || ['', 'static'].indexOf(doc.body.parentElement.style.position) === -1) {
      // Absolute positioning in the body will be relative to the page, not the 'initial containing block'
      next.page.bottom = doc.body.scrollHeight - top - height;
      next.page.right = doc.body.scrollWidth - left - width;
    }

    if (!isUndefined(this.options.optimizations) && this.options.optimizations.moveElement !== false && isUndefined(this.targetModifier)) {
      var offsetParent = this.cache('target-offsetparent', function () {
        return getOffsetParent(_this7.target);
      });
      var offsetPosition = this.cache('target-offsetparent-bounds', function () {
        return getBounds(_this7.bodyElement, offsetParent);
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
      flush();
    }

    return true;
  } // THE ISSUE
  ;

  _proto.move = function move(pos) {
    var _this8 = this;

    if (isUndefined(this.element.parentNode)) {
      return;
    }

    var same = {};

    for (var type in pos) {
      same[type] = {};

      for (var key in pos[type]) {
        var found = false;

        for (var i = 0; i < this.history.length; ++i) {
          var point = this.history[i];

          if (!isUndefined(point[type]) && !within(point[type][key], pos[type][key])) {
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
      var hasOptimizations = !isUndefined(_this8.options.optimizations);
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

        if (isNumber(window.devicePixelRatio) && devicePixelRatio % 1 === 0) {
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

    var hasOptimizations = !isUndefined(this.options.optimizations);
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
    } else if (!isUndefined(same.offset) && same.offset.top && same.offset.left) {
      css.position = 'absolute';
      var offsetParent = this.cache('target-offsetparent', function () {
        return getOffsetParent(_this8.target);
      });

      if (getOffsetParent(this.element) !== offsetParent) {
        defer(function () {
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

    for (var _key in css) {
      var val = css[_key];
      var elVal = this.element.style[_key];

      if (elVal !== val) {
        write = true;
        writeCSS[_key] = val;
      }
    }

    if (write) {
      defer(function () {
        extend(_this8.element.style, writeCSS);

        _this8.trigger('repositioned');
      });
    }
  };

  _proto._addClasses = function _addClasses() {
    var _this$options5 = this.options,
        classes = _this$options5.classes,
        classPrefix = _this$options5.classPrefix;
    addClass(this.element, getClass('element', classes, classPrefix));

    if (!(this.options.addTargetClasses === false)) {
      addClass(this.target, getClass('target', classes, classPrefix));
    }
  };

  _proto._removeClasses = function _removeClasses() {
    var _this9 = this;

    var _this$options6 = this.options,
        classes = _this$options6.classes,
        classPrefix = _this$options6.classPrefix;
    removeClass(this.element, getClass('element', classes, classPrefix));

    if (!(this.options.addTargetClasses === false)) {
      removeClass(this.target, getClass('target', classes, classPrefix));
    }

    this.all.forEach(function (className) {
      _this9.element.classList.remove(className);

      _this9.target.classList.remove(className);
    });
  };

  return TetherClass;
}(Evented);

TetherClass.modules = [];
TetherBase.position = position;
var Tether = extend(TetherClass, TetherBase);
Tether.modules.push({
  initialize: function initialize() {
    var _this10 = this;

    var _this$options7 = this.options,
        classes = _this$options7.classes,
        classPrefix = _this$options7.classPrefix;
    this.markers = {};
    ['target', 'element'].forEach(function (type) {
      var el = document.createElement('div');
      el.className = getClass(type + "-marker", classes, classPrefix);
      var dot = document.createElement('div');
      dot.className = getClass('marker-dot', classes, classPrefix);
      el.appendChild(dot);

      _this10[type].appendChild(el);

      _this10.markers[type] = {
        dot: dot,
        el: el
      };
    });
  },
  position: function position(_ref) {
    var manualOffset = _ref.manualOffset,
        manualTargetOffset = _ref.manualTargetOffset;
    var offsets = {
      element: manualOffset,
      target: manualTargetOffset
    };

    for (var type in offsets) {
      var offset = offsets[type];

      for (var side in offset) {
        var val = offset[side];

        if (!isString(val) || val.indexOf('%') === -1 && val.indexOf('px') === -1) {
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
//# sourceMappingURL=tether.esm.js.map
