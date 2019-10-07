import Initialize from '../../src/js/initialize.js';

describe('Initialize', () => {
  const tetherInstance = {
    element: document.createElement('div'),
    target: document.createElement('div'),
    options: { classes: {} }
  };
  let initObj;

  describe('Created with base options', () => {
    beforeEach(() => {
      Initialize.initialize.call(tetherInstance);
    });

    it('has been initilized with marker elements and correct classes', () => {
      expect(tetherInstance.markers.element.el.classList.contains('element-marker')).toEqual(true);
      expect(tetherInstance.markers.target.el.classList.contains('target-marker')).toEqual(true);
      expect(tetherInstance.markers.element.dot.classList.contains('marker-dot')).toEqual(true);
      expect(tetherInstance.markers.target.dot.classList.contains('marker-dot')).toEqual(true);
    });

    describe('Position of markers with offset', () => {
      beforeEach(() => {
        const positionObj = {
          manualOffset: { top: '0', left: '0' },
          manualTargetOffset: { top: '10px', left: '10px' }
        };

        Initialize.position.call(tetherInstance, positionObj);
      });
      it('has the offset options expected', () => {
        expect(tetherInstance.markers.element.dot.style.top).toBe('0px');
        expect(tetherInstance.markers.target.dot.style.top).toBe('10px');
      });
    });
  });

  describe('Created with classPrefix option', () => {
    beforeEach(() => {
      tetherInstance.options.classPrefix = 'shipshape';
      initObj = Initialize.initialize.call(tetherInstance);
    });

    it('has been initilized with marker elements and correct classes', () => {
      expect(initObj.markers.element.el.classList.contains('shipshape-element-marker')).toEqual(true);
      expect(initObj.markers.target.el.classList.contains('shipshape-target-marker')).toEqual(true);
      expect(initObj.markers.element.dot.classList.contains('shipshape-marker-dot')).toEqual(true);
      expect(initObj.markers.target.dot.classList.contains('shipshape-marker-dot')).toEqual(true);
    });
  });
});
