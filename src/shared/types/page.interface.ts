/**
 * Represent a Page for pagination logic
 */
export interface Page {
    /**
     * Current page
     */
    page: number;

    /**
     * Page size
     */
    pageSize: number;
}

/**
 * Generic interface for getPaginated function
 * T represents the type/class of the resource
 */
export interface Paginated<T> {
    /**
     * items of T elements for current page
     */
    items: T[];

    /**
     * total items inside database that match the current criteria
     */
    totalItems: number;
}
