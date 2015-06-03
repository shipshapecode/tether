var MIRROR_LR, MIRROR_TB, OFFSET_MAP, Tether, TetherClass, addClass, addOffset, attachmentToOffset, autoToFixedAttachment, defer, extend, flush, getBounds, getOffsetParent, getOuterSize, getScrollBarSize, getScrollParent, getSize, now, offsetToPx, parseAttachment, parseOffset, position, ref, removeClass, tethers, transformKey, updateClasses, within,
  slice = [].slice,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

if (typeof TetherBuilder === "undefined" || TetherBuilder === null) {
  throw new Error("You must include the utils.js file before tether.js");
}

ref = TetherBuilder.Utils, getScrollParent = ref.getScrollParent, getSize = ref.getSize, getOuterSize = ref.getOuterSize, getBounds = ref.getBounds, getOffsetParent = ref.getOffsetParent, extend = ref.extend, addClass = ref.addClass, removeClass = ref.removeClass, updateClasses = ref.updateClasses, defer = ref.defer, flush = ref.flush, getScrollBarSize = ref.getScrollBarSize;

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
    ref1 = TetherBuilder.modules;
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
    ref2 = TetherBuilder.modules;
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

TetherBuilder.position = position;

Tether = extend(TetherClass, TetherBuilder);
