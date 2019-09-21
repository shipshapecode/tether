import { addOffset, attachmentToOffset, autoToFixedAttachment, offsetToPx, parseTopLeft } from '../../../src/js/utils/offset';

describe('Utils - offset', () => {
  describe('addOffset', () => {
    it('offsets added together', () => {
      const offset1 = { top: 20, left: 50 };
      const offset2 = { top: 15, left: 10 };
      expect(addOffset(offset1, offset2)).toStrictEqual({ left: 60, top: 35 });
    });
  });

  describe('attachmentToOffset', () => {
    it('top left', () => {
      expect(attachmentToOffset({ left: 'left', top: 'top' })).toStrictEqual({ left: 0, top: 0 });
    });

    it('middle center', () => {
      expect(attachmentToOffset({ left: 'center', top: 'middle' })).toStrictEqual({ left: '50%', top: '50%' });
    });

    it('bottom right', () => {
      expect(attachmentToOffset({ left: 'right', top: 'bottom' })).toStrictEqual({ left: '100%', top: '100%' });
    });
  });

  describe('autoToFixedAttachment', () => {
    it('mirror left', () => {
      expect(autoToFixedAttachment(
        { left: 'auto', top: 'top' },
        { left: 'left', top: 'top' }
      )).toStrictEqual({ left: 'right', top: 'top' });
    });

    it('mirror center', () => {
      expect(autoToFixedAttachment(
        { left: 'auto', top: 'top' },
        { left: 'center', top: 'top' }
      )).toStrictEqual({ left: 'center', top: 'top' });
    });

    it('mirror right', () => {
      expect(autoToFixedAttachment(
        { left: 'auto', top: 'top' },
        { left: 'right', top: 'top' }
      )).toStrictEqual({ left: 'left', top: 'top' });
    });

    it('mirror top', () => {
      expect(autoToFixedAttachment(
        { left: 'left', top: 'auto' },
        { left: 'left', top: 'top' }
      )).toStrictEqual({ left: 'left', top: 'bottom' });
    });

    it('mirror middle', () => {
      expect(autoToFixedAttachment(
        { left: 'left', top: 'auto' },
        { left: 'left', top: 'middle' }
      )).toStrictEqual({ left: 'left', top: 'middle' });
    });

    it('mirror bottom', () => {
      expect(autoToFixedAttachment(
        { left: 'left', top: 'auto' },
        { left: 'left', top: 'bottom' }
      )).toStrictEqual({ left: 'left', top: 'top' });
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
