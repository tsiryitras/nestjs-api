import { HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { HttpResponseService } from '../../../../services/http-response/http-response.service';
import { HttpErrorNotFoundDetailsFactory } from './details/http-error-not-found-details.factory';

/**
 * Handles the generation of Not Found HTTP errors to create the Fastify response with a formatted payload following
 * the RFC7807
 */
export class HttpErrorNotFoundFactory {
    /**
     * Creates the properly formatted reply for a Not Found error
     * @param reply Fastify reply that need to be filled up
     * @param resourceName Name of the resource that cannot be found. It is most of the time the subject that cannot be
     *   found (example: user, role, ...)
     * @param type URL of the online documentation that can lead the recipient to solve this error
     */
    static create(reply: FastifyReply, resourceName: string, type?: string): void {
        HttpResponseService.sendError(reply, HttpStatus.NOT_FOUND, HttpErrorNotFoundDetailsFactory.create(resourceName, type));
    }
}
