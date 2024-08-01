import { getBounds } from '../../../src/js/utils/bounds';

describe('Utils - bounds', () => {
  describe('get bounds', () => {
    let bodyElement;
    
    beforeEach(() => {
      bodyElement = document.createElement('div');
      document.body.appendChild(bodyElement);
    });
    
    it('should get body offset', () => {
      let bounds;
      const element = document.createElement('div');
      element.style.position = 'absolute';
      element.style.top = '0';
      element.style.left = '0';
      bodyElement.appendChild(element);
      bounds = getBounds(bodyElement, element);

      expect(bounds.top).toEqual(0);
      expect(bounds.left).toEqual(0);

      bodyElement.style.position = 'absolute';
      bodyElement.style.top = '30px';
      bodyElement.style.left = '30px';
      bounds = getBounds(bodyElement, element);
      expect(bounds.top, 'correct top bounds with body offset').toEqual(0);
      expect(bounds.left, 'correct left bounds with body offset').toEqual(0);
    });
    
    afterEach(() => {
      document.body.removeChild(bodyElement);
      bodyElement = null;
    });
  });
});
