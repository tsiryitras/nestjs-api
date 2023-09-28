/**
 * Log object
 * @param object Object or Objects to be logged
 * @returns string value of the object
 */
export const logObject = (object: Object | Object[]) => JSON.stringify(object, null, 4);
