(function() {
  var $, MIRROR_ATTACH, getBounds,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  $ = jQuery;

  MIRROR_ATTACH = {
    left: 'right',
    right: 'left',
    top: 'bottom',
    bottom: 'top',
    middle: 'middle'
  };

  getBounds = function(tether, to) {
    var $to, pos;
    if (to === 'scrollParent') {
      to = tether.scrollParent[0];
    } else if (to === 'window') {
      to = [pageXOffset, pageYOffset, innerWidth + pageXOffset, innerHeight + pageYOffset];
    }
    if (to.nodeType != null) {
      $to = $(to);
      pos = $to.offset();
      to = [pos.left, pos.top, $to.outerWidth() + pos.left, $to.outerHeight() + pos.top];
    }
    return to;
  };

  Tether.modules.push({
    position: function(_arg) {
      var attachment, bounds, changeAttachX, changeAttachY, constraint, eAttachment, height, left, oob, p, pin, pinned, side, tAttachment, targetAttachment, targetHeight, targetWidth, to, top, width, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2;
      top = _arg.top, left = _arg.left, targetAttachment = _arg.targetAttachment;
      if (!this.options.constraints) {
        return;
      }
      height = this.$element.outerHeight();
      width = this.$element.outerWidth();
      targetHeight = this.$target.outerHeight();
      targetWidth = this.$target.outerWidth();
      tAttachment = {};
      eAttachment = {};
      this.removeClass('tether-pinned tether-out-of-bounds');
      _ref = ['left', 'right', 'top', 'bottom'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        side = _ref[_i];
        this.removeClass("tether-pinned-" + side + " tether-out-of-bounds-" + side);
      }
      _ref1 = this.options.constraints;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        constraint = _ref1[_j];
        to = constraint.to, attachment = constraint.attachment, pin = constraint.pin;
        if (attachment == null) {
          attachment = '';
        }
        if (__indexOf.call(attachment, ' ') >= 0) {
          _ref2 = attachment.split(' '), changeAttachY = _ref2[0], changeAttachX = _ref2[1];
        } else {
          changeAttachX = changeAttachY = attachment;
        }
        bounds = getBounds(this, to);
        if (changeAttachY === 'target' || changeAttachY === 'both') {
          if (top < bounds[1] && targetAttachment.top === 'top') {
            top += targetHeight;
            tAttachment.top = 'bottom';
          }
          if (top + height > bounds[3] && targetAttachment.top === 'bottom') {
            top -= targetHeight;
            tAttachment.top = 'top';
          }
        }
        if (changeAttachY === 'together') {
          if (top < bounds[1] && targetAttachment.top === 'top' && this.attachment.top === 'bottom') {
            top += targetHeight;
            tAttachment.top = 'bottom';
            top += height;
            eAttachment.top = 'top';
          }
          if (top + height > bounds[3] && targetAttachment.top === 'bottom' && this.attachment.top === 'top') {
            top -= targetHeight;
            tAttachment.top = 'top';
            top -= height;
            eAttachment.top = 'bottom';
          }
        }
        if (changeAttachX === 'target' || changeAttachX === 'both') {
          if (left < bounds[0] && targetAttachment.left === 'left') {
            left += targetWidth;
            tAttachment.left = 'right';
          }
          if (left + width > bounds[2] && targetAttachment.left === 'right') {
            left -= targetWidth;
            tAttachment.left = 'left';
          }
        }
        if (changeAttachX === 'together') {
          if (left < bounds[0] && targetAttachment.left === 'left' && this.attachment.left === 'right') {
            left += targetWidth;
            tAttachment.left = 'right';
            left += width;
            eAttachment.left = 'left';
          }
          if (left + width > bounds[2] && targetAttachment.left === 'right' && this.attachment.left === 'left') {
            left -= targetWidth;
            tAttachment.left = 'left';
            left -= width;
            eAttachment.left = 'right';
          }
        }
        if (changeAttachY === 'element' || changeAttachY === 'both') {
          if (top < bounds[1] && this.attachment.top === 'bottom') {
            top += height;
            eAttachment.top = 'top';
          }
          if (top + height > bounds[3] && this.attachment.top === 'top') {
            top -= height;
            eAttachment.top = 'bottom';
          }
        }
        if (changeAttachX === 'element' || changeAttachX === 'both') {
          if (left < bounds[0] && this.attachment.left === 'right') {
            left += width;
            eAttachment.left = 'left';
          }
          if (left + width > bounds[2] && this.attachment.left === 'left') {
            left -= width;
            eAttachment.left = 'right';
          }
        }
        if (typeof pin === 'string') {
          pin = (function() {
            var _k, _len2, _ref3, _results;
            _ref3 = pin.split(',');
            _results = [];
            for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
              p = _ref3[_k];
              _results.push(p.trim());
            }
            return _results;
          })();
        } else if (pin === true) {
          pin = ['top', 'left', 'right', 'bottom'];
        }
        pin || (pin = []);
        pinned = [];
        oob = [];
        if (top < bounds[1]) {
          if (__indexOf.call(pin, 'top') >= 0) {
            top = bounds[1];
            pinned.push('top');
          } else {
            oob.push('top');
          }
        }
        if (top + height > bounds[3]) {
          if (__indexOf.call(pin, 'bottom') >= 0) {
            top = bounds[3] - height;
            pinned.push('bottom');
          } else {
            oob.push('bottom');
          }
        }
        if (left < bounds[0]) {
          if (__indexOf.call(pin, 'left') >= 0) {
            left = bounds[0];
            pinned.push('left');
          } else {
            oob.push('left');
          }
        }
        if (left + width > bounds[2]) {
          if (__indexOf.call(pin, 'right') >= 0) {
            left = bounds[2] - width;
            pinned.push('right');
          } else {
            oob.push('right');
          }
        }
        if (pinned.length) {
          this.addClass('tether-pinned');
          for (_k = 0, _len2 = pinned.length; _k < _len2; _k++) {
            side = pinned[_k];
            this.addClass("tether-pinned-" + side);
          }
        }
        if (oob.length) {
          this.addClass('tether-out-of-bounds');
          for (_l = 0, _len3 = oob.length; _l < _len3; _l++) {
            side = oob[_l];
            this.addClass("tether-out-of-bounds-" + side);
          }
        }
        if (__indexOf.call(pinned, 'left') >= 0 || __indexOf.call(pinned, 'right') >= 0) {
          eAttachment.left = tAttachment.left = false;
        }
        if (__indexOf.call(pinned, 'top') >= 0 || __indexOf.call(pinned, 'bottom') >= 0) {
          eAttachment.top = tAttachment.top = false;
        }
        if ((tAttachment.top != null) || (tAttachment.left != null) || (eAttachment.top != null) || (eAttachment.left != null)) {
          this.updateAttachClasses($.extend({}, this.attachment, eAttachment), $.extend({}, targetAttachment, tAttachment));
        }
      }
      return {
        top: top,
        left: left
      };
    }
  });

}).call(this);
