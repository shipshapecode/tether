import { getClass, updateClasses } from './utils/classes';
import { defer } from './utils/deferred';
import { getBounds } from './utils/bounds';

export default {
  position({ top, left }) {
    const { height, width } = this.cache('element-bounds', () => {
      return getBounds(this.element);
    });

    const targetPos = this.getTargetBounds();

    const bottom = top + height;
    const right = left + width;

    const abutted = [];
    if (top <= targetPos.bottom && bottom >= targetPos.top) {
      ['left', 'right'].forEach((side) => {
        const targetPosSide = targetPos[side];
        if (targetPosSide === left || targetPosSide === right) {
          abutted.push(side);
        }
      });
    }

    if (left <= targetPos.right && right >= targetPos.left) {
      ['top', 'bottom'].forEach((side) => {
        const targetPosSide = targetPos[side];
        if (targetPosSide === top || targetPosSide === bottom) {
          abutted.push(side);
        }
      });
    }

    const sides = ['left', 'top', 'right', 'bottom'];
    const { classes, classPrefix } = this.options;
    this.all.push(getClass('abutted', classes, classPrefix));
    sides.forEach((side) => {
      this.all.push(`${getClass('abutted', classes, classPrefix)}-${side}`);
    });

    if (abutted.length) {
      this.add.push(getClass('abutted', classes, classPrefix));
    }

    abutted.forEach((side) => {
      this.add.push(`${getClass('abutted', classes, classPrefix)}-${side}`);
    });

    defer(() => {
      if (!(this.options.addTargetClasses === false)) {
        updateClasses(this.target, this.add, this.all);
      }
      updateClasses(this.element, this.add, this.all);
    });

    return true;
  }
};
