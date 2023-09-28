import { HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { HttpResponseService } from '../../../../services/http-response/http-response.service';
import { HttpErrorBadGatewayDetailsFactory } from './details/http-error-bad-gateway-details.factory';

/**
 * Handles the generation of Bad Gateway HTTP errors to create the Fastify response with a formatted payload
 * following the RFC7807
 */
export class HttpErrorBadGatewayFactory {
    /**
     * Creates the properly formatted reply for a Internal Server Error error. An id is generated to enable the
     * possibility for the user to give this identifier, facilitating the resolution of the error.
     * @param reply Fastify reply that need to be filled up
     * @param type URL of the online documentation that can lead the recipient to solve this error
     */
    static create(reply: FastifyReply, type?: string): void {
        HttpResponseService.sendError(reply, HttpStatus.BAD_GATEWAY, HttpErrorBadGatewayDetailsFactory.create(type));
    }
}
