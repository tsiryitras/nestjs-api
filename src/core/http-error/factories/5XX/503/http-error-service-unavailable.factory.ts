import { HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { HttpResponseService } from '../../../../services/http-response/http-response.service';
import { HttpErrorServiceUnavailableDetailsFactory } from './details/http-error-service-unavailable-details.factory';

/**
 * Handles the generation of Service Unavailable HTTP errors to create the Fastify response with a formatted payload
 * following the RFC7807
 */
export class HttpErrorServiceUnavailableFactory {
    /**
     * Creates the properly formatted reply for a Service Unavailable error. An id is generated to enable the
     * possibility for the user to give this identifier, facilitating the resolution of the error.
     * @param reply Fastify reply that need to be filled up
     * @param type URL of the online documentation that can lead the recipient to solve this error
     */
    static create(reply: FastifyReply, type?: string): void {
        HttpResponseService.sendError(
            reply,
            HttpStatus.SERVICE_UNAVAILABLE,
            HttpErrorServiceUnavailableDetailsFactory.create(type)
        );
    }
}
