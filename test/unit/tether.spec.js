import Tether from '../../src/js/tether.js';

describe('Tether', () => {
  let element, target;

  beforeEach(() => {
    element = document.createElement('div');
    element.classList.add('element');
    document.body.appendChild(element);
    target = document.createElement('div');
    target.classList.add('target');
    document.body.appendChild(target);
  });

  afterEach(() => {
    document.body.removeChild(element);
    document.body.removeChild(target);
    element = null;
    target = null;
  });

  describe('destroy()', () => {
    it('removes classes on destroy', () => {
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

  describe('getClass()', () => {
    it('gets default classes when no options set', () => {
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
      expect(element).toHaveClass('tether-element');
      expect(element).not.toHaveClass('tether-target');

      expect(target.classList.length, 'target - tether classes added').toEqual(12);
      expect(target).toHaveClass('tether-target');
      expect(target).not.toHaveClass('tether-element');

      tether.destroy();

      expect(element.classList.length, 'element - destroy sets classes back to initial state').toEqual(1);
      expect(target.classList.length, 'target - destroy sets classes back to initial state').toEqual(1);
    });

    it('gets prefixed classes when classPrefix set', () => {
      expect(element.classList.length, 'element - only one class').toEqual(1);
      expect(target.classList.length, 'target - only one class').toEqual(1);
      const tether = new Tether({
        element: '.element',
        target: '.target',
        attachment: 'top left',
        targetAttachment: 'top right',
        classPrefix: 'foo'
      });

      tether.enable();

      expect(element.classList.length, 'element - foo classes added').toEqual(12);
      expect(element).toHaveClass('foo-element');
      expect(element).not.toHaveClass('foo-target');

      expect(target.classList.length, 'target - foo classes added').toEqual(12);
      expect(target).toHaveClass('foo-target');
      expect(target).not.toHaveClass('foo-element');

      tether.destroy();

      expect(element.classList.length, 'element - destroy sets classes back to initial state').toEqual(1);
      expect(target.classList.length, 'target - destroy sets classes back to initial state').toEqual(1);
    });

    it('gets overridden classes', () => {
      expect(element.classList.length, 'element - only one class').toEqual(1);
      expect(target.classList.length, 'target - only one class').toEqual(1);
      const tether = new Tether({
        element: '.element',
        target: '.target',
        attachment: 'top left',
        targetAttachment: 'top right',
        classes: {
          element: 'my-custom-class',
          target: 'another-one'
        }
      });

      tether.enable();

      expect(element.classList.length, 'element - custom classes added').toEqual(12);
      expect(element).toHaveClass('my-custom-class');
      expect(element).not.toHaveClass('another-one');
      expect(element).not.toHaveClass('tether-element');

      expect(target.classList.length, 'target - custom classes added').toEqual(12);
      expect(target).toHaveClass('another-one');
      expect(target).not.toHaveClass('my-custom-class');
      expect(target).not.toHaveClass('tether-target');

      tether.destroy();

      expect(element.classList.length, 'element - destroy sets classes back to initial state').toEqual(1);
      expect(target.classList.length, 'target - destroy sets classes back to initial state').toEqual(1);
    });

    it('removes classes when false', () => {
      expect(element.classList.length, 'element - only one class').toEqual(1);
      expect(target.classList.length, 'target - only one class').toEqual(1);
      const tether = new Tether({
        element: '.element',
        target: '.target',
        attachment: 'top left',
        targetAttachment: 'top right',
        classes: {
          element: false,
          enabled: false,
          target: false
        }
      });

      tether.enable();

      expect(element.classList.length, 'element - classes added').toEqual(10);
      expect(element).not.toHaveClass('tether-element');
      expect(element).not.toHaveClass('tether-enabled');

      expect(target.classList.length, 'target - classes added').toEqual(10);
      expect(target).not.toHaveClass('tether-target');
      expect(element).not.toHaveClass('tether-enabled');

      tether.destroy();

      expect(element.classList.length, 'element - destroy sets classes back to initial state').toEqual(1);
      expect(target.classList.length, 'target - destroy sets classes back to initial state').toEqual(1);
    });
  });

  describe('defensive DOM removal', () => {
    it('should handle destroy when target is removed from DOM', () => {
      const tether = new Tether({
        element: '.element',
        target: '.target',
        attachment: 'top left',
        targetAttachment: 'top right'
      });

      tether.enable();
      
      // Disable first to prevent any positioning attempts
      tether.disable();

      // Remove target from DOM before destroying tether
      const originalTarget = target;
      document.body.removeChild(target);

      // This should not throw an error
      tether.destroy();

      // Clean up element - it might have been moved by tether
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      
      // Put element back in body for afterEach
      if (!element.parentNode) {
        document.body.appendChild(element);
      }

      // Reset target to a new one for afterEach
      target = document.createElement('div');
      target.classList.add('target');
      document.body.appendChild(target);
    });

    it('should handle destroy when element is removed from DOM', () => {
      const tether = new Tether({
        element: '.element',
        target: '.target',
        attachment: 'top left',
        targetAttachment: 'top right'
      });

      tether.enable();
      
      // Disable first to prevent any positioning attempts
      tether.disable();

      // Remove element from DOM before destroying tether
      const currentParent = element.parentNode;
      if (currentParent) {
        currentParent.removeChild(element);
      }

      // This should not throw an error
      tether.destroy();

      // Reset element for afterEach
      element = document.createElement('div');
      element.classList.add('element');
      document.body.appendChild(element);
    });

    it('should handle destroy when both element and target are removed from DOM', () => {
      const tether = new Tether({
        element: '.element',
        target: '.target',
        attachment: 'top left',
        targetAttachment: 'top right'
      });

      tether.enable();
      
      // Disable first to prevent any positioning attempts
      tether.disable();

      // Remove both from DOM before destroying tether
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      if (target.parentNode) {
        target.parentNode.removeChild(target);
      }

      // This should not throw an error
      tether.destroy();

      // Reset for afterEach
      element = document.createElement('div');
      element.classList.add('element');
      document.body.appendChild(element);
      target = document.createElement('div');
      target.classList.add('target');
      document.body.appendChild(target);
    });
  });
});
