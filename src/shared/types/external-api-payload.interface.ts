import { AxiosHeaders, RawAxiosRequestHeaders } from 'axios';

/**
 * Represents generic external api Payload
 */
export interface ExternalApiPayload {
    /**
     * Headers
     */
    headers?: RawAxiosRequestHeaders | AxiosHeaders;

    /**
     * Represents query params
     */
    query?: Object;

    /**
     * Represents url params
     */
    params?: Object;
}

/**
 * Represents external api payload fo Post Method
 */
export interface ExternalApiPostPayload<POSTED_DATA_TYPE> extends ExternalApiPayload {
    /**
     * Represents data sent with post method
     */
    data: POSTED_DATA_TYPE;
}
