import * as faker from 'faker';
/**
 * Select random element from an array of items T
 * @param items array of generic items
 * @returns one element took randomly from items
 */
export const takeOneRandomlyFrom = <T>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

/**
 *  Slice randomly an array of generic items T
 * @param items array of generic items
 * @returns sub array of items
 */
export const sliceRandomlyFrom = <T>(items: T[]): T[] => {
    let start: number, end: number;
    do {
        start = Math.floor(Math.random() * items.length);
        end = Math.floor(Math.random() * items.length);
    } while (end < start);
    return items.slice(start, end + 1);
};

/**
 * get random mongodb Object Id
 * @returns mongodb object id
 */
export const mongoDbObjectId = (): string => faker.random.uuid().slice(9).replace(/-/g, '');
