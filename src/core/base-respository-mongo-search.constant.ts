/** =======================================================================
 *   THIS FILE CONTAINS CONSTANTS FUNCTION NEEDED FOR MONGODB ATLAS SEARCH
 *  ======================================================================= */

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
import { ListCriteria } from '../shared/types/list-criteria.class';
import { parseQueryParams } from '../shared/utils/query-parser.utils';

/**
 *  Atlas Search condition builder functions dictionnary
 * Key of dictionnary is FilterType
 * Value of dictionnary is a callback returning a mongo query condition
 */
const mongoSearchFilterBuilders: Record<
    FilterType,
    (filterField: string, filterValue: Search | Range | Progress | Period | List | Bool) => object
> = {
    [FilterType.LIST]: (filterField: string, filterValue: List) => ({
        text: {
            query: filterValue.list,
            path: filterField,
        },
    }),
    [FilterType.SEARCH]: (filterField: string, filterValue: Search) => ({
        wildcard: {
            query: `*${filterValue.search}*`,
            path: filterField,
        },
    }),
    [FilterType.PERIOD]: (filterField: string, filterValue: Period) => ({
        range: {
            ...(filterValue.from ? { gte: new Date(filterValue.from) } : {}),
            ...(filterValue.to ? { lte: new Date(filterValue.to) } : {}),
            path: filterField,
        },
    }),
    [FilterType.RANGE]: (filterField: string, filterValue: Range) => ({
        range: {
            ...(filterValue.min ? { gte: filterValue.min } : {}),
            ...(filterValue.max ? { lte: filterValue.max } : {}),
            path: filterField,
        },
    }),
    [FilterType.PROGRESS]: (filterField: string, filterValue: Progress) => ({
        range: {
            gte: filterValue.minProgress,
            lte: filterValue.maxProgress,
            path: filterField,
        },
    }),
    [FilterType.BOOL]: (filterField: string, filterValue: Bool) => ({
        equals: {
            value: filterValue.bool,
            path: filterField,
        },
    }),
};

/**
 * Force any value to be an array
 * @param value any value
 * @returns Array of value
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toArray = (value: any): any[] => (Array.isArray(value) ? value : [value]);

/**
 * Sort scores result
 * @param scoreValues list of score with value
 * @returns sorted scores
 */
const sortScoreValues = (scoreValues) => scoreValues.sort((a, b) => b.score - a.score);

/**
 * Build an Atlas Search query condition operator from a ParsedFilter depending on filter type
 * @param filterField mongo field
 * @param parsedFilter parsed filter
 * @returns Mongo query operator
 */
const parsedFilterToMongoSearchFilter = (filterField: string, parsedFilter: ParsedFilter): object =>
    mongoSearchFilterBuilders[parsedFilter.type](filterField, parsedFilter);

/**
 * Build filter criteria according to filter
 * @param filter Filter
 * @returns Object representing filter related criteria
 */
const buildMongoFilter = (filter: Filter | undefined): Object[] => {
    const parsedFilter: ParsedFilters = {};
    for (const [key, value] of Object.entries(filter)) {
        const [field, type] = key.split(':');
        const filterType = PARSED_FILTER_TYPE_MAP[type];
        parsedFilter[field] = parsedFilter[field] || ({} as ParsedFilter);
        parsedFilter[field].type = filterType;
        parsedFilter[field][type] = filterType === FilterType.LIST ? toArray(value) : value;
    }
    const filterCriteria = Object.entries(parsedFilter).map(([key, value]) => parsedFilterToMongoSearchFilter(key, value));
    return filterCriteria;
};

/**
 * Build search criteria
 * @param searchValue search value
 * @returns Array representing atlas search filter
 */
const buildMongoSearch = (searchValue: string, searchFields: string[]): Object[] => {
    if (!searchValue) {
        return [];
    }
    return [
        {
            wildcard: {
                query: `*${searchValue}*`,
                path: searchFields,
                allowAnalyzedField: true,
            },
        },
    ];
};

/**
 * Build atlas search autocomplete stage
 * @param index mongodb index
 * @param query query text
 * @param searchFields list of mongodb fields that support autocomplete
 * @returns Object contains atlas search autocomplete stage
 */
export const buildAutocompleteSearchStage = (index: string, query: string, searchFields: string[]) => ({
    index,
    compound: {
        should: searchFields.map((path) => ({
            autocomplete: {
                query,
                path,
                tokenOrder: 'sequential',
            },
        })),
    },
    highlight: {
        path: searchFields,
    },
});

/**
 * Build atlas search stage
 * @param index mongodb index
 * @param criteria List criteria
 * @returns Object contains asearch stage
 */
export const buildSearchStage = (index: string, criteria: ListCriteria, searchFields: string[]) => {
    const { page, pageSize, search, sortBy, sortOrder, ...filter } = parseQueryParams(criteria);
    return {
        index,
        compound: {
            filter: [
                // Manage filter
                ...buildMongoFilter(filter),
                // Manage search
                ...buildMongoSearch(search, searchFields),
            ],
        },
        // Manage sort
        ...(sortBy && sortOrder ? { sort: { [sortBy]: sortOrder } } : {}),
    };
};

/**
 * Format autocomplete result to have a list of suggestions
 * @param results mongodb result
 * @returns a list of suggestions
 */
export const formatSearchAutocompleteResult = (results): string[] => {
    let scoreValues = [];
    results.forEach((item) =>
        item.highlights.forEach((highlight) => {
            const value = highlight.texts[0].value;
            if (scoreValues.findIndex((scoreValue) => scoreValue.value === value) === -1) {
                scoreValues.push({
                    score: highlight.score,
                    value,
                });
            }
        })
    );
    scoreValues = sortScoreValues(scoreValues).map((scoreValue) => scoreValue.value);
    return scoreValues;
};
