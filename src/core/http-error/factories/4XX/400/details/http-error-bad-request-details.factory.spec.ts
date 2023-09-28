import { HttpErrorBadRequestDetailsFactory } from './http-error-bad-request-details.factory';

describe('HttpErrorBadRequestDetailsFactory', () => {
  describe('create', () => {
    it('should create an HttpErrorDetails at the format wanted for the HTTP Error 400', () => {
      expect(HttpErrorBadRequestDetailsFactory.create('test details', 'test type')).toEqual({
        title: 'Bad Request',
        detail: 'The server was unable to process the request sent by the client due to invalid syntax. test details',
        errorDetails: 'test details',
        type: 'test type',
      });
    });
  });
});
