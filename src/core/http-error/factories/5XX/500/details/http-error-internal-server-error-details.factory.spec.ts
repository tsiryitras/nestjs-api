import { HttpErrorInternalServerErrorDetailsFactory } from './http-error-internal-server-error-details.factory';

describe('HttpErrorInternalServerErrorDetailsFactory', () => {
    describe('create', () => {
        it('should create an HttpErrorDetails at the format wanted for the HTTP Error 500', () => {
            expect(HttpErrorInternalServerErrorDetailsFactory.create('12345678', 'test type')).toEqual({
                title: 'Internal Server Error',
                trackingIdentifier: '12345678',
                detail:
                    // eslint-disable-next-line max-len
                    'An unexpected error has occurred. Please, record the tracking identifier 12345678 for this request and contact your administrator for more assistance.',
                type: 'test type',
            });
        });
    });
});
