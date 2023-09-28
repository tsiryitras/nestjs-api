import { HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { nanoid } from 'nanoid';
import { HttpResponseService } from '../../../../services/http-response/http-response.service';
import { HttpErrorInternalServerErrorDetailsFactory } from './details/http-error-internal-server-error-details.factory';

/**
 * Handles the generation of Internal Server Error HTTP errors to create the Fastify response with a formatted payload
 * following the RFC7807
 */
export class HttpErrorInternalServerErrorFactory {
    /**
     * Creates the properly formatted reply for a Internal Server Error error. An id is generated to enable the
     * possibility for the user to give this identifier, facilitating the resolution of the error.
     * @param reply Fastify reply that need to be filled up
     * @param type URL of the online documentation that can lead the recipient to solve this error
     * @returns the tracking identifier generated
     */
    public static create(reply: FastifyReply, type?: string): string {
        const trackingIdentifier = nanoid();
        HttpResponseService.sendError(
            reply,
            HttpStatus.INTERNAL_SERVER_ERROR,
            HttpErrorInternalServerErrorDetailsFactory.create(trackingIdentifier, type)
        );
        return trackingIdentifier;
    }
}
