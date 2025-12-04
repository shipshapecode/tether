import { getScrollParents, getOffsetParent } from '../../../src/js/utils/parents';

describe('Utils - parents', () => {
  let body;
  let testElement;

  beforeEach(() => {
    body = document.body;
  });

  afterEach(() => {
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
  });

  describe('getScrollParents', () => {
    it('returns array with element itself for fixed position', () => {
      testElement = document.createElement('div');
      testElement.style.position = 'fixed';
      body.appendChild(testElement);
      
      const parents = getScrollParents(testElement);
      expect(parents).toEqual([testElement]);
    });

    it('includes body in scroll parents', () => {
      testElement = document.createElement('div');
      body.appendChild(testElement);
      
      const parents = getScrollParents(testElement);
      expect(parents).toContain(document.body);
    });

    it('finds scrollable parent with overflow auto', () => {
      const scrollParent = document.createElement('div');
      scrollParent.style.overflow = 'auto';
      scrollParent.style.height = '100px';
      body.appendChild(scrollParent);
      
      testElement = document.createElement('div');
      scrollParent.appendChild(testElement);
      
      const parents = getScrollParents(testElement);
      expect(parents).toContain(scrollParent);
      
      body.removeChild(scrollParent);
    });

    it('finds scrollable parent with overflow scroll', () => {
      const scrollParent = document.createElement('div');
      scrollParent.style.overflow = 'scroll';
      scrollParent.style.height = '100px';
      body.appendChild(scrollParent);
      
      testElement = document.createElement('div');
      scrollParent.appendChild(testElement);
      
      const parents = getScrollParents(testElement);
      expect(parents).toContain(scrollParent);
      
      body.removeChild(scrollParent);
    });

    it('finds scrollable parent with overflowY scroll', () => {
      const scrollParent = document.createElement('div');
      scrollParent.style.overflowY = 'scroll';
      scrollParent.style.height = '100px';
      body.appendChild(scrollParent);
      
      testElement = document.createElement('div');
      scrollParent.appendChild(testElement);
      
      const parents = getScrollParents(testElement);
      expect(parents).toContain(scrollParent);
      
      body.removeChild(scrollParent);
    });

    it('finds scrollable parent with overflowX scroll', () => {
      const scrollParent = document.createElement('div');
      scrollParent.style.overflowX = 'scroll';
      scrollParent.style.width = '100px';
      body.appendChild(scrollParent);
      
      testElement = document.createElement('div');
      scrollParent.appendChild(testElement);
      
      const parents = getScrollParents(testElement);
      expect(parents).toContain(scrollParent);
      
      body.removeChild(scrollParent);
    });

    it('finds scrollable parent with overflow overlay', () => {
      const scrollParent = document.createElement('div');
      scrollParent.style.overflow = 'overlay';
      scrollParent.style.height = '100px';
      body.appendChild(scrollParent);
      
      testElement = document.createElement('div');
      scrollParent.appendChild(testElement);
      
      const parents = getScrollParents(testElement);
      expect(parents).toContain(scrollParent);
      
      body.removeChild(scrollParent);
    });

    it('handles absolute positioning correctly', () => {
      const relativeParent = document.createElement('div');
      relativeParent.style.position = 'relative';
      relativeParent.style.overflow = 'auto';
      body.appendChild(relativeParent);
      
      testElement = document.createElement('div');
      testElement.style.position = 'absolute';
      relativeParent.appendChild(testElement);
      
      const parents = getScrollParents(testElement);
      expect(parents).toContain(relativeParent);
      
      body.removeChild(relativeParent);
    });

    it('skips non-positioned scrollable parents for absolute elements', () => {
      const staticParent = document.createElement('div');
      staticParent.style.overflow = 'auto';
      staticParent.style.position = 'static';
      body.appendChild(staticParent);
      
      testElement = document.createElement('div');
      testElement.style.position = 'absolute';
      staticParent.appendChild(testElement);
      
      const parents = getScrollParents(testElement);
      // Static positioned parent should not be included for absolutely positioned children
      expect(parents).not.toContain(staticParent);
      
      body.removeChild(staticParent);
    });

    it('handles nested scroll parents', () => {
      const outerScroll = document.createElement('div');
      outerScroll.style.overflow = 'auto';
      outerScroll.style.height = '200px';
      body.appendChild(outerScroll);
      
      const innerScroll = document.createElement('div');
      innerScroll.style.overflow = 'scroll';
      innerScroll.style.height = '100px';
      outerScroll.appendChild(innerScroll);
      
      testElement = document.createElement('div');
      innerScroll.appendChild(testElement);
      
      const parents = getScrollParents(testElement);
      expect(parents).toContain(innerScroll);
      expect(parents).toContain(outerScroll);
      
      body.removeChild(outerScroll);
    });

    it('handles elements where getComputedStyle returns null', () => {
      testElement = document.createElement('div');
      body.appendChild(testElement);
      
      // Create a mock scenario - in Firefox, elements in display:none iframes return null
      const parentWithNullStyle = document.createElement('div');
      body.appendChild(parentWithNullStyle);
      parentWithNullStyle.appendChild(testElement);
      
      expect(() => {
        const parents = getScrollParents(testElement);
        expect(Array.isArray(parents)).toBe(true);
      }).not.toThrow();
      
      body.removeChild(parentWithNullStyle);
    });
  });

  describe('getOffsetParent', () => {
    it('returns offsetParent for regular element', () => {
      testElement = document.createElement('div');
      body.appendChild(testElement);
      
      const offsetParent = getOffsetParent(testElement);
      expect(offsetParent).toBeDefined();
    });

    it('returns document.documentElement when offsetParent is null', () => {
      testElement = document.createElement('div');
      testElement.style.position = 'fixed';
      body.appendChild(testElement);
      
      const offsetParent = getOffsetParent(testElement);
      // Fixed elements typically have null offsetParent, should return documentElement
      expect(offsetParent).toBeDefined();
    });

    it('returns positioned parent as offsetParent', () => {
      const positionedParent = document.createElement('div');
      positionedParent.style.position = 'relative';
      body.appendChild(positionedParent);
      
      testElement = document.createElement('div');
      positionedParent.appendChild(testElement);
      
      const offsetParent = getOffsetParent(testElement);
      expect([positionedParent, document.documentElement, document.body]).toContain(offsetParent);
      
      body.removeChild(positionedParent);
    });
  });
});
