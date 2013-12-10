(function() {
  var $;

  $ = jQuery;

  Tether.modules.push({
    position: function(_arg) {
      var abutted, bottom, height, left, right, side, sides, targetHeight, targetPos, targetWidth, top, width, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3;
      top = _arg.top, left = _arg.left;
      height = this.$element.outerHeight();
      width = this.$element.outerWidth();
      targetHeight = this.$target.outerHeight();
      targetWidth = this.$target.outerWidth();
      targetPos = this.$target.offset();
      targetPos.bottom = targetPos.top + targetHeight;
      targetPos.right = targetPos.left + targetWidth;
      bottom = top + height;
      right = left + width;
      abutted = [];
      if (top <= targetPos.bottom && bottom >= targetPos.top) {
        _ref = ['left', 'right'];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          side = _ref[_i];
          if ((_ref1 = targetPos[side]) === left || _ref1 === right) {
            abutted.push(side);
          }
        }
      }
      if (left <= targetPos.right && right >= targetPos.left) {
        _ref2 = ['top', 'bottom'];
        for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
          side = _ref2[_j];
          if ((_ref3 = targetPos[side]) === top || _ref3 === bottom) {
            abutted.push(side);
          }
        }
      }
      sides = ['left', 'top', 'right', 'bottom'];
      this.removeClass("tether-abutted");
      for (_k = 0, _len2 = sides.length; _k < _len2; _k++) {
        side = sides[_k];
        this.removeClass("tether-abutted-" + side);
      }
      if (abutted.length) {
        this.addClass("tether-abutted");
      }
      for (_l = 0, _len3 = abutted.length; _l < _len3; _l++) {
        side = abutted[_l];
        this.addClass("tether-abutted-" + side);
      }
      return true;
    }
  });

}).call(this);
