import mongoose from 'mongoose';
import { isMongoDbObjectId } from './objecct-id.utils';

/**
 * Check if value is an object
 * @param value tested value
 * @returns true if value is an object, false otherwise
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isObject = (value: any): boolean => value instanceof Object && value.constructor === Object;

/**
 * Value in query params entries are always string (egg: 'false', 'null', '1', ... )
 * so we have to transform them back to boolean, number, null, ...
 * @param value Objet representing a api request query params
 * @returns query params in which values are parsed
 */
// eslint-disable-next-line complexity, @typescript-eslint/no-explicit-any
export const parseQueryParams = (value: any): any => {
    if (isObject(value)) {
        Object.keys(value).forEach((key) => {
            value[key] = parseQueryParams(value[key]);
        });
        return value;
    }
    if (Array.isArray(value)) {
        return value.map((v) => parseQueryParams(v));
    }
    if (value === 'null') {
        return null;
    }
    if (value === 'false') {
        return false;
    }
    if (value === 'true') {
        return true;
    }
    if (value === '') {
        return '';
    }
    if (isMongoDbObjectId(value)) {
        return new mongoose.Types.ObjectId(value);
    }
    if (/^\d+\.?\d*$/.test(value)) {
        return Number(value);
    }
    return value;
};

/**
 * transform some value of an object into array
 * no object is returned but criteria is modified
 * @param criteria an object representing criteria
 * @param fields fields of criteria which need to be parsed to array
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const makeValuesArray = (criteria: Record<string, any>, fields: string[]): void => {
    for (const field of fields) {
        criteria[field] && (criteria[field] = Array.isArray(criteria[field]) ? criteria[field] : [criteria[field]]);
    }
};
