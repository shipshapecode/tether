TetherBuilder.modules.push({
  position: function(arg) {
    var left, ref, result, shift, shiftLeft, shiftTop, top;
    top = arg.top, left = arg.left;
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
    shift = result(this.options.shift);
    if (typeof shift === 'string') {
      shift = shift.split(' ');
      shift[1] || (shift[1] = shift[0]);
      shiftTop = shift[0], shiftLeft = shift[1];
      shiftTop = parseFloat(shiftTop, 10);
      shiftLeft = parseFloat(shiftLeft, 10);
    } else {
      ref = [shift.top, shift.left], shiftTop = ref[0], shiftLeft = ref[1];
    }
    top += shiftTop;
    left += shiftLeft;
    return {
      top: top,
      left: left
    };
  }
});
