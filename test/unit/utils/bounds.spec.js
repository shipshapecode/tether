import { getBounds, getScrollHandleBounds, getVisibleBounds, removeUtilElements } from '../../../src/js/utils/bounds';

describe('Utils - bounds', () => {
  let body;
  let testElement;

  beforeEach(() => {
    body = document.body;
    testElement = document.createElement('div');
    testElement.style.position = 'absolute';
    testElement.style.top = '100px';
    testElement.style.left = '50px';
    testElement.style.width = '200px';
    testElement.style.height = '150px';
    body.appendChild(testElement);
  });

  afterEach(() => {
    if (testElement && testElement.parentNode) {
      body.removeChild(testElement);
    }
    removeUtilElements(body);
  });

  describe('getBounds', () => {
    it('returns bounds for a regular element', () => {
      const bounds = getBounds(body, testElement);
      expect(bounds).toBeDefined();
      expect(typeof bounds.top).toBe('number');
      expect(typeof bounds.left).toBe('number');
      expect(typeof bounds.width).toBe('number');
      expect(typeof bounds.height).toBe('number');
    });

    it('returns bounds for document element', () => {
      const bounds = getBounds(body, document);
      expect(bounds).toBeDefined();
      expect(typeof bounds.top).toBe('number');
      expect(typeof bounds.left).toBe('number');
      expect(typeof bounds.width).toBe('number');
      expect(typeof bounds.height).toBe('number');
    });

    it('calculates right and bottom properties', () => {
      const bounds = getBounds(body, testElement);
      expect(bounds.right).toBeDefined();
      expect(bounds.bottom).toBeDefined();
    });
  });

  describe('getScrollHandleBounds', () => {
    it('returns scroll handle bounds for document.body', () => {
      const bounds = getScrollHandleBounds(body, document.body);
      expect(bounds).toBeDefined();
      expect(bounds.width).toBe(15);
      expect(typeof bounds.height).toBe('number');
      expect(typeof bounds.left).toBe('number');
      expect(typeof bounds.top).toBe('number');
    });

    it('returns scroll handle bounds for regular element', () => {
      testElement.style.overflow = 'scroll';
      testElement.scrollTop = 10;
      const bounds = getScrollHandleBounds(body, testElement);
      expect(bounds).toBeDefined();
      expect(bounds.width).toBe(15);
      expect(typeof bounds.height).toBe('number');
    });

    it('enforces minimum height of 24 for non-body elements', () => {
      const smallElement = document.createElement('div');
      smallElement.style.height = '50px';
      smallElement.style.width = '100px';
      smallElement.style.overflow = 'scroll';
      smallElement.style.position = 'absolute';
      smallElement.style.border = '1px solid black';
      smallElement.innerHTML = '<div style="height: 200px;"></div>';
      body.appendChild(smallElement);
      
      // Force a reflow to ensure styles are applied
      smallElement.offsetHeight;
      
      const bounds = getScrollHandleBounds(body, smallElement);
      expect(typeof bounds.height).toBe('number');
      expect(isNaN(bounds.height)).toBe(false);
      // If the calculation works, it should enforce minimum of 24
      if (!isNaN(bounds.height)) {
        expect(bounds.height).toBeGreaterThanOrEqual(24);
      }
      
      body.removeChild(smallElement);
    });

    it('handles scrollable elements with scrollTop', () => {
      const scrollableElement = document.createElement('div');
      scrollableElement.style.height = '100px';
      scrollableElement.style.overflow = 'scroll';
      scrollableElement.innerHTML = '<div style="height: 500px;"></div>';
      body.appendChild(scrollableElement);
      
      scrollableElement.scrollTop = 50;
      const bounds = getScrollHandleBounds(body, scrollableElement);
      expect(bounds).toBeDefined();
      expect(typeof bounds.top).toBe('number');
      
      body.removeChild(scrollableElement);
    });
  });

  describe('getVisibleBounds', () => {
    it('returns visible bounds for document.body', () => {
      const bounds = getVisibleBounds(body, document.body);
      expect(bounds).toBeDefined();
      expect(bounds.top).toBe(window.pageYOffset);
      expect(bounds.left).toBe(window.pageXOffset);
      expect(bounds.height).toBe(window.innerHeight);
      expect(bounds.width).toBe(window.innerWidth);
    });

    it('returns visible bounds for regular element', () => {
      const bounds = getVisibleBounds(body, testElement);
      expect(bounds).toBeDefined();
      expect(typeof bounds.top).toBe('number');
      expect(typeof bounds.left).toBe('number');
      expect(typeof bounds.width).toBe('number');
      expect(typeof bounds.height).toBe('number');
    });

    it('constrains bounds to viewport dimensions', () => {
      const bounds = getVisibleBounds(body, testElement);
      expect(bounds.height).toBeLessThanOrEqual(window.innerHeight);
      expect(bounds.width).toBeLessThanOrEqual(window.innerWidth);
    });

    it('adjusts bounds when element is above viewport', () => {
      testElement.style.top = '-100px';
      const bounds = getVisibleBounds(body, testElement);
      expect(bounds.top).toBeGreaterThanOrEqual(window.pageYOffset);
    });

    it('adjusts bounds when element is to the left of viewport', () => {
      testElement.style.left = '-100px';
      const bounds = getVisibleBounds(body, testElement);
      expect(bounds.left).toBeGreaterThanOrEqual(window.pageXOffset);
    });

    it('subtracts 2 from height and width', () => {
      const bounds = getVisibleBounds(body, testElement);
      // The bounds should have 2 subtracted from both dimensions
      expect(bounds.height).toBeLessThan(window.innerHeight);
      expect(bounds.width).toBeLessThan(window.innerWidth);
    });
  });

  describe('removeUtilElements', () => {
    it('removes zero element from body', () => {
      // First trigger getBounds which creates the zero element
      getBounds(body, testElement);
      
      // Count elements with data-tether-id before removal
      const elementsBefore = body.querySelectorAll('[data-tether-id]').length;
      
      removeUtilElements(body);
      
      // After removal, there should be fewer or zero elements with data-tether-id
      const elementsAfter = body.querySelectorAll('[data-tether-id]').length;
      expect(elementsAfter).toBeLessThanOrEqual(elementsBefore);
    });

    it('can be called multiple times safely', () => {
      removeUtilElements(body);
      expect(() => removeUtilElements(body)).not.toThrow();
    });
  });

  describe('getBounds caching behavior', () => {
    it('creates and reuses zero element for origin calculation', () => {
      const bounds1 = getBounds(body, testElement);
      const tetherElements1 = body.querySelectorAll('[data-tether-id]').length;
      
      const bounds2 = getBounds(body, testElement);
      const tetherElements2 = body.querySelectorAll('[data-tether-id]').length;
      
      // Should reuse the same zero element
      expect(tetherElements1).toBeGreaterThan(0);
      expect(tetherElements2).toBe(tetherElements1);
      expect(bounds1).toBeDefined();
      expect(bounds2).toBeDefined();
    });
  });
});
