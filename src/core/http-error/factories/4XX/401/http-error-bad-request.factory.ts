import { HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { HttpResponseService } from '../../../../services/http-response/http-response.service';
import { HttpErrorUnauthorizedDetailsFactory } from './details/http-error-unauthorized-details.factory';

/**
 * Handles the generation of Bad Request HTTP errors to create the Fastify response with a formatted payload following
 * the RFC7807
 */
export class HttpErrorUnauthorizedFactory {
    /**
     * Creates the properly formatted reply for a Bad Request error
     * @param reply Fastify reply that need to be filled up
     * @param errorDetails Details about the Bad Request error, like the reason why this error is showing up
     * @param type URL of the online documentation that can lead the recipient to solve this error
     */
    static create(reply: FastifyReply, errorDetails?: string, type?: string): void {
        HttpResponseService.sendError(
            reply,
            HttpStatus.UNAUTHORIZED,
            HttpErrorUnauthorizedDetailsFactory.create(errorDetails, type)
        );
    }
}
