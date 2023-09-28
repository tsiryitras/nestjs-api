import { HttpErrorBadGatewayDetailsFactory } from './http-error-bad-gateway-details.factory';

describe('HttpErrorBadGatewayDetailsFactory', () => {
  describe('create', () => {
    it('should create an HttpErrorDetails at the format wanted for the HTTP Error 502', () => {
      expect(HttpErrorBadGatewayDetailsFactory.create('test type')).toEqual({
        title: 'Bad Gateway',
        detail: 'The server encountered a temporary error and could not complete your request.',
        type: 'test type',
      });
    });
  });
});
