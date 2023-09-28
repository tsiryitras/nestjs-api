/**
 * Represents the payload of external api report
 */
export interface ExternalApiReportPayload {
    /**
     * Url
     */
    url: string;

    /**
     * External api name
     */
    externalApiName: string;

    /**
     * Used query parameters
     */
    query?: Object;

    /**
     * Used url params
     */
    params?: Object;

    /**
     * Used data
     */
    data?: Object;

    /**
     * Response from the external server
     */
    response?: Object | string;

    /**
     * Headers
     */
    headers?: Object;

    /**
     * Response status
     */
    status: number;

    /**
     * Method used during api call
     */
    method: 'GET' | 'POST';
}
