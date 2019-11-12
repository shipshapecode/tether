import { getClass, updateClasses } from './utils/classes';
import { defer } from './utils/deferred';
import { extend } from './utils/general';
import { getBounds } from './utils/bounds';
import { isString, isUndefined } from './utils/type-check';

const BOUNDS_FORMAT = ['left', 'top', 'right', 'bottom'];

/**
 * Returns an array of bounds of the format [left, top, right, bottom]
 * @param tether
 * @param to
 * @return {*[]|HTMLElement|ActiveX.IXMLDOMElement}
 */
function getBoundingRect(body, tether, to) {
  // arg to is required
  if (!to) {
    return null;
  }
  if (to === 'scrollParent') {
    to = tether.scrollParents[0];
  } else if (to === 'window') {
    to = [pageXOffset, pageYOffset, innerWidth + pageXOffset, innerHeight + pageYOffset];
  }

  if (to === document) {
    to = to.documentElement;
  }

  if (!isUndefined(to.nodeType)) {
    const node = to;
    const size = getBounds(body, to);
    const pos = size;
    const style = getComputedStyle(to);

    to = [pos.left, pos.top, size.width + pos.left, size.height + pos.top];

    // Account any parent Frames scroll offset
    if (node.ownerDocument !== document) {
      let win = node.ownerDocument.defaultView;
      to[0] += win.pageXOffset;
      to[1] += win.pageYOffset;
      to[2] += win.pageXOffset;
      to[3] += win.pageYOffset;
    }

    BOUNDS_FORMAT.forEach((side, i) => {
      side = side[0].toUpperCase() + side.substr(1);
      if (side === 'Top' || side === 'Left') {
        to[i] += parseFloat(style[`border${side}Width`]);
      } else {
        to[i] -= parseFloat(style[`border${side}Width`]);
      }
    });
  }

  return to;
}

/**
 * Add out of bounds classes to the list of classes we add to tether
 * @param {string[]} oob An array of directions that are out of bounds
 * @param {string[]} addClasses The array of classes to add to Tether
 * @param {string[]} classes The array of class types for Tether
 * @param {string} classPrefix The prefix to add to the front of the class
 * @param {string} outOfBoundsClass The class to apply when out of bounds
 * @private
 */
function _addOutOfBoundsClass(oob, addClasses, classes, classPrefix, outOfBoundsClass) {
  if (oob.length) {
    let oobClass;
    if (!isUndefined(outOfBoundsClass)) {
      oobClass = outOfBoundsClass;
    } else {
      oobClass = getClass('out-of-bounds', classes, classPrefix);
    }

    addClasses.push(oobClass);
    oob.forEach((side) => {
      addClasses.push(`${oobClass}-${side}`);
    });
  }
}

/**
 * Calculates if out of bounds or pinned in the X direction.
 *
 * @param {number} left
 * @param {number[]} bounds Array of bounds of the format [left, top, right, bottom]
 * @param {number} width
 * @param pin
 * @param pinned
 * @param {string[]} oob
 * @return {number}
 * @private
 */
function _calculateOOBAndPinnedLeft(left, bounds, width, pin, pinned, oob) {
  if (left < bounds[0]) {
    if (pin.indexOf('left') >= 0) {
      left = bounds[0];
      pinned.push('left');
    } else {
      oob.push('left');
    }
  }

  if (left + width > bounds[2]) {
    if (pin.indexOf('right') >= 0) {
      left = bounds[2] - width;
      pinned.push('right');
    } else {
      oob.push('right');
    }
  }

  return left;
}

/**
 * Calculates if out of bounds or pinned in the Y direction.
 *
 * @param {number} top
 * @param {number[]} bounds Array of bounds of the format [left, top, right, bottom]
 * @param {number} height
 * @param pin
 * @param {string[]} pinned
 * @param {string[]} oob
 * @return {number}
 * @private
 */
function _calculateOOBAndPinnedTop(top, bounds, height, pin, pinned, oob) {
  if (top < bounds[1]) {
    if (pin.indexOf('top') >= 0) {
      top = bounds[1];
      pinned.push('top');
    } else {
      oob.push('top');
    }
  }

  if (top + height > bounds[3]) {
    if (pin.indexOf('bottom') >= 0) {
      top = bounds[3] - height;
      pinned.push('bottom');
    } else {
      oob.push('bottom');
    }
  }

  return top;
}

/**
 * Flip X "together"
 * @param {object} tAttachment The target attachment
 * @param {object} eAttachment The element attachment
 * @param {number[]} bounds Array of bounds of the format [left, top, right, bottom]
 * @param {number} width
 * @param targetWidth
 * @param {number} left
 * @private
 */
function _flipXTogether(tAttachment, eAttachment, bounds, width, targetWidth, left) {
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

  return left;
}

/**
 * Flip Y "together"
 * @param {object} tAttachment The target attachment
 * @param {object} eAttachment The element attachment
 * @param {number[]} bounds Array of bounds of the format [left, top, right, bottom]
 * @param {number} height
 * @param targetHeight
 * @param {number} top
 * @private
 */
function _flipYTogether(tAttachment, eAttachment, bounds, height, targetHeight, top) {
  if (tAttachment.top === 'top') {
    if (eAttachment.top === 'bottom' && top < bounds[1]) {
      top += targetHeight;
      tAttachment.top = 'bottom';

      top += height;
      eAttachment.top = 'top';

    } else if (eAttachment.top === 'top' && top + height > bounds[3] && top - (height - targetHeight) >= bounds[1]) {
      top -= height - targetHeight;
      tAttachment.top = 'bottom';

      eAttachment.top = 'bottom';
    }
  }

  if (tAttachment.top === 'bottom') {
    if (eAttachment.top === 'top' && top + height > bounds[3]) {
      top -= targetHeight;
      tAttachment.top = 'top';

      top -= height;
      eAttachment.top = 'bottom';

    } else if (eAttachment.top === 'bottom' && top < bounds[1] && top + (height * 2 - targetHeight) <= bounds[3]) {
      top += height - targetHeight;
      tAttachment.top = 'top';

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

  return top;
}

/**
 * Get all the initial classes
 * @param classes
 * @param {string} classPrefix
 * @param constraints
 * @return {[*, *]}
 * @private
 */
function _getAllClasses(classes, classPrefix, constraints) {
  const allClasses = [getClass('pinned', classes, classPrefix), getClass('out-of-bounds', classes, classPrefix)];

  constraints.forEach((constraint) => {
    const { outOfBoundsClass, pinnedClass } = constraint;
    if (outOfBoundsClass) {
      allClasses.push(outOfBoundsClass);
    }
    if (pinnedClass) {
      allClasses.push(pinnedClass);
    }
  });

  allClasses.forEach((cls) => {
    ['left', 'top', 'right', 'bottom'].forEach((side) => {
      allClasses.push(`${cls}-${side}`);
    });
  });

  return allClasses;
}

export default {
  position({ top, left, targetAttachment }) {
    if (!this.options.constraints) {
      return true;
    }

    let { height, width } = this.cache('element-bounds', () => {
      return getBounds(this.bodyElement, this.element);
    });

    if (width === 0 && height === 0 && !isUndefined(this.lastSize)) {
      // Handle the item getting hidden as a result of our positioning without glitching
      // the classes in and out
      ({ width, height } = this.lastSize);
    }

    const targetSize = this.cache('target-bounds', () => {
      return this.getTargetBounds();
    });

    const { height: targetHeight, width: targetWidth } = targetSize;
    const { classes, classPrefix } = this.options;

    const allClasses = _getAllClasses(classes, classPrefix, this.options.constraints);
    const addClasses = [];

    const tAttachment = extend({}, targetAttachment);
    const eAttachment = extend({}, this.attachment);

    this.options.constraints.forEach((constraint) => {
      let { to, attachment, pin } = constraint;

      if (isUndefined(attachment)) {
        attachment = '';
      }

      let changeAttachX, changeAttachY;
      if (attachment.indexOf(' ') >= 0) {
        [changeAttachY, changeAttachX] = attachment.split(' ');
      } else {
        changeAttachX = changeAttachY = attachment;
      }

      const bounds = getBoundingRect(this.bodyElement, this, to);

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
        top = _flipYTogether(tAttachment, eAttachment, bounds, height, targetHeight, top);
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
        left = _flipXTogether(tAttachment, eAttachment, bounds, width, targetWidth, left);
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
        if (left < bounds[0]) {
          if (eAttachment.left === 'right') {
            left += width;
            eAttachment.left = 'left';
          } else if (eAttachment.left === 'center') {
            left += (width / 2);
            eAttachment.left = 'left';
          }
        }

        if (left + width > bounds[2]) {
          if (eAttachment.left === 'left') {
            left -= width;
            eAttachment.left = 'right';
          } else if (eAttachment.left === 'center') {
            left -= (width / 2);
            eAttachment.left = 'right';
          }
        }
      }

      if (isString(pin)) {
        pin = pin.split(',').map((p) => p.trim());
      } else if (pin === true) {
        pin = ['top', 'left', 'right', 'bottom'];
      }

      pin = pin || [];

      const pinned = [];
      const oob = [];

      left = _calculateOOBAndPinnedLeft(left, bounds, width, pin, pinned, oob);
      top = _calculateOOBAndPinnedTop(top, bounds, height, pin, pinned, oob);

      if (pinned.length) {
        let pinnedClass;
        if (!isUndefined(this.options.pinnedClass)) {
          pinnedClass = this.options.pinnedClass;
        } else {
          pinnedClass = getClass('pinned', classes, classPrefix);
        }

        addClasses.push(pinnedClass);
        pinned.forEach((side) => {
          addClasses.push(`${pinnedClass}-${side}`);
        });
      }

      _addOutOfBoundsClass(oob, addClasses, classes, classPrefix, this.options.outOfBoundsClass);

      if (pinned.indexOf('left') >= 0 || pinned.indexOf('right') >= 0) {
        eAttachment.left = tAttachment.left = false;
      }
      if (pinned.indexOf('top') >= 0 || pinned.indexOf('bottom') >= 0) {
        eAttachment.top = tAttachment.top = false;
      }

      if (tAttachment.top !== targetAttachment.top ||
        tAttachment.left !== targetAttachment.left ||
        eAttachment.top !== this.attachment.top ||
        eAttachment.left !== this.attachment.left) {
        this.updateAttachClasses(eAttachment, tAttachment);
        this.trigger('update', {
          attachment: eAttachment,
          targetAttachment: tAttachment
        });
      }
    });

    defer(() => {
      if (!(this.options.addTargetClasses === false)) {
        updateClasses(this.target, addClasses, allClasses);
      }
      updateClasses(this.element, addClasses, allClasses);
    });

    return { top, left };
  }
};
