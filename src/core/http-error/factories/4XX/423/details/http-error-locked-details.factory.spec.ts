import { HttpErrorDetails } from '../../../../rfc7807/http-error-details';
import { HttpErrorLockedDetailsFactory } from './http-error-locked-details.factory';

describe('HttpErrorLockedDetailsFactory', () => {
  describe('create', () => {
    it('should create an HttpErrorDetails at the format wanted for the HTTP Error 423', () => {
      expect(HttpErrorLockedDetailsFactory.create('test_errorDetails', 'test type')).toEqual({
        title: 'Locked',
        detail: 'The source or destination resource is locked. test_errorDetails',
        errorDetails: 'test_errorDetails',
        type: 'test type',
      } as HttpErrorDetails);
    });
  });
});
