import shift from '../../src/js/shift';

describe('Shift', () => {
  describe('position()', () => {
    it('returns undefined when shift option is not set', () => {
      const context = {
        options: {}
      };
      const result = shift.position.call(context, { top: 10, left: 20 });
      expect(result).toBeUndefined();
    });

    it('shifts position with string value (single value applies to both)', () => {
      const context = {
        options: { shift: '10' }
      };
      const result = shift.position.call(context, { top: 10, left: 20 });
      expect(result).toEqual({ top: 20, left: 30 });
    });

    it('shifts position with string value (two values)', () => {
      const context = {
        options: { shift: '10 5' }
      };
      const result = shift.position.call(context, { top: 10, left: 20 });
      expect(result).toEqual({ top: 20, left: 25 });
    });

    it('shifts position with object value', () => {
      const context = {
        options: { shift: { top: 15, left: 25 } }
      };
      const result = shift.position.call(context, { top: 10, left: 20 });
      expect(result).toEqual({ top: 25, left: 45 });
    });

    it('shifts position with function value', () => {
      const shiftFn = jest.fn(() => ({ top: 5, left: 10 }));
      const context = {
        options: { shift: shiftFn }
      };
      const result = shift.position.call(context, { top: 10, left: 20 });
      expect(shiftFn).toHaveBeenCalledWith({ top: 10, left: 20 });
      expect(result).toEqual({ top: 15, left: 30 });
    });

    it('handles function returning string', () => {
      const shiftFn = jest.fn(() => '20 30');
      const context = {
        options: { shift: shiftFn }
      };
      const result = shift.position.call(context, { top: 10, left: 20 });
      expect(result).toEqual({ top: 30, left: 50 });
    });

    it('handles function returning object', () => {
      const shiftFn = jest.fn(() => ({ top: 100, left: 200 }));
      const context = {
        options: { shift: shiftFn }
      };
      const result = shift.position.call(context, { top: 10, left: 20 });
      expect(result).toEqual({ top: 110, left: 220 });
    });

    it('handles negative shift values', () => {
      const context = {
        options: { shift: '-5 -10' }
      };
      const result = shift.position.call(context, { top: 10, left: 20 });
      expect(result).toEqual({ top: 5, left: 10 });
    });
  });
});
