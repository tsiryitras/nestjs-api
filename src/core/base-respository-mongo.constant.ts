/** ===========================================================
 *   THIS FILE CONTAINS CONSTANTS FUNCTION NEEDED FOR MONGODB
 *  =========================================================== */

import {
    Bool,
    Filter,
    FilterType,
    List,
    PARSED_FILTER_TYPE_MAP,
    ParsedFilter,
    ParsedFilters,
    Period,
    Progress,
    Range,
    Search,
} from '../shared/types/filter.interface';

/**
 * Mongo query condition builder functions dictionnary
 * Key of dictionnary is FilterType
 * Value of dictionnary is a callback returning a mongo query condition
 */
const mongoQueryConditionBuilders: Record<FilterType, (filterValue: Search | Range | Progress | Period | List | Bool) => object> =
    {
        [FilterType.LIST]: (filterValue: List) => ({ $in: filterValue.list }),
        [FilterType.SEARCH]: (filterValue: Search) => ({ $regex: `${filterValue.search}`, $options: 'i' }),
        [FilterType.PERIOD]: (filterValue: Period) => ({
            ...(filterValue.from ? { $gte: new Date(filterValue.from) } : {}),
            ...(filterValue.to ? { $lt: new Date(filterValue.to) } : {}),
        }),
        [FilterType.RANGE]: (filterValue: Range) => ({
            ...(filterValue.min ? { $gte: filterValue.min } : {}),
            ...(filterValue.max ? { $lte: filterValue.max } : {}),
        }),
        [FilterType.PROGRESS]: (filterValue: Progress) => ({
            $gte: filterValue.minProgress,
            $lte: filterValue.maxProgress,
        }),
        [FilterType.BOOL]: (filterValue: Bool) => ({ $in: filterValue.bool }),
    };

/**
 * Force any value to be an array
 * @param value any value
 * @returns Array of value
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toArray = (value: any): any[] => (Array.isArray(value) ? value : [value]);

/**
 * Transform and group filter entries from API request to easy to use ParsedFilters form
 * Example:
 * Transform this:
 * {
 *   'fullName:search': 'rak',
 *   'creationDate:from': 'Mon Jun 12 2023 03:00:00 GMT+0300',
 *   'creationDate:to': 'Tue Jun 13 2023 03:00:00 GMT+0300',
 *   'amount:min': 100,
 *   'amount:max': 200,
 *   'status:list': ['PENING', 'DONE']
 * }
 * to this:
 * {
 *    fullName: {
 *       type: 'SEARCH',
 *       search: 'rak'
 *    },
 *    creationDate: {
 *       type: 'PERIOD',
 *       from: 'Mon Jun 12 2023 03:00:00 GMT+0300',
 *       to: 'Tue Jun 13 2023 03:00:00 GMT+0300'
 *    },
 *    amount: {
 *       type: 'RANGE',
 *       min: 100,
 *       max: 200
 *    },
 *    status: {
 *       type: 'LIST',
 *       list: ['PENING', 'DONE']
 *    }
 * }
 * @param filter API request filter
 * @returns ParsedFilters object
 */
export const parseFilter = (filter: Filter): ParsedFilters => {
    const parsed: ParsedFilters = {};
    for (const [key, value] of Object.entries(filter)) {
        const [field, type] = key.split(':');
        const filterType = PARSED_FILTER_TYPE_MAP[type];
        parsed[field] = parsed[field] || ({} as ParsedFilter);
        parsed[field].type = filterType;
        parsed[field][type] = filterType === FilterType.LIST ? toArray(value) : value;
    }
    return parsed;
};

/**
 * Build a mongo query condition operator from a ParsedFilter depending on filter type
 * @param parsedFilter parsed filter
 * @returns Mongo query operator
 */
export const parsedFilterToMongoQueryOperator = (parsedFilter: ParsedFilter): object =>
    mongoQueryConditionBuilders[parsedFilter.type](parsedFilter);
