import { HttpErrorConflictDetailsFactory } from './http-error-conflict-details.factory';
import { HttpErrorDetails } from '../../../../rfc7807/http-error-details';

describe('HttpErrorConflictDetailsFactory', () => {
  describe('create', () => {
    it('should create an HttpErrorDetails at the format wanted for the HTTP Error 409', () => {
      expect(HttpErrorConflictDetailsFactory.create('test_resourceName', 'test_propertyName', 'test type')).toEqual({
        title: 'Conflict',
        detail: 'A test_resourceName with the following test_propertyName already exists.',
        resourceName: 'test_resourceName',
        propertyName: 'test_propertyName',
        type: 'test type',
      } as HttpErrorDetails);
    });
  });
});
