import { HttpErrorRequestTimeoutDetailsFactory } from './http-error-request-timeout-details.factory';
import { HttpErrorDetails } from '../../../../rfc7807/http-error-details';

describe('HttpErrorRequestTimeoutDetailsFactory', () => {
  describe('create', () => {
    it('should create an HttpErrorDetails at the format wanted for the HTTP Error 408', () => {
      expect(HttpErrorRequestTimeoutDetailsFactory.create('test type')).toEqual({
        title: 'Request Timeout',
        detail: 'The request has timeout.',
        type: 'test type',
      } as HttpErrorDetails);
    });
  });
});
