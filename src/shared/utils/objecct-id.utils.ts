import mongoose from 'mongoose';
/**
 * Check if a string is a valid mongodb object id
 * @param str any value
 * @returns true if string is a valid mongodb object id
 */
export const isMongoDbObjectId = (val: string | number | boolean | null): boolean =>
    `${val}`.length === 24 && new mongoose.Types.ObjectId(`${val}`).toString() === `${val}`;
