(function() {
  Tether.modules.push({
    position: function(_arg) {
      var left, result, shift, shiftLeft, shiftTop, top;
      top = _arg.top, left = _arg.left;
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
      shift = this.options.shift.split(' ');
      shift[1] || (shift[1] = shift[0]);
      shiftTop = shift[0], shiftLeft = shift[1];
      top += parseFloat(result(shiftTop, 10));
      left += parseFloat(result(shiftLeft, 10));
      return {
        top: top,
        left: left
      };
    }
  });

}).call(this);
