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

  // describe('_calculateOOBAndPinnedTop', () => {
  //   const _calculateOOBAndPinnedTop = Constraint.__get__('_calculateOOBAndPinnedTop');
  // });
});
