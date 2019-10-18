import { addClass, getClass, removeClass } from '../../../src/js/utils/classes';

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

  describe('getClass', () => {
    it('returns the key if no other args passed', () => {
      const keyClass = getClass('justKey');

      expect(keyClass).toBe('justKey');
    });

    it('returns the key as the class, if no class by key', () => {
      const classes = { noKey: 'aClassKey' };
      const keyClass = getClass('justKey', classes);

      expect(keyClass).toBe('justKey');
    });

    it('returns the existing declared class by key', () => {
      const classes = { justKey: 'aClassKey' };
      const keyClass = getClass('justKey', classes);

      expect(keyClass).toBe('aClassKey');
    });

    it('returns the value if classes has the key as a truthy value', () => {
      const classes = { justKey: 'otherValue' };
      const keyClass = getClass('justKey', classes);

      expect(keyClass).toBe('otherValue');
    });

    it('returns the empty string if classes has the key as a boolean false', () => {
      const classes = { justKey: false };
      const keyClass = getClass('justKey', classes);

      expect(keyClass).toBe('');
    });

    it('returns the key with a classPrefix if no classes value for the key', () => {
      const keyClass = getClass('justKey', {}, 'testPrefix');

      expect(keyClass).toBe('testPrefix-justKey');
    });
  });
});
