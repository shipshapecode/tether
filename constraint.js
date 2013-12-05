(function() {
  var MIRROR_ATTACH, constrain, getBounds;

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

  constrain = true;

  Tether.modules.push({
    position: function(_arg) {
      var bounds, changeAttachment, changeTargetAttachment, constraint, height, left, mirror, moved, pin, targetAttachment, targetHeight, targetWidth, to, top, width, _i, _len, _ref;
      top = _arg.top, left = _arg.left, targetAttachment = _arg.targetAttachment;
      if (!this.options.constraints) {
        return;
      }
      if (!constrain) {
        return;
      }
      moved = false;
      mirror = function(att, dimention) {
        moved = true;
        return att[dimention] = MIRROR_ATTACH[att[dimention]];
      };
      height = this.$element.outerHeight();
      width = this.$element.outerWidth();
      targetHeight = this.$target.outerHeight();
      targetWidth = this.$target.outerWidth();
      _ref = this.options.constraints;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        constraint = _ref[_i];
        to = constraint.to, changeAttachment = constraint.changeAttachment, changeTargetAttachment = constraint.changeTargetAttachment, pin = constraint.pin;
        bounds = getBounds(this, to);
        if (changeTargetAttachment) {
          if (top < bounds[1] && targetAttachment.top === 'top') {
            top += targetHeight;
          }
          if (top + height > bounds[3] && targetAttachment.top === 'bottom') {
            top -= targetHeight;
          }
          if (left < bounds[0] && targetAttachment.left === 'left') {
            left += targetWidth;
          }
          if (left + width > bounds[2] && targetAttachment.left === 'right') {
            left -= targetWidth;
          }
        }
        if (changeAttachment) {
          if (top < bounds[1] && this.attachment.top === 'bottom') {
            top += height;
          }
          if (top + height > bounds[3] && this.attachment.top === 'top') {
            top -= height;
          }
          if (left < bounds[0] && this.attachment.left === 'right') {
            left += width;
          }
          if (left + width > bounds[2] && this.attachment.left === 'left') {
            left -= width;
          }
        }
        if (pin) {
          top = Math.max(top, bounds[1]);
          if (top + height > bounds[3]) {
            top = bounds[3] - height;
          }
          left = Math.max(left, bounds[0]);
          if (left + width > bounds[2]) {
            left = bounds[2] - width;
          }
        }
      }
      return {
        top: top,
        left: left
      };
    }
  });

}).call(this);
