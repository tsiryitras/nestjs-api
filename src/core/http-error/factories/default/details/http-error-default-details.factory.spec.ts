import { HttpErrorDefaultDetailsFactory } from './http-error-default-details.factory';

describe('HttpErrorDefaultDetailsFactory', () => {
  describe('create', () => {
    it('should create an HttpErrorDetails at the format wanted for the HTTP Error', () => {
      expect(HttpErrorDefaultDetailsFactory.create('test_title', 'test_details', 'test type')).toEqual({
        title: 'test_title',
        detail: 'test_details',
        type: 'test type',
      });
    });
  });
});
