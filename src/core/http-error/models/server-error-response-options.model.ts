import { ServerErrorResponseHeaders } from './server-error-response-headers';

/**
 * Represents server error response option
 */
export interface ServerErrorResponseOptions {
    /**
     * Optional headers
     */
    headers?: ServerErrorResponseHeaders;

    /**
     * Optional stream
     */
    stream?: boolean;

    /**
     * Optional stream
     */
    type?: string;
}
