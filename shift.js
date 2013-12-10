(function() {
  Tether.modules.push({
    position: function(_arg) {
      var left, shift, shiftLeft, shiftTop, top;
      top = _arg.top, left = _arg.left;
      if (!this.options.shift) {
        return;
      }
      shift = this.options.shift.split(' ');
      shift[1] || (shift[1] = shift[0]);
      shiftTop = shift[0], shiftLeft = shift[1];
      top += parseFloat(shiftTop, 10);
      left += parseFloat(shiftLeft, 10);
      return {
        top: top,
        left: left
      };
    }
  });

}).call(this);
