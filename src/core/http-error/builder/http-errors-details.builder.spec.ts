/* eslint-disable max-lines-per-function */
import { IllegalArgumentError } from '../../errors/illegal-argument.error';
import { HttpErrorsDetailsBuilder } from './http-errors-details.builder';

describe('HttpErrorsDetailsBuilder', () => {
    let builder: HttpErrorsDetailsBuilder;
    beforeEach(() => {
        builder = new HttpErrorsDetailsBuilder('test');
    });

    it('should be defined', () => {
        expect(builder).toBeDefined();
    });

    describe('setType', () => {
        it('should not throw any Error when passing a correct argument', () => {
            expect(() => builder.setType('test')).not.toThrow();
        });
    });

    describe('setAdditionalInformation', () => {
        it('should set the key "test" with the string "value"', () => {
            builder.setAdditionalInformation('test', 'value');
            expect(builder.build().test).toEqual('value');
        });

        it('should set the key "test" with the correct object', () => {
            builder.setAdditionalInformation('test', { foo: 'bar' });
            expect(builder.build().test).toEqual({ foo: 'bar' });
        });

        it('should not throw any Error when passing a correct argument', () => {
            expect(() => builder.setAdditionalInformation('test', 'value')).not.toThrow();
        });

        it('should throw IllegalArgumentError when passing undefined key', () => {
            expect(() => builder.setAdditionalInformation(undefined, 'value')).toThrowError(IllegalArgumentError);
        });

        it('should throw IllegalArgumentError when passing null key', () => {
            expect(() => builder.setAdditionalInformation(null, 'value')).toThrowError(IllegalArgumentError);
        });

        it('should throw IllegalArgumentError when passing a key with a name already precised in the RFC (title)', () => {
            expect(() => builder.setAdditionalInformation('title', 'value')).toThrowError(IllegalArgumentError);
        });

        it('should throw IllegalArgumentError when passing a key with a name already precised in the RFC (type)', () => {
            expect(() => builder.setAdditionalInformation('type', 'value')).toThrowError(IllegalArgumentError);
        });

        it('should throw IllegalArgumentError when passing a key with a name already precised in the RFC (detail)', () => {
            expect(() => builder.setAdditionalInformation('detail', 'value')).toThrowError(IllegalArgumentError);
        });
    });
});
