TetherBase.modules.push({
  initialize: function() {
    var dot, el, i, len, ref, results, type;
    this.markers = {};
    ref = ['target', 'element'];
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      type = ref[i];
      el = document.createElement('div');
      el.className = this.getClass(type + "-marker");
      dot = document.createElement('div');
      dot.className = this.getClass('marker-dot');
      el.appendChild(dot);
      this[type].appendChild(el);
      results.push(this.markers[type] = {
        dot: dot,
        el: el
      });
    }
    return results;
  },
  position: function(arg) {
    var manualOffset, manualTargetOffset, offset, offsets, side, type, val;
    manualOffset = arg.manualOffset, manualTargetOffset = arg.manualTargetOffset;
    offsets = {
      element: manualOffset,
      target: manualTargetOffset
    };
    for (type in offsets) {
      offset = offsets[type];
      for (side in offset) {
        val = offset[side];
        if (typeof val !== 'string' || (val.indexOf('%') === -1 && val.indexOf('px') === -1)) {
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
