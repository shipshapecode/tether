import { addClass, removeClass } from '../../src/js/utils/classes';

describe('Utils - classes', () => {
  describe('addClass/removeClass', () => {
    it('adds/removes classes from element', () => {
      const element = document.createElement('div');
      expect(element.classList.length, 'no classes').toEqual(0);

      addClass(element, 'foo bar baz');

      expect(element.classList.length, 'classes added').toEqual(3);
      expect(element.classList.contains('foo'), 'has foo class').toBe(true);
      expect(element.classList.contains('bar'), 'has bar class').toBe(true);
      expect(element.classList.contains('baz'), 'has baz class').toBe(true);

      removeClass(element, 'foo baz');

      expect(element.classList.length, 'classes removed').toEqual(1);
      expect(element.classList.contains('foo'), 'does not have foo class').toBe(false);
      expect(element.classList.contains('bar'), 'has bar class').toBe(true);
      expect(element.classList.contains('baz'), 'does not have baz class').toBe(false);
    });
  });
});
