import { mongoDbObjectId, sliceRandomlyFrom, takeOneRandomlyFrom } from './faker.utils';

describe('takeOneRandomlyFrom', () => {
    test('returns a random element from the array', () => {
        const items: number[] = [1, 2, 3, 4, 5];
        const result: number = takeOneRandomlyFrom<number>(items);
        expect(items.includes(result)).toEqual(true);
    });

    test('returns undefined if the array is empty', () => {
        const items: number[] = [];
        const result: number = takeOneRandomlyFrom(items);
        expect(result).toBeUndefined();
    });
});

describe('sliceRandomlyFrom an array of numbers', () => {
    test('returns a subarray of items', () => {
        const items: number[] = [1, 2, 3, 4, 5];
        const result: number[] = sliceRandomlyFrom(items);
        expect(result.length).toBeLessThanOrEqual(items.length);
    });

    test('returns an empty array if the input array is empty', () => {
        const items: number[] = [];
        const result = sliceRandomlyFrom(items);
        expect(result).toEqual([]);
    });
});

describe('mongoDbObjectId', () => {
    test('returns a string', () => {
        const result = mongoDbObjectId();
        expect(typeof result).toEqual('string');
    });

    test('returns a non-empty string', () => {
        const result = mongoDbObjectId();
        expect(result).toBeTruthy();
    });
});
