import { FastifyReply } from 'fastify';
import { HttpResponseService } from '../../../services/http-response/http-response.service';
import { HttpErrorInternalServerErrorFactory } from '../5XX/500/http-error-internal-server-error.factory';
import { HttpErrorServiceUnavailableDetailsFactory } from '../5XX/503/details/http-error-service-unavailable-details.factory';
import { HttpErrorDefaultDetailsFactory } from './details/http-error-default-details.factory';

/**
 * Handles any error that cannot be handled by another factory. It can either be an HTTP error that has not be handled
 * properly by the corresponding factory, an HTTP error that has no dedicated factory or an classic error of the code
 * that has not be caught and migrate to the top level of the backend.
 */
export class HttpErrorDefaultFactory {
    /**
     * Generates an Internal Server Error payload if no title or no status code has been given. In the other cases, it
     * generates a proper RFC7807 formatted error payload for status that has no dedicated factory.
     * @param reply Fastify reply that need to be filled up
     * @param statusCode Status code of the error that need to be declared
     * @param title Title of the RFC7807 error body. It is often the name of the error that has showed up.
     * @param details Details of the error that can be added to inform the recipient with precisions
     * @param type URL of the online documentation that can lead the recipient to solve this error
     */
    // eslint-disable-next-line max-params
    static create(reply: FastifyReply, statusCode: number, title: string, details?: string, type?: string): void {
        if (!statusCode || !title) {
            HttpErrorInternalServerErrorFactory.create(reply, type);
        }

        HttpErrorServiceUnavailableDetailsFactory.create(type);
        HttpResponseService.sendError(reply, statusCode, HttpErrorDefaultDetailsFactory.create(title, details, type));
    }
}
