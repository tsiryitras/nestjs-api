/**
 * Represents interface of a Filter
 * Consists of key value pair of string
 */
export interface Filter {
    [key: string]: string[] | string;
}

/**
 * Enum representing types of filter (search, period, range and list)
 */
export enum FilterType {
    SEARCH = 'SEARCH',
    PERIOD = 'PERIOD',
    RANGE = 'RANGE',
    LIST = 'LIST',
    PROGRESS = 'PROGRESS',
    BOOL = 'BOOL',
}

/**
 * Search filter with search term
 */
export interface Search {
    search?: string;
}

/**
 * Range filter with optionals min and max
 */
export interface Range {
    min?: number;
    max?: number;
}

/**
 * Progress filter
 */
export interface Progress {
    minProgress: number;
    maxProgress: number;
}

/**
 * Period filter with date from and date to
 */
export interface Period {
    from?: Date;
    to?: Date;
}

/**
 * List filter with list of strings, booleans, ...
 */
export interface List {
    list: Array<string | boolean>;
}

/**
 * Filter on a boolean field
 */
export interface Bool {
    bool: boolean;
}

/**
 * Unified interface representing parsed filter value with the type of filter added to it
 */
export interface ParsedFilter extends Search, Range, Period, List {
    type: FilterType;
}

/**
 * Object combining all filter's values in a parsed easy to use format of form:
 * {
 *   fullName: {
 *       type: 'SEARCH',
 *       search: 'rak'
 *    },
 *    creationDate: {
 *       type: 'PERIOD',
 *       from: 'Mon Jun 12 2023 03:00:00 GMT+0300',
 *       to: 'Tue Jun 13 2023 03:00:00 GMT+0300'
 *    }
 * }
 */
export interface ParsedFilters {
    [key: string]: ParsedFilter;
}

/**
 * Filter operators keywords (min, max, from, to, ...) to FilterType dictionnary
 */
export const PARSED_FILTER_TYPE_MAP: Record<
    'list' | 'search' | 'from' | 'to' | 'min' | 'max' | 'minProgress' | 'maxProgress' | 'bool',
    FilterType
> = {
    search: FilterType.SEARCH,
    from: FilterType.PERIOD,
    to: FilterType.PERIOD,
    min: FilterType.RANGE,
    max: FilterType.RANGE,
    list: FilterType.LIST,
    minProgress: FilterType.PROGRESS,
    maxProgress: FilterType.PROGRESS,
    bool: FilterType.BOOL,
};
