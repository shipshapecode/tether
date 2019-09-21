import { addOffset, offsetToPx, parseTopLeft } from '../../../src/js/utils/offset';

describe('Utils - offset', () => {
  describe('addOffset', () => {
    it('offsets added together', () => {
      const offset1 = { top: 20, left: 50 };
      const offset2 = { top: 15, left: 10 };
      expect(addOffset(offset1, offset2)).toStrictEqual({ left: 60, top: 35 });
    });
  });

  describe('offsetToPx', () => {
    it('calculates px from %', () => {
      const offset = { left: '30%', top: '20%' };
      const size = { height: 1000, width: 1000 };
      expect(offsetToPx(offset, size)).toStrictEqual({ left: 300, top: 200 });
    });
  });

  describe('parseTopLeft', () => {
    it('splits string to get top/left', () => {
      expect(parseTopLeft('50 100')).toStrictEqual({ left: '100', top: '50' });
    });
  });
});
