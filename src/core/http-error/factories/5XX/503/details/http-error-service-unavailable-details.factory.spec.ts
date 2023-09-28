import { HttpErrorServiceUnavailableDetailsFactory } from './http-error-service-unavailable-details.factory';

describe('HttpErrorServiceUnavailableDetailsFactory', () => {
    describe('create', () => {
        it('should create an HttpErrorDetails at the format wanted for the HTTP Error 503', () => {
            expect(HttpErrorServiceUnavailableDetailsFactory.create('test type')).toEqual({
                title: 'Service Unavailable',
                // eslint-disable-next-line max-len
                detail: 'The server is temporarily unable to complete your request due to maintenance downtime or capacity problems. Please try again later.',
                type: 'test type',
            });
        });
    });
});
