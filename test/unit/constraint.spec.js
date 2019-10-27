import Constraint from '../../src/js/constraint.js';

describe('Constraint', () => {
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
});
