import { HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { HttpResponseService } from '../../../../services/http-response/http-response.service';
import { HttpErrorRequestTimeoutDetailsFactory } from './details/http-error-request-timeout-details.factory';

/**
 * Handles the generation of Request Timeout HTTP errors to create the Fastify response with a formatted payload
 * following the RFC7807
 */
export class HttpErrorRequestTimeoutFactory {
    /**
     * Creates the properly formatted reply for a Not Found error
     * @param reply Fastify reply that need to be filled up
     * @param type URL of the online documentation that can lead the recipient to solve this error
     */
    static create(reply: FastifyReply, type?: string): void {
        HttpResponseService.sendError(reply, HttpStatus.REQUEST_TIMEOUT, HttpErrorRequestTimeoutDetailsFactory.create(type));
    }
}
