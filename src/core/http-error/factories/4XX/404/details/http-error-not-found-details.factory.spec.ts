import { HttpErrorNotFoundDetailsFactory } from './http-error-not-found-details.factory';

describe('HttpErrorNotFoundDetailsFactory', () => {
  describe('create', () => {
    it('should create an HttpErrorDetails at the format wanted for the HTTP Error 404', () => {
      expect(HttpErrorNotFoundDetailsFactory.create('test_resourceName', 'test type')).toEqual({
        title: 'Not Found',
        detail: 'The resource ‘test_resourceName’ cannot be found.',
        resourceName: 'test_resourceName',
        type: 'test type',
      });
    });
  });
});
