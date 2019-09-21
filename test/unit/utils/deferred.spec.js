import { defer, flush } from '../../../src/js/utils/deferred';
import { stub } from 'sinon';

describe('Utils - deferred', () => {
  describe('defer/flush', () => {
    it('calls deferred functions when flush is called', () => {
      const stub1 = stub();
      const stub2 = stub();
      defer(stub1);
      defer(stub2);
      expect(stub1.called).toBe(false);
      expect(stub2.called).toBe(false);
      flush();
      expect(stub1.called).toBe(true);
      expect(stub2.called).toBe(true);
    });
  });
});
