var BOUNDS_FORMAT, MIRROR_ATTACH, defer, extend, getBoundingRect, getBounds, getOuterSize, getSize, ref, updateClasses,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

ref = TetherBuilder.Utils, getOuterSize = ref.getOuterSize, getBounds = ref.getBounds, getSize = ref.getSize, extend = ref.extend, updateClasses = ref.updateClasses, defer = ref.defer;

MIRROR_ATTACH = {
  left: 'right',
  right: 'left',
  top: 'bottom',
  bottom: 'top',
  middle: 'middle'
};

BOUNDS_FORMAT = ['left', 'top', 'right', 'bottom'];

getBoundingRect = function(tether, to) {
  var i, j, len, pos, side, size, style;
  if (to === 'scrollParent') {
    to = tether.scrollParent;
  } else if (to === 'window') {
    to = [pageXOffset, pageYOffset, innerWidth + pageXOffset, innerHeight + pageYOffset];
  }
  if (to === document) {
    to = to.documentElement;
  }
  if (to.nodeType != null) {
    pos = size = getBounds(to);
    style = getComputedStyle(to);
    to = [pos.left, pos.top, size.width + pos.left, size.height + pos.top];
    for (i = j = 0, len = BOUNDS_FORMAT.length; j < len; i = ++j) {
      side = BOUNDS_FORMAT[i];
      side = side[0].toUpperCase() + side.substr(1);
      if (side === 'Top' || side === 'Left') {
        to[i] += parseFloat(style["border" + side + "Width"]);
      } else {
        to[i] -= parseFloat(style["border" + side + "Width"]);
      }
    }
  }
  return to;
};

TetherBuilder.modules.push({
  position: function(arg) {
    var addClasses, allClasses, attachment, bounds, changeAttachX, changeAttachY, cls, constraint, eAttachment, height, j, k, l, left, len, len1, len2, len3, len4, len5, m, n, o, oob, oobClass, p, pin, pinned, pinnedClass, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, removeClass, side, tAttachment, targetAttachment, targetHeight, targetSize, targetWidth, to, top, width;
    top = arg.top, left = arg.left, targetAttachment = arg.targetAttachment;
    if (!this.options.constraints) {
      return true;
    }
    removeClass = (function(_this) {
      return function(prefix) {
        var j, len, results, side;
        _this.removeClass(prefix);
        results = [];
        for (j = 0, len = BOUNDS_FORMAT.length; j < len; j++) {
          side = BOUNDS_FORMAT[j];
          results.push(_this.removeClass(prefix + "-" + side));
        }
        return results;
      };
    })(this);
    ref1 = this.cache('element-bounds', (function(_this) {
      return function() {
        return getBounds(_this.element);
      };
    })(this)), height = ref1.height, width = ref1.width;
    if (width === 0 && height === 0 && (this.lastSize != null)) {
      ref2 = this.lastSize, width = ref2.width, height = ref2.height;
    }
    targetSize = this.cache('target-bounds', (function(_this) {
      return function() {
        return _this.getTargetBounds();
      };
    })(this));
    targetHeight = targetSize.height;
    targetWidth = targetSize.width;
    tAttachment = {};
    eAttachment = {};
    allClasses = [this.getClass('pinned'), this.getClass('out-of-bounds')];
    ref3 = this.options.constraints;
    for (j = 0, len = ref3.length; j < len; j++) {
      constraint = ref3[j];
      if (constraint.outOfBoundsClass) {
        allClasses.push(constraint.outOfBoundsClass);
      }
      if (constraint.pinnedClass) {
        allClasses.push(constraint.pinnedClass);
      }
    }
    for (k = 0, len1 = allClasses.length; k < len1; k++) {
      cls = allClasses[k];
      ref4 = ['left', 'top', 'right', 'bottom'];
      for (l = 0, len2 = ref4.length; l < len2; l++) {
        side = ref4[l];
        allClasses.push(cls + "-" + side);
      }
    }
    addClasses = [];
    tAttachment = extend({}, targetAttachment);
    eAttachment = extend({}, this.attachment);
    ref5 = this.options.constraints;
    for (m = 0, len3 = ref5.length; m < len3; m++) {
      constraint = ref5[m];
      to = constraint.to, attachment = constraint.attachment, pin = constraint.pin;
      if (attachment == null) {
        attachment = '';
      }
      if (indexOf.call(attachment, ' ') >= 0) {
        ref6 = attachment.split(' '), changeAttachY = ref6[0], changeAttachX = ref6[1];
      } else {
        changeAttachX = changeAttachY = attachment;
      }
      bounds = getBoundingRect(this, to);
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
        pin = (function() {
          var len4, n, ref7, results;
          ref7 = pin.split(',');
          results = [];
          for (n = 0, len4 = ref7.length; n < len4; n++) {
            p = ref7[n];
            results.push(p.trim());
          }
          return results;
        })();
      } else if (pin === true) {
        pin = ['top', 'left', 'right', 'bottom'];
      }
      pin || (pin = []);
      pinned = [];
      oob = [];
      if (top < bounds[1]) {
        if (indexOf.call(pin, 'top') >= 0) {
          top = bounds[1];
          pinned.push('top');
        } else {
          oob.push('top');
        }
      }
      if (top + height > bounds[3]) {
        if (indexOf.call(pin, 'bottom') >= 0) {
          top = bounds[3] - height;
          pinned.push('bottom');
        } else {
          oob.push('bottom');
        }
      }
      if (left < bounds[0]) {
        if (indexOf.call(pin, 'left') >= 0) {
          left = bounds[0];
          pinned.push('left');
        } else {
          oob.push('left');
        }
      }
      if (left + width > bounds[2]) {
        if (indexOf.call(pin, 'right') >= 0) {
          left = bounds[2] - width;
          pinned.push('right');
        } else {
          oob.push('right');
        }
      }
      if (pinned.length) {
        pinnedClass = (ref7 = this.options.pinnedClass) != null ? ref7 : this.getClass('pinned');
        addClasses.push(pinnedClass);
        for (n = 0, len4 = pinned.length; n < len4; n++) {
          side = pinned[n];
          addClasses.push(pinnedClass + "-" + side);
        }
      }
      if (oob.length) {
        oobClass = (ref8 = this.options.outOfBoundsClass) != null ? ref8 : this.getClass('out-of-bounds');
        addClasses.push(oobClass);
        for (o = 0, len5 = oob.length; o < len5; o++) {
          side = oob[o];
          addClasses.push(oobClass + "-" + side);
        }
      }
      if (indexOf.call(pinned, 'left') >= 0 || indexOf.call(pinned, 'right') >= 0) {
        eAttachment.left = tAttachment.left = false;
      }
      if (indexOf.call(pinned, 'top') >= 0 || indexOf.call(pinned, 'bottom') >= 0) {
        eAttachment.top = tAttachment.top = false;
      }
      if (tAttachment.top !== targetAttachment.top || tAttachment.left !== targetAttachment.left || eAttachment.top !== this.attachment.top || eAttachment.left !== this.attachment.left) {
        this.updateAttachClasses(eAttachment, tAttachment);
      }
    }
    defer((function(_this) {
      return function() {
        if (_this.options.addTargetClasses !== false) {
          updateClasses(_this.target, addClasses, allClasses);
        }
        return updateClasses(_this.element, addClasses, allClasses);
      };
    })(this));
    return {
      top: top,
      left: left
    };
  }
});
