import { HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { HttpResponseService } from '../../../../services/http-response/http-response.service';
import { HttpErrorConflictDetailsFactory } from './details/http-error-conflict-details.factory';

/**
 * Handles the generation of Conflict HTTP errors to create the Fastify response with a formatted payload following the
 * RFC7807
 */
export class HttpErrorConflictFactory {
    /**
     * Creates the properly formatted reply for a Conflict error
     * @param reply Fastify reply that need to be filled up
     * @param resourceName Name of the resource that conflicted. It is most of the time the subject that has generated
     *   the conflict(example: user, role, ...)
     * @param propertyName Name of the property that conflicted. It is most of the time the value that is in conflict
     *   like duplication of a name, an id ...
     * @param type URL of the online documentation that can lead the recipient to solve this error
     */
    static create(reply: FastifyReply, resourceName: string, propertyName: string, type?: string): void {
        HttpResponseService.sendError(
            reply,
            HttpStatus.CONFLICT,
            HttpErrorConflictDetailsFactory.create(resourceName, propertyName, type)
        );
    }
}
