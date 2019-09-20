import Tether from '../../src/js/tether.js';

describe('Tether', () => {
  describe('destroy()', () => {
    it('removes classes on destroy', () => {
      const element = document.createElement('div');
      element.classList.add('element');
      document.body.appendChild(element);
      const target = document.createElement('div');
      target.classList.add('target');
      document.body.appendChild(target);
      expect(element.classList.length, 'element - only one class').toEqual(1);
      expect(target.classList.length, 'target - only one class').toEqual(1);
      const tether = new Tether({
        element: '.element',
        target: '.target',
        attachment: 'top left',
        targetAttachment: 'top right'
      });

      tether.enable();

      expect(element.classList.length, 'element - tether classes added').toEqual(12);
      expect(target.classList.length, 'target - tether classes added').toEqual(12);

      tether.destroy();

      expect(element.classList.length, 'element - destroy sets classes back to initial state').toEqual(1);
      expect(target.classList.length, 'target - destroy sets classes back to initial state').toEqual(1);
    });
  });
});
