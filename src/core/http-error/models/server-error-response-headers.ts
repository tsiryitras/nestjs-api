/**
 * Represents server error response headers
 */
export interface ServerErrorResponseHeaders {
    /**
     * Optional Content type
     */
    'Content-Type'?: string;
    /**
     * Optional Content disposition
     */
    'Content-disposition'?: string;

    /**
     * Optional content language
     */
    'Content-Language'?: string;
}
