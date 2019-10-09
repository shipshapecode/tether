import { getClass } from './utils/classes';
import { isString } from './utils/type-check';

export default {
  initialize() {
    this.markers = {};

    ['target', 'element'].forEach((type) => {
      const el = document.createElement('div');

      el.className = getClass.call(this, `${type}-marker`);

      const dot = document.createElement('div');
      dot.className = getClass.call(this, 'marker-dot');
      el.appendChild(dot);

      this[type].appendChild(el);

      this.markers[type] = { dot, el };
    });

    return this;
  },

  position({ manualOffset, manualTargetOffset }) {
    const offsets = {
      element: manualOffset,
      target: manualTargetOffset
    };

    for (let type in offsets) {
      const offset = offsets[type];
      for (let side in offset) {
        let val = offset[side];
        if (!isString(val) ||
          val.indexOf('%') === -1 &&
          val.indexOf('px') === -1) {
          val += 'px';
        }

        if (this.markers[type].dot.style[side] !== val) {
          this.markers[type].dot.style[side] = val;
        }
      }
    }

    return true;
  }
};