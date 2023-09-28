import { makeValuesArray, parseQueryParams } from './query-parser.utils';

describe('parseQueryParams tests', () => {
    it('should get correct parsing', () => {
        const input: Record<string, string> = {
            booleanField: 'false',
            nullField: 'null',
            numberField: '1234',
        };
        const expected = {
            booleanField: false,
            nullField: null,
            numberField: 1234,
        };
        const result = parseQueryParams(input);
        expect(result).toMatchObject(expected);
    });

    it('Should create an array for field arr', () => {
        const input = {
            arr: 1,
        };

        const expected = {
            arr: [1],
        };
        makeValuesArray(input, ['arr']);
        expect(input).toMatchObject(expected);
    });
});
