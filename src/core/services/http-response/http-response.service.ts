import { HttpStatus, Injectable } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import internal from 'stream';
import { HttpErrorsDetailsBuilder } from '../../http-error/builder/http-errors-details.builder';
import { ServerErrorResponseHeaders } from '../../http-error/models/server-error-response-headers';
import { ServerErrorResponseOptions } from '../../http-error/models/server-error-response-options.model';
import { HttpErrorDetails } from '../../http-error/rfc7807/http-error-details';

/**
 * Service responsible for sending Http Response
 */
@Injectable()
export class HttpResponseService {
    /**
     * Content type of http response service
     */
    private static readonly CONTENT_TYPE = 'Content-Type';

    /**
     * Content language of http response service
     */
    private static readonly CONTENT_LANGUAGE = 'Content-Language';

    /**
     * Application json of http response service
     */
    private static readonly APPLICATION_JSON = 'application/json';

    /**
     * Application problem json of http response service
     */
    private static readonly APPLICATION_PROBLEM_JSON = 'application/problem+json';

    /**
     * Language en of http response service
     */
    private static readonly LANGUAGE_EN = 'en';

    /**
     * Handle API Success Response.
     * @param response Response object
     * @param statusCode Http status code
     * @param result Result to return
     */
    public static sendSuccess<T>(response: FastifyReply, statusCode: HttpStatus, result?: T) {
        response.code(statusCode);
        response.header(this.CONTENT_TYPE, this.APPLICATION_JSON);
        response.header(this.CONTENT_LANGUAGE, this.LANGUAGE_EN);
        response.send({ data: result });
    }

    /**
     * Handle API Error Response.
     * @param response Response object
     * @param statusCode Http status code
     * @param httpErrorDetails Details of the error following the RFC7807 structure
     */
    public static sendError(response: FastifyReply, statusCode: HttpStatus, httpErrorDetails: HttpErrorDetails): void {
        response
            .code(statusCode)
            .header(this.CONTENT_TYPE, this.APPLICATION_PROBLEM_JSON)
            .header(this.CONTENT_LANGUAGE, this.LANGUAGE_EN)
            .send(httpErrorDetails);
    }

    /**
     * Handle API stream Success Response.
     * @param response Response object
     * @param statusCode Http status code
     * @param result Result to return
     * @param streamPayload The stream
     * @param options Can contain headers and / or response type
     */
    public static sendStreamSuccess(
        response: FastifyReply,
        statusCode: HttpStatus,
        streamPayload: internal.Readable,
        options: ServerErrorResponseOptions
    ) {
        this.addResponseHeaders(response, options.headers);
        response.code(statusCode);
        response.type(options.type);
        response.send(streamPayload);
    }

    /**
     * Handle API stream Error Response.
     * @param response Response object
     * @param statusCode Http status code
     * @param name Error name
     * @param message Error message
     * @param headers Http response headers
     */
    // eslint-disable-next-line max-params
    public static sendStreamError(
        response: FastifyReply,
        statusCode: HttpStatus,
        name: string,
        message: string,
        headers: ServerErrorResponseHeaders
    ) {
        this.addResponseHeaders(response, headers);
        response.code(statusCode);
        response.send(new HttpErrorsDetailsBuilder(name, message).build());
    }

    /**
     * Adds the header to the response
     * @param response Response object
     * @param headers Http response headers
     * @private
     */
    private static addResponseHeaders(response: FastifyReply, headers: ServerErrorResponseHeaders): void {
        Object.keys(headers).forEach((hKey) => {
            response.header(hKey, headers[hKey]);
        });
    }
}
