import Constraint from '../../src/js/constraint.js';

describe('Constraint', () => {
  describe('getBoundingRect()', () => {
    const getBoundingRect = Constraint.__get__('getBoundingRect');
    let element;

    beforeEach(() => {
      element = document.createElement('div');
      element.classList.add('element');
      document.body.appendChild(element);
    });

    afterEach(() => {
      document.body.removeChild(element);
      element = null;
    });

    it('returns null with no args', () => {
      expect(getBoundingRect()).toBeNull();
    });

    it('return bounds from border width when constraint is scrollParent', () => {
      element.style.borderWidth = '4px';
      const scrollParentBounds = getBoundingRect(document.body, { scrollParents: [element] }, 'scrollParent');

      expect(scrollParentBounds).toHaveLength(4);
      expect(scrollParentBounds).toEqual(expect.arrayContaining([4, 4, -4, -4]));
    });

    it('return bounds from current window when constraint is window', () => {
      const windowBounds = getBoundingRect(document.body, { scrollParents: [element] }, 'window');

      expect(windowBounds).toHaveLength(4);
      expect(windowBounds).toEqual(expect.arrayContaining([0, 0, 1024, 768]));
    });

    it('return bounds from document window when constraint is document', () => {
      document.documentElement.style.borderWidth = '0';
      const windowBounds = getBoundingRect(document.body, { scrollParents: [] }, document);

      expect(windowBounds).toHaveLength(4);
      expect(windowBounds).toEqual(expect.arrayContaining([0, 0, 0, 0]));
    });
  });

  describe('_addOutOfBoundsClass()', () => {
    const _addOutOfBoundsClass = Constraint.__get__('_addOutOfBoundsClass');
    let oob;

    beforeEach(() => {
      oob = [];
    });


    it('adds nothing if out of bounds array is empty', () => {
      _addOutOfBoundsClass(oob, [], [], '', '');

      expect(oob).toHaveLength(0);
    });

    it('does not add a class if oob class option is false', () => {
      oob.push('top');
      const addClasses = [];
      _addOutOfBoundsClass(oob, addClasses, {
        'out-of-bounds': false
      });

      expect(addClasses).toHaveLength(2);
      expect(addClasses).toEqual(expect.arrayContaining(['', '-top']));
    });
    it('adds classes for oob prefix and options classes', () => {
      oob.push('top');
      const addClasses = [];
      _addOutOfBoundsClass(oob, addClasses, {
        'out-of-bounds': 'added'
      });

      expect(addClasses).toHaveLength(2);
      expect(addClasses).toEqual(expect.arrayContaining(['added', 'added-top']));
    });

    it('uses extra prefix for outOfBoundsClass', () => {
      oob.push('top');
      const addClasses = [];
      _addOutOfBoundsClass(oob, addClasses, {
        'out-of-bounds': 'added'
      }, '', 'extra');

      expect(addClasses).toHaveLength(2);
      expect(addClasses).toEqual(expect.arrayContaining(['extra', 'extra-top']));
    });
  });

  describe('_calculateOOBAndPinnedLeft', () => {
    const _calculateOOBAndPinnedLeft = Constraint.__get__('_calculateOOBAndPinnedLeft');
    const bounds = [10, 10, 20, 20];
    let left, oob, pinned;

    beforeEach(() => {
      left = 0;
      oob = [];
      pinned = [];
    });

    it('left < leftBound', () => {
      const pin = [];
      const width = 10;

      left = _calculateOOBAndPinnedLeft(left, bounds, width, pin, pinned, oob);
      expect(pinned.includes('left'), 'pinned does not include "left"').toBe(false);
      expect(oob.includes('left'), 'oob includes "left"').toBe(true);
      expect(left, 'left remains the same').toEqual(0);
    });

    it('left < leftBound: pin left', () => {
      const pin = ['left'];
      const width = 10;

      left = _calculateOOBAndPinnedLeft(left, bounds, width, pin, pinned, oob);
      expect(pinned.includes('left'), 'pinned includes "left"').toBe(true);
      expect(oob.includes('left'), 'oob does not include "left"').toBe(false);
      expect(left, 'left set to leftBound').toEqual(10);
    });

    it('left + width > rightBound', () => {
      const pin = [];
      const width = 100;

      left = _calculateOOBAndPinnedLeft(left, bounds, width, pin, pinned, oob);
      expect(pinned.includes('right'), 'pinned does not include "right"').toBe(false);
      expect(oob.includes('right'), 'oob includes "right"').toBe(true);
      expect(left, 'left remains the same').toEqual(0);
    });

    it('left + width > rightBound: pin right', () => {
      const pin = ['right'];
      const width = 100;

      left = _calculateOOBAndPinnedLeft(left, bounds, width, pin, pinned, oob);
      expect(pinned.includes('right'), 'pinned includes "right"').toBe(true);
      expect(oob.includes('right'), 'oob does not include "right"').toBe(false);
      expect(left, 'left set to rightBound - width').toEqual(-80);
    });
  });

  describe('_calculateOOBAndPinnedTop', () => {
    const _calculateOOBAndPinnedTop = Constraint.__get__('_calculateOOBAndPinnedTop');
    const bounds = [10, 10, 20, 20];
    let oob, pinned, top;

    beforeEach(() => {
      top = 0;
      oob = [];
      pinned = [];
    });

    it('top < topBound', () => {
      const pin = [];
      const height = 10;

      top = _calculateOOBAndPinnedTop(top, bounds, height, pin, pinned, oob);
      expect(pinned.includes('top'), 'pinned does not include "top"').toBe(false);
      expect(oob.includes('top'), 'oob includes "top"').toBe(true);
      expect(top, 'top remains the same').toEqual(0);
    });

    it('top < topBound: pin top', () => {
      const pin = ['top'];
      const height = 10;

      top = _calculateOOBAndPinnedTop(top, bounds, height, pin, pinned, oob);
      expect(pinned.includes('top'), 'pinned includes "top"').toBe(true);
      expect(oob.includes('top'), 'oob does not include "top"').toBe(false);
      expect(top, 'top set to topBound').toEqual(10);
    });

    it('top + height > bottomBound', () => {
      const pin = [];
      const height = 100;

      top = _calculateOOBAndPinnedTop(top, bounds, height, pin, pinned, oob);
      expect(pinned.includes('bottom'), 'pinned does not include "bottom"').toBe(false);
      expect(oob.includes('bottom'), 'oob includes "bottom"').toBe(true);
      expect(top, 'top remains the same').toEqual(0);
    });

    it('top + height > bottomBound: pin bottom', () => {
      const pin = ['bottom'];
      const height = 100;

      top = _calculateOOBAndPinnedTop(top, bounds, height, pin, pinned, oob);
      expect(pinned.includes('bottom'), 'pinned includes "bottom"').toBe(true);
      expect(oob.includes('bottom'), 'oob does not "bottom"').toBe(false);
      expect(top, 'top set to bottomBound - height').toEqual(-80);
    });
  });

  describe('_flipXTogether', () => {
    const _flipXTogether = Constraint.__get__('_flipXTogether');
    let bounds, eAttachment, left, targetWidth, tAttachment, width;

    describe('left < leftBounds && tAttachment.left === "left"', () => {
      beforeEach(() => {
        bounds = [10, 10, 20, 20];
        left = 0;
        tAttachment = { left: 'left' };
        targetWidth = 10;
        width = 7;
      });

      it('eAttachment.left === "right"', () => {
        eAttachment = { left: 'right' };
        left = _flipXTogether(tAttachment, eAttachment, bounds, width, targetWidth, left);
        expect(left, 'targetWidth and width added to left').toEqual(17);
        expect(tAttachment.left, 'target attachment flipped to right').toBe('right');
        expect(eAttachment.left, 'element attachment flipped to left').toBe('left');
      });

      it('eAttachment.left === "left"', () => {
        eAttachment = { left: 'left' };
        left = _flipXTogether(tAttachment, eAttachment, bounds, width, targetWidth, left);
        expect(left, 'targetWidth added and width subtracted from left').toEqual(3);
        expect(tAttachment.left, 'target attachment flipped to right').toBe('right');
        expect(eAttachment.left, 'element attachment flipped to right').toBe('right');
      });
    });

    describe('left + width > rightBounds && tAttachment.left === "right"', () => {
      beforeEach(() => {
        bounds = [10, 10, 20, 20];
        left = 0;
        tAttachment = { left: 'right' };
        targetWidth = 100;
        width = 50;
      });

      it('eAttachment.left === "left"', () => {
        eAttachment = { left: 'left' };
        left = _flipXTogether(tAttachment, eAttachment, bounds, width, targetWidth, left);
        expect(left, 'targetWidth and width subtracted from left').toEqual(-150);
        expect(tAttachment.left, 'target attachment flipped to left').toBe('left');
        expect(eAttachment.left, 'element attachment flipped to right').toBe('right');
      });

      it('eAttachment.left === "right"', () => {
        eAttachment = { left: 'right' };
        left = _flipXTogether(tAttachment, eAttachment, bounds, width, targetWidth, left);
        expect(left, 'targetWidth subtracted and width added to left').toEqual(-50);
        expect(tAttachment.left, 'target attachment flipped to left').toBe('left');
        expect(eAttachment.left, 'element attachment flipped to left').toBe('left');
      });
    });

    describe('tAttachment.left === "center"', () => {
      beforeEach(() => {
        bounds = [10, 10, 20, 20];
        left = 0;
        tAttachment = { left: 'center' };
        targetWidth = 100;
        width = 50;
      });

      it('left + width > rightBounds && eAttachment.left === "left"', () => {
        eAttachment = { left: 'left' };
        left = _flipXTogether(tAttachment, eAttachment, bounds, width, targetWidth, left);
        expect(left, 'width subtracted from left').toEqual(-50);
        expect(tAttachment.left, 'target attachment kept as center').toBe('center');
        expect(eAttachment.left, 'element attachment flipped to right').toBe('right');
      });

      it('left < leftBounds && eAttachment.left === "right"', () => {
        eAttachment = { left: 'right' };
        left = _flipXTogether(tAttachment, eAttachment, bounds, width, targetWidth, left);
        expect(left, 'width added to left').toEqual(50);
        expect(tAttachment.left, 'target attachment kept as center').toBe('center');
        expect(eAttachment.left, 'element attachment flipped to left').toBe('left');
      });
    });
  });

  describe('_flipYTogether', () => {
    const _flipYTogether = Constraint.__get__('_flipYTogether');
    let eAttachment, tAttachment;

    describe('tAttachment.top === "top"', () => {
      beforeEach(() => {
        tAttachment = { top: 'top' };
      });

      it('eAttachment.top === "bottom" && top < topBounds', () => {
        eAttachment = { top: 'bottom' };
        const bounds = [10, 10, 75, 75];
        const height = 10;
        const targetHeight = 50;
        let top = 0;
        top = _flipYTogether(tAttachment, eAttachment, bounds, height, targetHeight, top);
        expect(top, 'targetHeight added to top').toEqual(60);
        expect(tAttachment.top, 'target attachment flipped to bottom').toBe('bottom');
        expect(eAttachment.top, 'element attachment flipped to top').toBe('top');
      });

      //TODO figure out better naming for these cases
      it('eAttachment.top === "bottom" && top < topBounds: and then hits second if too', () => {
        eAttachment = { top: 'bottom' };
        const bounds = [10, 10, 20, 20];
        const height = 10;
        const targetHeight = 50;
        let top = 0;
        top = _flipYTogether(tAttachment, eAttachment, bounds, height, targetHeight, top);
        expect(top, 'targetHeight added to top').toEqual(0);
        expect(tAttachment.top, 'target attachment kept as top').toBe('top');
        expect(eAttachment.top, 'element attachment kept as bottom').toBe('bottom');
      });

      it('eAttachment.top === "top" && top + height > bottomBounds && top - (height - targetHeight) >= topBounds', () => {
        eAttachment = { top: 'top' };
        const bounds = [10, 10, 200, 200];
        const height = 175;
        const targetHeight = 100;
        let top = 100;
        top = _flipYTogether(tAttachment, eAttachment, bounds, height, targetHeight, top);
        expect(top, 'top -= height - targetHeight').toEqual(25);
        expect(tAttachment.top, 'target attachment flipped to bottom').toBe('bottom');
        expect(eAttachment.top, 'element attachment kept as bottom').toBe('bottom');
      });
    });

    describe('tAttachment.top === "bottom"', () => {
      beforeEach(() => {
        tAttachment = { top: 'bottom' };
      });

      it('eAttachment.top === "top" && top + height > bottomBounds', () => {
        eAttachment = { top: 'top' };
        const bounds = [10, 10, 75, 75];
        const height = 100;
        const targetHeight = 50;
        let top = 0;
        top = _flipYTogether(tAttachment, eAttachment, bounds, height, targetHeight, top);
        expect(top, 'targetHeight added to top').toEqual(-150);
        expect(tAttachment.top, 'target attachment flipped to top').toBe('top');
        expect(eAttachment.top, 'element attachment flipped to bottom').toBe('bottom');
      });

      it('eAttachment.top === "bottom" && top < topBounds && top + (height * 2 - targetHeight) <= bottomBounds', () => {
        eAttachment = { top: 'bottom' };
        const bounds = [10, 10, 200, 200];
        const height = 100;
        const targetHeight = 50;
        let top = 0;
        top = _flipYTogether(tAttachment, eAttachment, bounds, height, targetHeight, top);
        expect(top, 'targetHeight added to top').toEqual(50);
        expect(tAttachment.top, 'target attachment flipped to top').toBe('top');
        expect(eAttachment.top, 'element attachment flipped to top').toBe('top');
      });
    });

    describe('tAttachment.top === "middle"', () => {
      let bounds, height, targetHeight, top;

      beforeEach(() => {
        bounds = [10, 10, 75, 75];
        height = 100;
        targetHeight = 50;
        top = 0;
        tAttachment = { top: 'middle' };
      });

      it('top + height > bottomBounds && eAttachment.top === "top"', () => {
        eAttachment = { top: 'top' };
        top = _flipYTogether(tAttachment, eAttachment, bounds, height, targetHeight, top);
        expect(top, 'targetHeight added to top').toEqual(-100);
        expect(tAttachment.top, 'target attachment flipped to middle').toBe('middle');
        expect(eAttachment.top, 'element attachment kept as bottom').toBe('bottom');
      });

      it('top < topBounds && eAttachment.top === "bottom"', () => {
        eAttachment = { top: 'bottom' };
        top = _flipYTogether(tAttachment, eAttachment, bounds, height, targetHeight, top);
        expect(top, 'targetHeight added to top').toEqual(100);
        expect(tAttachment.top, 'target attachment flipped to middle').toBe('middle');
        expect(eAttachment.top, 'element attachment flipped to top').toBe('top');
      });
    });
  });

  describe('_getAllClasses', () => {
    const _getAllClasses = Constraint.__get__('_getAllClasses');

    it('returns all the base classes when no changes passed', () => {
      const baseClasses = _getAllClasses({}, '', []);

      expect(baseClasses).toHaveLength(10);
      expect(baseClasses).toEqual(expect.arrayContaining(['pinned',
        'out-of-bounds',
        'pinned-left',
        'pinned-top',
        'pinned-right',
        'pinned-bottom',
        'out-of-bounds-left',
        'out-of-bounds-top',
        'out-of-bounds-right',
        'out-of-bounds-bottom']));
    });

    it('returns all the base classes with the passed prefix', () => {
      const prefixClasses = _getAllClasses({}, 'prefix', []);

      expect(prefixClasses).toHaveLength(10);
      expect(prefixClasses).toEqual(expect.arrayContaining([
        'prefix-pinned',
        'prefix-out-of-bounds',
        'prefix-pinned-left',
        'prefix-pinned-top',
        'prefix-pinned-right',
        'prefix-pinned-bottom',
        'prefix-out-of-bounds-left',
        'prefix-out-of-bounds-top',
        'prefix-out-of-bounds-right',
        'prefix-out-of-bounds-bottom']));
    });

    it('replaces a class when a replacement name is passed', () => {
      const replaceClass = _getAllClasses({
        'pinned': 'stuck'
      }, '', []);

      expect(replaceClass).toHaveLength(10);
      expect(replaceClass).toEqual(expect.arrayContaining([
        'stuck',
        'out-of-bounds',
        'stuck-left',
        'stuck-top',
        'stuck-right',
        'stuck-bottom',
        'out-of-bounds-left',
        'out-of-bounds-top',
        'out-of-bounds-right',
        'out-of-bounds-bottom']));
    });

    it('adds a constraint class and variations for sides', () => {
      const constraintClasses = _getAllClasses({}, '', [{ outOfBoundsClass: 'constraintOob' }]);

      expect(constraintClasses).toHaveLength(15);
      expect(constraintClasses).toContain('constraintOob');
      expect(constraintClasses).toContain('constraintOob-top');
    });
  });
});
